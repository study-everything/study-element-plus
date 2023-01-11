import { series, parallel } from 'gulp';
import { genTypes } from './gen-types';
import { run, withTaskName } from './utils';
import { epRoot, outDir } from './utils/paths';

// 拷贝study-element-plus下的packges.json
const copySourceCode = () => async () => {
  await run(`cp ${epRoot}/package.json ${outDir}/package.json`);
};

// 1.打包样式 2.打包工具方法 3.打包所有组件 3.打包每个组件 4.生成一个组件库
export default series(
  withTaskName('clean', () => run('rm -rf ./dist')),
  withTaskName('buildPackages', () => run('pnpm run --filter ./packages/* --parallel build'))
  // parallel(
  //   // 打包packages下的build
  //   withTaskName('buildPackages', () => run('pnpm run --filter ./packages/* --parallel build')),
  //   // 打包study-element-plus
  //   // gulp 任务名  执行对应任务
  //   //  打包全部
  //   withTaskName('buildFullComponent', () => run('pnpm run build buildFullComponent')), //buildFullComponent会传给打包命令后面的参数
  //   //  打包每一个组件
  //   withTaskName('buildComponent', () => run('pnpm run build buildComponent'))
  // ),
  // // 打包组件库入口.d.ts
  // parallel(genTypes, copySourceCode())
);

// 任务执行器 gulp 任务名 就会执行对应任务
export * from './full-component';
export * from './component';
