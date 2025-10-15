import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
      '@/modules': '/src/modules',
      '@/types': '/src/types',
      '@/utils': '/src/utils'
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['jspdf', 'html2canvas']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['jspdf', 'html2canvas']
  }
})