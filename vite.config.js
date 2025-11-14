import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
      base: '/flightdeck360/',
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://flight-ticket-backend-40dr.onrender.com',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      global: 'globalThis'
    },
    build: {
      target: 'esnext',
      sourcemap: true,
    }
  }
})