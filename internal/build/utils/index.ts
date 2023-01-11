import type { TaskFunction } from 'gulp';
import { spawn } from 'child_process';
import { projectRoot } from './paths';

export const withTaskName = <T extends TaskFunction>(name: string, fn: T) =>
  Object.assign(fn, { displayName: name });

// node子进程运行脚本
export const run = async (command: string) => {
  return new Promise((resolve) => {
    const [cmd, ...args] = command.split(' '); // 分割命令和参数
    const app = spawn(cmd, args, {
      //spawn()用于使用提供的命令集启动新进程
      cwd: projectRoot,
      stdio: 'inherit', //直接将这个子进程输出共享给父进程
      shell: true
    });
    app.on('close', resolve);
  });
};

// 路径重写
export const pathRewriter = (format: string) => {
  return (id: string) => {
    id = id.replaceAll('@el-study', `study-element-plus/${format}`);
    return id;
  };
};
