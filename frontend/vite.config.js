import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React framework
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Export tools separated to keep initial bundle small
          'vendor-pdf': ['jspdf', 'html2canvas'],
          // Icons chunk
          'vendor-icons': ['lucide-react'],
        }
      }
    }
  }
})
