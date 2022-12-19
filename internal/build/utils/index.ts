import type { TaskFunction } from 'gulp';
import { spawn } from 'child_process';
import { projectRoot } from './paths';

export const withTaskName = <T extends TaskFunction>(name: string, fn: T) =>
  Object.assign(fn, { displayName: name });

export const run = async (command: string) => {
  return new Promise((resolve) => {
    const [cmd, ...args] = command.split(' ');
    const app = spawn(cmd, args, {
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
    id = id.replaceAll('@el-study', `el-plus-study/${format}`);
    return id;
  };
};
