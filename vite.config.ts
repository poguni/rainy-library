/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// 색은 tokens.css의 종이 서재 바탕(--color-bg / --theme-color-meta)과 같은 값입니다.
const PAPER_BG = '#F1EADD';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // W-01 설치, W-02 오프라인: 앱 파일·환경음·글꼴을 처음 설치할 때 모두 저장해 둡니다.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeManifestIcons: false, // public/의 아이콘은 아래 globPatterns로 이미 들어감(중복 방지)
      manifest: {
        name: '빗소리 서재',
        short_name: '빗소리 서재',
        description: '빗소리와 함께 책 읽는 시간을 재고 기록하는 독서 타이머',
        lang: 'ko',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: PAPER_BG,
        theme_color: PAPER_BG,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,m4a,txt}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 카페 음원(약 1.1MB)도 들어가게
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
