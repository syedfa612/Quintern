import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxies API + uploaded files to the Fastify backend on :5000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
  build: {
    // Bigger chunks so the route-level splits are worth it. Avoids the
    // "one chunk per file" fragmentation that some Rollup defaults produce.
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Keep the eagerly-loaded entry small; push third-party deps into a
        // shared chunk so the route chunks stay light.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('@tanstack')) return 'vendor-query';
            if (id.includes('react-router')) return 'vendor-router';
            return 'vendor';
          }
          return undefined;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})
