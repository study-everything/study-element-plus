import { series, parallel } from 'gulp';
import { sync } from 'fast-glob'; // fast-glob 匹配所有文件夹
import { compRoot, outDir, projectRoot } from './utils/paths';
import path from 'path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import vue from 'rollup-plugin-vue';
import typescript from 'rollup-plugin-typescript2';
import { rollup, OutputOptions } from 'rollup';
import { buildConfig } from './utils/config';
import { pathRewriter, run, withTaskName } from './utils';
import { Project, SourceFile, OutputFile } from 'ts-morph';
import glob from 'fast-glob';
import fs from 'fs/promises';
import * as VueCompiler from '@vue/compiler-sfc';

const buildEachComponent = async () => {
  //打包每个组件
  const files = sync('*', {
    cwd: compRoot,
    onlyDirectories: true //只要文件夹
  });
  // 分别把components 文件夹下的组件 放到dist/es/components下 和 dist/lib/compmonents
  const builds = files.map(async (file: string) => {
    const input = path.resolve(compRoot, file, 'index.ts'); // 每个组件的入口
    // rollup打包
    const config = {
      input,
      plugins: [nodeResolve(), vue(), typescript(), commonjs()],
      external: (id: string) =>
        /^vue/.test(id) ||
        /^@el-study/.test(id) ||
        /^lodash-unified/.test(id) ||
        /^@vue\/shared/.test(id) ||
        /^@vueuse\/core/.test(id)
    };
    const bundle = await rollup(config);
    const options = Object.values(buildConfig).map((config) => ({
      format: config.format,
      file: path.resolve(config.output.path, `components/${file}/index.js`),
      // 重写路径
      paths: pathRewriter(config.output.name) // @el-study => study-element-plus/es  study-element-plus/lib
    }));

    await Promise.all(options.map((option) => bundle.write(option as OutputOptions)));
  });
  return Promise.all(builds);
};

// 生成ts类型
async function genTypes() {
  const project = new Project({
    // 生成.d.ts 需要有一个tsconfig
    compilerOptions: {
      allowJs: true, // 允许js
      declaration: true, // 要声明文件
      emitDeclarationOnly: true, //仅抛出声明
      noEmitOnError: true, //不抛出错误
      outDir: path.resolve(outDir, 'types'), //输出目录
      baseUrl: projectRoot,
      paths: {
        '@el-study/*': ['packages/*']
      },
      skipLibCheck: true, //跳过类库检测
      strict: false //不要严格模式
    },
    tsConfigFilePath: path.resolve(projectRoot, 'tsconfig.json'), //tsconfig路径
    skipAddingFilesFromTsConfig: true //添加文件从ts配置中添加
  });

  const filePaths = await glob('**/*', {
    // ** 任意目录  * 任意文件
    cwd: compRoot, //编译组件里面的所有的文件
    onlyFiles: true, //只要文件
    absolute: true //绝对路径
  });

  const sourceFiles: SourceFile[] = [];

  await Promise.all(
    filePaths.map(async function (file) {
      if (file.endsWith('.vue')) {
        //.vue结尾
        const content = await fs.readFile(file, 'utf8'); //读取文件
        const hasTsNoCheck = content.includes('@ts-nocheck'); //是否包含跳过编译检查
        const sfc = VueCompiler.parse(content); //解析 vue 拿到script  sfc有模板 内容
        const { script, scriptSetup } = sfc.descriptor;
        if (script || scriptSetup) {
          let content = (hasTsNoCheck ? '// @ts-nocheck\n' : '') + (script?.content ?? ''); // script?.content拿到脚本
          if (scriptSetup) {
            // 编译setup
            const compiled = VueCompiler.compileScript(sfc.descriptor, {
              id: 'xxx'
            });
            content += compiled.content;
          }

          const lang = scriptSetup?.lang || script?.lang || 'js';
          const sourceFile = project.createSourceFile(file + `.${lang}`, content);
          sourceFiles.push(sourceFile);
        }
        // if (script) {
        //   const content = script.content; // 拿到脚本
        //   const sourceFile = project.createSourceFile(file + '.ts', content); //加ts后缀 //icon.vue.ts  => icon.vue.d.ts
        //   sourceFiles.push(sourceFile);
        // } else if (scriptSetup) {
        //   // 编译setup
        //   const compiled = VueCompiler.compileScript(sfc.descriptor, {
        //     id: 'xxx'
        //   });
        //   const content = compiled.content; // 拿到脚本  icon.vue.ts  => icon.vue.d.ts
        //   const sourceFile = project.createSourceFile(file + '.ts', content);
        //   sourceFiles.push(sourceFile);
        // }
      } else {
        const sourceFile = project.addSourceFileAtPath(file); // 把所有的ts文件都放在一起 发射成.d.ts文件
        sourceFiles.push(sourceFile);
      }
    })
  );

  await project.emit({
    // 默认是放到内存中的

    emitOnlyDtsFiles: true //只生成声明文件
  });

  // 循环sourceFiles
  const tasks = sourceFiles.map(async (sourceFile: SourceFile) => {
    const emitOutput = sourceFile.getEmitOutput(); //拿到发射脚本文件
    //拿到所有要输出的文件循环
    const tasks = emitOutput.getOutputFiles().map(async (outputFile: OutputFile) => {
      const filepath = outputFile.getFilePath(); //拿到路径
      //创造路径
      await fs.mkdir(path.dirname(filepath), {
        recursive: true //递归创造
      });
      // @el-study => study-element-plus/es -> .d.ts  .d.ts不去commonsjs  lib下查找
      await fs.writeFile(filepath, pathRewriter('es')(outputFile.getText())); //文件写入路径
      // outputFile.getText() 拿到文件内容
      // 路径重写成es
    });
    await Promise.all(tasks);
  });

  await Promise.all(tasks);
}

// 文件拷贝合并
function copyTypes() {
  const src = path.resolve(outDir, 'types/components');
  const copy = (module: string) => {
    const output = path.resolve(outDir, module, 'components'); //module替换目标目录
    return withTaskName(`copyTypes:${module}`, () =>
      run(`cp -r ${src.replaceAll('\\', '/')}/* ${output}`)
    ); //所有文件拷贝 -r 循环拷贝 默认拷贝一层\
  };
  // 并行拷贝 到 es 和 lib目录
  return parallel(copy('es'), copy('lib'));
}

// 打包入口文件
async function buildComponentEntry() {
  const config = {
    input: path.resolve(compRoot, 'index.ts'), //编译根目录下的index.ts
    plugins: [typescript()], //ts->js
    external: () => true
  };
  const bundle = await rollup(config);
  return Promise.all(
    Object.values(buildConfig)
      .map((config) => ({
        format: config.format,
        file: path.resolve(config.output.path, 'components/index.js') //放到components目录下
      }))
      .map((config) => bundle.write(config as OutputOptions))
  );
}

export const buildComponent = series(
  buildEachComponent,
  genTypes,
  copyTypes(),
  buildComponentEntry
);
