import { ElIcon } from '@el-study/components';
import type { App } from 'vue';

// 所有组件注册
const components = [ElIcon];
const install = (app: App) => {
  // 组件
  // 指令 app.directive()
  components.forEach((component) => app.use(component));
};

export default {
  install
};

// app.use(ElIcon)

export * from '@el-study/components'; // 按需
// import {ElIcon} from  'study-element-plus'
