import { series, src, dest } from 'gulp';
import gulpSass from 'gulp-sass'; // 处理sass
import dartSass from 'sass';
import autoprefixer from 'gulp-autoprefixer'; // 添加前缀
import cleanCSS from 'gulp-clean-css'; // 压缩css
import path from 'path';

function compile() {
  // 处理scss文件
  const sass = gulpSass(dartSass);
  return src(path.resolve(__dirname, './src/*.scss'))
    .pipe(sass.sync())
    .pipe(autoprefixer({}))
    .pipe(cleanCSS())
    .pipe(dest('./dist'));
}

function copyStyle() {
  return src(path.resolve(__dirname, 'dist/**')).pipe(
    dest(path.resolve(__dirname, '../../dist/theme-chalk'))
  );
}
const buildStyle = series(compile, copyStyle);
export default buildStyle;
