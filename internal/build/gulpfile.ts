import { series, parallel } from 'gulp';
import { genTypes } from './gen-types';
import { run, withTaskName } from './utils';
import { epRoot, outDir } from './utils/paths';

// 拷贝study-element-plus下的packges.json
const copySourceCode = () => async () => {
  await run(`cp ${epRoot}/package.json ${outDir}/package.json`);
};

export default series(
  withTaskName('clean', async () => {
    run('rm -rf ./dist');
  }),
  parallel(
    // 打包packages下的build
    withTaskName('buildPackages', async () => {
      run('pnpm run --filter ./packages/** --parallel build');
    }),
    // 打包study-element-plus
    // gulp 任务名  执行对应任务
    //  打包全部
    withTaskName('buildFullComponent', async () => {
      run('pnpm run build buildFullComponent');
    }),
    //  打包每一个组件
    withTaskName('buildComponent', async () => {
      run('pnpm run build buildComponent');
    }),
    // 打包组件库入口.d.ts
    series(genTypes, copySourceCode())
  )
);

export * from './full-component';
export * from './component';
