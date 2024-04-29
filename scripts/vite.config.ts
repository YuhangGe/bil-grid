import path, { resolve } from 'path';
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
  build: {
    emptyOutDir: false,
    sourcemap: true,
    minify: true,
    lib: {
      entry: resolve(__dirname, '../src/index.tsx'),
      name: 'BilGrid',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        assetFileNames(chunkInfo) {
          if (chunkInfo.name === 'style.css') return 'index.css';
          return chunkInfo.name ?? 'index.js';
        },
      },
    },
  },
});
