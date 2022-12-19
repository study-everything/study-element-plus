import DefaultTheme from 'vitepress/theme';

import { ElIcon } from '@el-study/components';
import '@el-study/theme-chalk/src/index.scss';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.use(ElIcon); //在vitepress中注册全局组件
  } //App入口
};
