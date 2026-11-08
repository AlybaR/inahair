import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`         -> build classique (BrowserRouter), servi à la racine du domaine (OVH, Netlify, Vercel)
// `npm run build:preview` -> fichier unique (MemoryRouter) pour une prévisualisation hébergée
// BASE_PATH permet de servir le site dans un sous-dossier (GitHub Pages : BASE_PATH=/inahair/).
export default defineConfig(({ mode }) => ({
  base: mode === 'singlefile' ? './' : process.env.BASE_PATH || '/',
  plugins: [react(), ...(mode === 'singlefile' ? [viteSingleFile()] : [])],
  define: { __PREVIEW_MODE__: JSON.stringify(mode === 'singlefile') },
  build: { outDir: mode === 'singlefile' ? 'dist-preview' : 'dist' },
}));
