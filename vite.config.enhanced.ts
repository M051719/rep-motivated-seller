import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// Enhanced Vite configuration with bundle analysis
export default defineConfig({
  plugins: [
    react({
      // Enhanced React configuration
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }]
        ]
      }
    }),
    // Bundle analyzer - only in analyze mode
    ...(process.env.ANALYZE ? [visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap' // 'treemap', 'sunburst', 'network'
    })] : [])
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
          
          // Form handling
          forms: ['react-hook-form'],
          
          // Routing
          routing: ['react-router-dom'],
          
          // Payment processing
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          
          // Utilities
          utils: ['date-fns', 'clsx']
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
    port: 3000,
    open: true,
    cors: true,
    host: true, // Expose to network
    proxy: {
      // API proxy configuration
      '/api': {
        target: 'http://localhost:54321', // Supabase local
        changeOrigin: true,
        secure: false
      },
      
      // Supabase edge functions proxy
      '/functions/v1': {
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
      'react-hot-toast',
      'react-hook-form'
    ],
    exclude: ['@vite/client', '@vite/env']
  },

  // Enhanced environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __DEVELOPMENT__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PRODUCTION__: JSON.stringify(process.env.NODE_ENV === 'production')
  },

  // Enhanced CSS configuration
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },

  // Enhanced testing configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
});