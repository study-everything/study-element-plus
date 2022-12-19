<template>
  <i :class="ns.b()" :style="style">
    <slot />
  </i>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNamespace } from '@el-study/hooks';
import { addUnit, isUndefined } from '@el-study/utils';
import type { CSSProperties } from 'vue';
import { iconProps } from './icon';

defineOptions({
  name: 'ElIcon'
});

const ns = useNamespace('icon');
const props = defineProps(iconProps);
const style = computed<CSSProperties>(() => {
  const { size, color } = props;
  if (!size && !color) return {};
  return {
    fontSize: isUndefined(size) ? undefined : addUnit(size),
    '--color': color
  };
});

console.log(style);
</script>
