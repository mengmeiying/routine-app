/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = '/routine-app/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Рутина',
        short_name: 'Рутина',
        description: 'Чеклист утренней и вечерней рутины',
        lang: 'ru',
        display: 'standalone',
        start_url: base,
        scope: base,
        theme_color: '#1f3d36',
        background_color: '#f1ede0',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,ico}'] },
    }),
  ],
  test: { environment: 'node' },
});
