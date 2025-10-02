import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})
