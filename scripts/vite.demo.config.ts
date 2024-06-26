import path from 'path';
import { defineConfig } from 'vite';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vueJsx(),
    tsconfigPaths({
      projects: [path.resolve(__dirname, '../tsconfig.json')],
    }),
  ],
});
