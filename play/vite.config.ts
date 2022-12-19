import { defineConfig } from 'vite';
import DefineOptions from 'unplugin-vue-define-options/vite';
import vue from '@vitejs/plugin-vue';
import jsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  plugins: [vue(), DefineOptions(), jsx()]
});
