import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/@firebase') || id.includes('node_modules/firebase')) return 'firebase'
            if (id.includes('node_modules/@mui') || id.includes('node_modules/@emotion') || id.includes('node_modules/react')) return 'ui'
            if (id.includes('node_modules/date-fns')) return 'dates'
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  }
})
