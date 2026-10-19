import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), {
    name: 'preferences-before-paint',
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        // Run the settings loader before any page content is displayed.
        const result = await build({
          stdin: {
            contents: "import { loadSettings } from './main'; loadSettings();",
            resolveDir: fileURLToPath(new URL('./src', import.meta.url)),
            loader: 'ts',
          },
          define: { 'import.meta.hot': 'undefined' },
          bundle: true,
          write: false,
          format: 'iife',
          minify: true,
          target: 'es2022',
        });
        const script = result.outputFiles[0]!.text.replace(/<\/script/gi, '<\\/script');
        return html.replace('<!-- initial-preferences -->', `<script>${script}</script>`);
      },
    },
  }],
});
