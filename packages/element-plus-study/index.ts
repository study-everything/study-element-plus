import { ElIcon } from '@el-study/components';
import type { App } from 'vue';

const components = [ElIcon];
const install = (app: App) => {
  components.forEach((component) => app.use(component));
};

export default {
  install
};
export * from '@el-study/components'; // 按需
