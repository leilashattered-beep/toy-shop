import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Сборка кладётся прямо в public-каталог Laravel,
// поэтому через OSPanel (домен -> backend/public) работает и API, и SPA.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:8000'

  return {
    // Сборка живёт в backend/public/spa, статика — по адресу /spa/...
    base: '/spa/',
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_DEV_PORT || 5173),
      strictPort: false,
      proxy: {
        '/api': { target: proxyTarget, changeOrigin: true },
        '/storage': { target: proxyTarget, changeOrigin: true },
        '/images': { target: proxyTarget, changeOrigin: true }
      }
    },
    build: {
      outDir: path.resolve(__dirname, '../backend/public/spa'),
      emptyOutDir: true,
      chunkSizeWarningLimit: 1200
    }
  }
})
