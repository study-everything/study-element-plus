// 专门打包util ， 指令 ， hook的

import { series, parallel, src, dest } from 'gulp';
import { buildConfig } from './utils/config';
import path from 'path';
import { outDir, projectRoot } from './utils/paths';
import ts from 'gulp-typescript'; // tsconfig生成新的配置打包
import { run, withTaskName } from './utils';
import { sync } from 'fast-glob';
import { nodeResolve } from '@rollup/plugin-node-resolve'; // 三方面模块解析
import commonjs from '@rollup/plugin-commonjs';
import vue from 'rollup-plugin-vue';
import typescript from 'rollup-plugin-typescript2';
import { rollup, OutputOptions } from 'rollup';

export const buildPackages1 = (dirname: string, name: string) => {
  // 模块规范 cjs  es模块规范
  const tasks = Object.entries(buildConfig).map(([module, config]) => {
    const output = path.resolve(dirname, config.output.name);
    return series(
      withTaskName(`buld:${dirname}`, () => {
        const tsConfig = path.resolve(projectRoot, 'tsconfig.json'); // tsconfig
        const inputs = ['**/*.ts', '!gulpfile.ts', '!node_modules']; //ts编译成js
        return src(inputs)
          .pipe(
            ts.createProject(tsConfig, {
              declaration: true, // 需要生成声明文件
              strict: false, //关掉严格模式
              module: config.module
            })()
          )
          .pipe(dest(output));
      }),
      withTaskName(`copy:${dirname}`, () => {
        // 放到es-> utils 和 lib -> utils
        // 将utils 模块拷贝到dist 目录下的es目录和lib目录
        return src(`${output}/**`).pipe(dest(path.resolve(outDir, config.output.name, name)));
      }),
      withTaskName(`clean:${output}`, () => {
        return run(`rm -rf ${output}`);
      })
    );
  });

  return parallel(...tasks);
};

export const buildPackages = (dirname: string, name: string) => {
  return series(
    withTaskName(`buld:${dirname}`, async () => {
      const files = sync(['**/*.ts', '!gulpfile.ts', '!node_modules', '!package.json'], {
        cwd: dirname,
        objectMode: true
      });
      const filesPath = files.map((item) => {
        return dirname.replaceAll('\\', '/') + '/' + item.path;
      });
      const config = {
        input: filesPath, //编译根目录下的index.ts
        plugins: [nodeResolve(), typescript(), vue(), commonjs()], //ts->js
        external: (id: string) =>
          /^vue/.test(id) ||
          /^@el-study/.test(id) ||
          /^lodash-unified/.test(id) ||
          /^@vue\/shared/.test(id) ||
          /^@vueuse\/core/.test(id)
      };
      const bundle = await rollup(config);
      return Promise.all(
        Object.values(buildConfig)
          .map((config) => ({
            format: config.format,
            file: path.resolve(config.output.path)
          }))
          .map((config) => bundle.write(config as OutputOptions))
      );
      // return Promise.all(
      //   Object.values(buildConfig)
      //     .map((config) => ({
      //       format: config.format,
      //       file: path.resolve(config.output.path, dirname) //放到components目录下
      //     }))
      //     .map((config) => bundle.write(config as OutputOptions))
      // );
    })
  );
  // // 模块规范 cjs  es模块规范
  // const tasks = Object.entries(buildConfig).map(([module, config]) => {
  //   const output = path.resolve(dirname, config.output.name);
  //   // return series(
  //   //   withTaskName(`buld:${dirname}`, () => {
  //   //     const tsConfig = path.resolve(projectRoot, 'tsconfig.json'); // tsconfig
  //   //     const inputs = ['**/*.ts', '!gulpfile.ts', '!node_modules']; //ts编译成js
  //   //     return src(inputs)
  //   //       .pipe(
  //   //         ts.createProject(tsConfig, {
  //   //           declaration: true, // 需要生成声明文件
  //   //           strict: false, //关掉严格模式
  //   //           module: config.module
  //   //         })()
  //   //       )
  //   //       .pipe(dest(output));
  //   //   }),
  //   //   withTaskName(`copy:${dirname}`, () => {
  //   //     // 放到es-> utils 和 lib -> utils
  //   //     // 将utils 模块拷贝到dist 目录下的es目录和lib目录
  //   //     return src(`${output}/**`).pipe(dest(path.resolve(outDir, config.output.name, name)));
  //   //   }),
  //   //   withTaskName(`clean:${output}`, () => {
  //   //     return run(`rm -rf ${output}`);
  //   //   })
  //   // );
  // });

  // return parallel(...tasks);
};
