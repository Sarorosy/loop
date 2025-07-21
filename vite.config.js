import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/v2/',
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'my-assets/[name]-[hash][extname]',
        chunkFileNames: 'my-assets/[name]-[hash].js',
        entryFileNames: 'my-assets/[name]-[hash].js'
      }
    }
  }
})
