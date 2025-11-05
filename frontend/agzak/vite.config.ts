import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Agzak',
        short_name: 'Agzak',
        start_url: '/',
        display: 'standalone',
        background_color: '#FAFAFA',
        theme_color: '#FAFAFA',
        // icons: [
        //   {
        //     src: '/agzak-192x192.png',
        //     sizes: '192x192',
        //     type: 'image/png',
        //   },
        //   {
        //     src: '/agzak-512x512.png',
        //     sizes: '512x512',
        //     type: 'image/png',
        //   },
        // ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://k13b102.p.ssafy.io:18082',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
