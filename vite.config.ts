import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`         -> build classique (BrowserRouter, à déployer avec fallback SPA)
// `npm run build:preview` -> fichier unique (HashRouter) pour une prévisualisation hébergée
export default defineConfig(({ mode }) => ({
  base: mode === 'singlefile' ? './' : '/',
  plugins: [react(), ...(mode === 'singlefile' ? [viteSingleFile()] : [])],
  define: { __PREVIEW_MODE__: JSON.stringify(mode === 'singlefile') },
  build: { outDir: mode === 'singlefile' ? 'dist-preview' : 'dist' },
}));
