import path from 'path';
import { outDir } from './paths';
export const buildConfig = {
  esm: {
    module: 'ESNext', // tsconfig 输出结果是es6
    format: 'esm', // 需要配置格式化后的模块规范
    output: {
      name: 'es', // 打包dist目录下的哪个目录
      path: path.resolve(outDir, 'es')
    },
    bundle: {
      path: 'study-element-plus/es' //转义路径
    }
  },
  cjs: {
    module: 'CommonJS',
    format: 'cjs',
    output: {
      name: 'lib',
      path: path.resolve(outDir, 'lib')
    },
    bundle: {
      path: 'study-element-plus/lib'
    }
  }
};
export type BuildConfig = typeof buildConfig;
