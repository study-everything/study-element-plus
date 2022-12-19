import { resolve } from 'path';

export const projectRoot = resolve(__dirname, '..', '..', '..');
export const pkgRoot = resolve(projectRoot, 'packages');
export const epRoot = resolve(pkgRoot, 'study-element-plus');
export const compRoot = resolve(pkgRoot, 'components');

export const outDir = resolve(projectRoot, 'dist');
