import { createApp } from 'vue';
import { ElIcon } from '@el-study/components';
import App from './app.vue';
import '@el-study/theme-chalk/src/index.scss';
const app = createApp(App);

console.log(ElIcon, '-------');

const plugins = [ElIcon];
plugins.forEach((plugin) => app.use(plugin)); //将组件注册成了全局组件,可以直接使用

app.mount('#app');
