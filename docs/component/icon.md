## 图标

# Icon 图标

Element Plus 提供了一套常用的图标集合。

```
$ pnpm install @element-plus/icons-vue
```

## 使用图标

- 如果你想像用例一样直接使用，你需要全局注册组件，才能够直接在项目里使用。

<script setup lang="ts">
import { Edit,Share,Delete,Loading,Search } from '@element-plus/icons-vue'
</script>

<p>
通过添加额外的类名 <b>is-loading</b>，你的图标就可以在 2 秒内旋转 360 度，当然你也可以自己改写想要的动画。
</p>
<el-icon :size="20">
  <Edit />
</el-icon>
<el-icon color="#409EFC" class="no-inherit">
  <Share />
</el-icon>
<el-icon>
  <Delete />
</el-icon>
<el-icon class="is-loading">
  <Loading />
</el-icon>

<el-icon style="vertical-align: middle">
  <Search />
</el-icon>

```vue
<script setup lang="ts">
import { Edit,Share,Delete,Loading,Search } from '@element-plus/icons-vue'
</script>
<template>
  <p>
    with extra class <b>is-loading</b>, your icon is able to rotate 360 deg in 2
    seconds, you can also override this
  </p>
  <el-icon :size="20">
    <Edit />
  </el-icon>
  <el-icon color="#409EFC" class="no-inherit">
    <Share />
  </el-icon>
  <el-icon>
    <Delete />
  </el-icon>
  <el-icon class="is-loading">
    <Loading />
  </el-icon>
  <el-button type="primary">
    <el-icon style="vertical-align: middle">
      <Search />
    </el-icon>
    <span style="vertical-align: middle"> Search </span>
  </el-button>
</template>
```

## 直接使用 SVG 图标

```vue
<template>
  <div style="font-size: 20px">
    <!-- 由于SVG图标默认不携带任何属性 -->
    <!-- 你需要直接提供它们 -->
    <Edit style="width: 1em; height: 1em; margin-right: 8px" />
    <Share style="width: 1em; height: 1em; margin-right: 8px" />
    <Delete style="width: 1em; height: 1em; margin-right: 8px" />
    <Search style="width: 1em; height: 1em; margin-right: 8px" />
  </div>
</template>
```
## API

### Icon Props

| 名称  | 类型             | 默认值    | 说明     |
| ----- | ---------------- | --------- | -------- |
| color | string           | 继承颜色 | 图标颜色 |
| size  | number \| string | 继承字体大小 | 图片大小 |

### Slots

| 名称  | 说明     |
| ----- | -------- |
| default| 自定义默认内容 |