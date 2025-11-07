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
      manifest: false,
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
