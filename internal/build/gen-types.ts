import glob from 'fast-glob';
import { epRoot, outDir, projectRoot } from './utils/paths';
import { Project, ModuleKind, ScriptTarget, SourceFile } from 'ts-morph';
import path from 'path';
import fs from 'fs/promises';
import { parallel, series } from 'gulp';
import { run, withTaskName } from './utils';
import { buildConfig, BuildConfig } from './utils/config';
import { type } from 'os';

//  打包.d.ts
export const genEntryTypes = async () => {
  const files = await glob('*.ts', {
    cwd: epRoot,
    absolute: true,
    onlyFiles: true
  });
  const project = new Project({
    compilerOptions: {
      declaration: true,
      module: ModuleKind.ESNext,
      allowJs: true,
      emitDeclarationOnly: true,
      noEmitOnError: false,
      outDir: path.resolve(outDir, 'entry/types'),
      target: ScriptTarget.ESNext,
      rootDir: epRoot,
      strict: false
    },
    skipFileDependencyResolution: true,
    tsConfigFilePath: path.resolve(projectRoot, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true
  });
  const sourceFiles: SourceFile[] = [];
  files.map((f) => {
    const sourceFile = project.addSourceFileAtPath(f);
    sourceFiles.push(sourceFile);
  });
  await project.emit({
    emitOnlyDtsFiles: true
  });
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
        run(`cp -r ${src}/* ${path.resolve(outDir, buildConfig[module].output.path)}/`)
      )
    );
  return parallel(copy('esm'), copy('cjs'));
};
export const genTypes = series(genEntryTypes, copyEntryTypes());
