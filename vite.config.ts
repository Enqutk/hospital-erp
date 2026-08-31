import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { fileCacheServerPlugin } from './src/utils/fileCacheServerPlugin';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), fileCacheServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/data/**', '**/*.json', '**/hospital_cache*', '**/.git/**'],
      },
    },
  };
});

