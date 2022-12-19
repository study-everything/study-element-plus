// 专门打包util ， 指令 ， hook的

import { series, parallel, src, dest } from 'gulp';
import { buildConfig } from './utils/config';
import path from 'path';
import { outDir, projectRoot } from './utils/paths';
import ts from 'gulp-typescript'; // tsconfig生成新的配置打包
import { withTaskName } from './utils';
export const buildPackages = (dirname: string, name: string) => {
  // 模块规范 cjs  es模块规范
  const tasks = Object.entries(buildConfig).map(([module, config]) => {
    const output = path.resolve(dirname, config.output.name);
    return series(
      withTaskName(`buld:${dirname}`, () => {
        const tsConfig = path.resolve(projectRoot, 'tsconfig.json'); // tsconfig
        const inputs = ['**/*.ts', '!gulpfile.ts', '!node_modules'];
        return src(inputs)
          .pipe(
            ts.createProject(tsConfig, {
              declaration: true, // 需要生成声明文件
              strict: false,
              module: config.module
            })()
          )
          .pipe(dest(output));
      }),
      withTaskName(`copy:${dirname}`, () => {
        // 放到es-> utils 和 lib -> utils
        // 将utils 模块拷贝到dist 目录下的es目录和lib目录
        return src(`${output}/**`).pipe(dest(path.resolve(outDir, config.output.name, name)));
      })
    );
  });

  console.log(tasks);
  return parallel(...tasks);
};
