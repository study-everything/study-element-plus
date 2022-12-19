import { withInstall } from '@el-study/utils';

import _Icon from './src/icon.vue';

export const ElIcon = withInstall(_Icon);

export default ElIcon;
export * from './src/icon';

declare module 'vue' {
  export interface GlobalComponents {
    ElIcon: typeof _Icon;
  }
}
