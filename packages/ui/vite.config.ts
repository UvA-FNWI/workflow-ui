import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'DataNoseUI',
      cssFileName: 'ui',
      fileName: format => `datanose-ui.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-aria', 'react-stately'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-aria': 'ReactAria',
          'react-stately': 'ReactStately',
        },
      },
    },
  },
});
