// 组件属性 ts类型
import type { ExtractPropTypes, PropType } from 'vue';
import type Icon from './icon.vue';

export const iconProps = {
  size: {
    type: [Number, String] as PropType<number | string>
  },
  color: {
    type: String
  }
} as const;

export type IconProps = ExtractPropTypes<typeof iconProps>;
// export type IconInstance = InstanceType<typeof Icon>;
