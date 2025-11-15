// vite.config.ts
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'


export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    base: '/',

    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },

    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        // PWA 테스트(개발에서는 false로 교체)
        devOptions: { enabled: isDev },

        // 배포에 필요한 매니페스트 직접 제공
        manifest: false,

        // SPA 라우팅 & 캐시 전략
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
          // SPA fallback (API는 제외)
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api(\/|$)/],
          // 큰 번들 캐시 필요 시 용량 상향
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        },
        // 정적 에셋
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      }),
    ],

    server: {
      host: true, // 로컬 네트워크 접근 필요 시
      proxy: {
        // 개발용 프록시 (배포에서는 웹서버에서 처리)
        '/api': {
          target: 'http://k13b102.p.ssafy.io:18082',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      outDir: 'dist',
      // sourcemap: false,
      // 배포 번들 최적화 옵션(원하면 사용)
      // minify: 'esbuild',
      // cssCodeSplit: true,
    },

    // console 제거
    // esbuild: { drop: ['console', 'debugger'] },
  }
})
