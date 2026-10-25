import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Relative base so the build works from any sub-path (GitHub Pages) and inside a Capacitor wrapper.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      includeAssets: ['icons/icon-48.png', 'icons/icon-180.png'],
      manifest: {
        name: 'GeoGo',
        short_name: 'GeoGo',
        description: 'Igra za učenje geografije',
        lang: 'sl',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#ffffff',
        theme_color: '#24b4e4',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Everything the game needs is bundled, so precaching the build makes it fully offline.
        globPatterns: ['**/*.{js,css,html,webp,png,woff2,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
    }),
  ],
  // The 50m map data is one ~760 KB chunk by design; it loads in the background.
  build: { chunkSizeWarningLimit: 800 },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
