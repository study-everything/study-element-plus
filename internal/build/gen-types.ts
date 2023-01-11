import glob from 'fast-glob';
import { epRoot, outDir, projectRoot } from './utils/paths';
import { Project, ModuleKind, ScriptTarget, SourceFile } from 'ts-morph';
import path from 'path';
import fs from 'fs/promises';
import { parallel, series } from 'gulp';
import { run, withTaskName } from './utils';
import { buildConfig, BuildConfig } from './utils/config';

// 打包组件库入口文件的声明文件
//  打包.d.ts
export const genEntryTypes = async () => {
  const files = await glob('*.ts', {
    //入口生成.ts文件,指定目录,绝对路径,仅是文件
    cwd: epRoot,
    absolute: true,
    onlyFiles: true
  });
  const project = new Project({
    // 构建ts配置
    compilerOptions: {
      declaration: true, //生成ts文件
      module: ModuleKind.ESNext, //这里Es6
      allowJs: true, //允许js
      emitDeclarationOnly: true, //仅抛出声明
      noEmitOnError: false, //不抛出错误
      outDir: path.resolve(outDir, 'entry/types'), //输出位置在dist/entry/types
      target: ScriptTarget.ESNext,
      rootDir: epRoot,
      strict: false
    },
    skipFileDependencyResolution: true,
    tsConfigFilePath: path.resolve(projectRoot, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true //添加文件从ts配置中添加
  });
  const sourceFiles: SourceFile[] = [];
  files.map((f) => {
    const sourceFile = project.addSourceFileAtPath(f); //循环放入ts文件
    sourceFiles.push(sourceFile);
  });
  // 生成声明文件
  await project.emit({
    emitOnlyDtsFiles: true
  });
  // 写入文件 去掉@el-study
  const tasks = sourceFiles.map(async (sourceFile) => {
    const emitOutput = sourceFile.getEmitOutput();
    for (const outputFile of emitOutput.getOutputFiles()) {
      const filepath = outputFile.getFilePath();
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, outputFile.getText().replaceAll('@el-study', '.'), 'utf8');
    }
  });
  await Promise.all(tasks);
};

//  拷贝entry/.d.ts 到es lib
export const copyEntryTypes = () => {
  const src = path.resolve(outDir, 'entry/types');
  const copy = (module: keyof BuildConfig) =>
    parallel(
      withTaskName(`copyEntryTypes:${module}`, () =>
        run(
          `cp -r ${src}/* ${path
            .resolve(outDir, buildConfig[module].output.path)
            .replaceAll('\\', '/')}/`
        )
      )
    );
  return parallel(copy('esm'), copy('cjs'));
};
export const genTypes = series(genEntryTypes, copyEntryTypes());
