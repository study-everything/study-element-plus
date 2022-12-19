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
import { pathRewriter, run } from './utils';
import { Project, SourceFile, OutputFile } from 'ts-morph';
import glob from 'fast-glob';
import fs from 'fs/promises';
import * as VueCompiler from '@vue/compiler-sfc';

const buildEachComponent = async () => {
  //打包每个组件
  const files = sync('*', {
    cwd: compRoot,
    onlyDirectories: true //文件夹
  });
  // 分别把components 文件夹下的组件 放到dist/es/components下 和 dist/lib/compmonents
  const builds = files.map(async (file: string) => {
    const input = path.resolve(compRoot, file, 'index.ts'); // 每个组件的入口
    // rollup打包
    const config = {
      input,
      plugins: [nodeResolve(), vue(), typescript(), commonjs()],
      external: (id: string) => /^vue/.test(id) || /^@el-study/.test(id)
    };
    const bundle = await rollup(config);
    const options = Object.values(buildConfig).map((config) => ({
      format: config.format,
      file: path.resolve(config.output.path, `components/${file}/index.js`),
      paths: pathRewriter(config.output.name) // @el-study => el-plus-study/es  el-plus-study/lib
    }));

    await Promise.all(options.map((option) => bundle.write(option as OutputOptions)));
  });
  return Promise.all(builds);
};

async function genTypes() {
  const project = new Project({
    // 生成.d.ts 需要有一个tsconfig
    compilerOptions: {
      allowJs: true,
      declaration: true,
      emitDeclarationOnly: true,
      noEmitOnError: true,
      outDir: path.resolve(outDir, 'types'),
      baseUrl: projectRoot,
      paths: {
        '@el-study/*': ['packages/*']
      },
      skipLibCheck: true,
      strict: false
    },
    tsConfigFilePath: path.resolve(projectRoot, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true
  });

  const filePaths = await glob('**/*', {
    // ** 任意目录  * 任意文件
    cwd: compRoot,
    onlyFiles: true,
    absolute: true //绝对路径
  });

  const sourceFiles: SourceFile[] = [];

  await Promise.all(
    filePaths.map(async function (file) {
      if (file.endsWith('.vue')) {
        //.vue结尾
        const content = await fs.readFile(file, 'utf8');
        const sfc = VueCompiler.parse(content); //解析 vue 拿到script
        const { script, scriptSetup } = sfc.descriptor;
        if (script) {
          const content = script.content; // 拿到脚本  icon.vue.ts  => icon.vue.d.ts
          const sourceFile = project.createSourceFile(file + '.ts', content);
          sourceFiles.push(sourceFile);
        } else if (scriptSetup) {
          const content = scriptSetup.content; // 拿到脚本  icon.vue.ts  => icon.vue.d.ts
          const sourceFile = project.createSourceFile(file + '.ts', content);
          sourceFiles.push(sourceFile);
        }
      } else {
        const sourceFile = project.addSourceFileAtPath(file); // 把所有的ts文件都放在一起 发射成.d.ts文件
        sourceFiles.push(sourceFile);
      }
    })
  );
  //生成声明文件
  await project.emit({
    // 默认是放到内存中的
    emitOnlyDtsFiles: true
  });

  const tasks = sourceFiles.map(async (sourceFile: SourceFile) => {
    const emitOutput = sourceFile.getEmitOutput();
    const tasks = emitOutput.getOutputFiles().map(async (outputFile: OutputFile) => {
      const filepath = outputFile.getFilePath();
      await fs.mkdir(path.dirname(filepath), {
        recursive: true
      });
      // @el-study => el-plus-study/es -> .d.ts
      await fs.writeFile(filepath, pathRewriter('es')(outputFile.getText()));
    });
    await Promise.all(tasks);
  });

  await Promise.all(tasks);
}

// 文件拷贝合并
function copyTypes() {
  const src = path.resolve(outDir, 'types/components/');
  const copy = (module: string) => {
    const output = path.resolve(outDir, module, 'components');
    return () => run(`cp -r ${src}/* ${output}`);
  };
  return parallel(copy('es'), copy('lib'));
}

// 打包入口文件
async function buildComponentEntry() {
  const config = {
    input: path.resolve(compRoot, 'index.ts'),
    plugins: [typescript()],
    external: () => true
  };
  const bundle = await rollup(config);
  return Promise.all(
    Object.values(buildConfig)
      .map((config) => ({
        format: config.format,
        file: path.resolve(config.output.path, 'components/index.js')
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
