import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// Enhanced Vite configuration with bundle analysis
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - only in analyze mode
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })
  ],
  
  // Enhanced path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@config': resolve(__dirname, './src/config'),
      '@assets': resolve(__dirname, './src/assets'),
      '@lib': resolve(__dirname, './src/lib'),
      '@pages': resolve(__dirname, './src/pages'),
      '@store': resolve(__dirname, './src/store')
    }
  },

  // Enhanced build optimization
  build: {
    outDir: 'dist',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor chunks
          vendor: ['react', 'react-dom'],
          // Supabase and authentication
          supabase: ['@supabase/supabase-js'],
          // UI libraries
          ui: ['framer-motion', 'react-hot-toast'],
          // Routing
          routing: ['react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: process.env.NODE_ENV === 'development',
    // Production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production'
      }
    }
  },

  // Enhanced development server
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    cors: true,
    proxy: {
      // Supabase local proxy
      '/api': {
        target: 'http://localhost:54321',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Enhanced optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
      'react-hot-toast'
    ],
    exclude: ['@vite/client', '@vite/env']
  },

  // Enhanced environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __DEVELOPMENT__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PRODUCTION__: JSON.stringify(process.env.NODE_ENV === 'production')
  }
});
