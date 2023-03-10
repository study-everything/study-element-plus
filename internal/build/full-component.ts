// buildFullComponent 任务
// gulp流程控制和代码转移 没有打包功能

import { nodeResolve } from '@rollup/plugin-node-resolve'; // 三方面模块解析
import commonjs from '@rollup/plugin-commonjs';
import vue from 'rollup-plugin-vue';
import typescript from 'rollup-plugin-typescript2';
import { parallel } from 'gulp';
import path from 'path';
import { outDir, epRoot } from './utils/paths';
import { rollup, OutputOptions } from 'rollup';
import fs from 'fs/promises';
import { buildConfig } from './utils/config';
import { pathRewriter } from './utils';

// 打包全局
const buildFull = async () => {
  // rollup打包配置信息
  const config = {
    input: path.resolve(epRoot, 'index.ts'), // 打包入口
    plugins: [nodeResolve(), typescript(), vue(), commonjs()],
    external: (id: string) => /^vue/.test(id) //不打包vue
  };

  // 使用方式 import 浏览器直接script
  // esm  umd

  const buildConfig = [
    {
      format: 'umd',
      file: path.resolve(outDir, 'index.js'), //打包目的地
      name: 'EPlus', // 全局的名字
      exports: 'named', // 导出的名字 用命名的方式导出
      globals: {
        // 表示使用的vue是全局的
        vue: 'Vue'
      }
    },
    {
      format: 'esm',
      file: path.resolve(outDir, 'index.esm.js')
    }
  ];

  const bundle = await rollup(config);

  return Promise.all(buildConfig.map((config) => bundle.write(config as OutputOptions)));
};

// 打包组件库入口
async function buildEntry() {
  // 读取study-element-plus根目录 携带文件类型
  const entryFiles = await fs.readdir(epRoot, { withFileTypes: true });
  const entryPoints = entryFiles
    .filter((f) => f.isFile())
    .filter((f) => !['package.json'].includes(f.name))
    .map((f) => path.resolve(epRoot, f.name));

  const config = {
    input: entryPoints,
    plugins: [nodeResolve(), vue(), typescript()],
    external: (id: string) => /^vue/.test(id) || /^@el-study/.test(id)
  };
  const bundle = await rollup(config);
  // 重写路径放到es和lib下
  return Promise.all(
    Object.values(buildConfig)
      .map((config) => ({
        format: config.format,
        dir: config.output.path,
        paths: pathRewriter(config.output.name)
      }))
      .map((option) => bundle.write(option as OutputOptions))
  );
}

//  入口生成声明文件

export const buildFullComponent = parallel(buildFull, buildEntry);
