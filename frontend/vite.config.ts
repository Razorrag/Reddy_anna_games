import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh for instant updates during development
      fastRefresh: true,
    })
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // 🚀 PRODUCTION OPTIMIZATIONS - Ultra-fast builds
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    
    // Code Splitting for faster loads
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - load once, cache forever
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          'router-vendor': ['wouter'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          'query-vendor': ['@tanstack/react-query'],
          'game-vendor': ['hls.js', 'zustand'],
          'utils': ['sonner', 'lucide-react'],
        },
        // Optimize chunk names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    // Chunk size limits
    chunkSizeWarningLimit: 500,
    
    // Disable source maps for smaller production builds
    sourcemap: false,
    
    // CSS optimization
    cssCodeSplit: true,
    cssMinify: true,
    
    // Inline small assets to reduce HTTP requests
    assetsInlineLimit: 4096, // 4kb
  },
  
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
    // HMR optimizations for faster development
    hmr: {
      overlay: true,
    },
  },
  
  // Dependency optimization - pre-bundle for faster dev server
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'wouter',
      '@tanstack/react-query',
      'zustand',
      'hls.js',
      'sonner',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  
  // Enable esbuild optimizations for faster builds
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    legalComments: 'none',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
});