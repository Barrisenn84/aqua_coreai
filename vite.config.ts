import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig} from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'react-vendor',
                test: /node_modules[\\/](react|react-dom|react-is)[\\/]/,
                priority: 30,
              },
              {
                name: 'charts-vendor',
                test: /node_modules[\\/]recharts[\\/]/,
                priority: 25,
              },
              {
                name: 'ui-vendor',
                test: /node_modules[\\/](lucide-react|motion)[\\/]/,
                priority: 20,
              },
              {
                name: 'vendor',
                test: /node_modules/,
                maxSize: 400_000,
                priority: 10,
              },
              {
                name: 'application',
                test: /[\\/]src[\\/]/,
                maxSize: 450_000,
                priority: 5,
              },
            ],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
