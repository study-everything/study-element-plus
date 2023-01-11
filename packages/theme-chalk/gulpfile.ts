import { series, src, dest } from 'gulp';
import gulpSass from 'gulp-sass'; // 处理sass
import dartSass from 'sass';
import autoprefixer from 'gulp-autoprefixer'; // 添加前缀
import cleanCSS from 'gulp-clean-css'; // 压缩css
import path from 'path';
import { run, withTaskName } from '@el-study/build/utils';
import { themeChalkRoot } from '@el-study/build/utils/paths';

// 编译scss
function compile() {
  // 处理scss文件
  const sass = gulpSass(dartSass);
  return src(path.resolve(__dirname, './src/*.scss'))
    .pipe(sass.sync()) //处理scss
    .pipe(autoprefixer({})) //加前缀
    .pipe(cleanCSS()) //压缩
    .pipe(dest('./dist')); //输出
}

function copyStyle() {
  return src(path.resolve(__dirname, 'dist/**')).pipe(
    dest(path.resolve(__dirname, '../../dist/theme-chalk'))
  );
}

const buildStyle = series(
  compile,
  copyStyle,
  withTaskName('clean', async () => {
    run(`rm -rf ${themeChalkRoot}/dist`);
  })
);
export default buildStyle;
