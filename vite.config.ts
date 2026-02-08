import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import crypto from 'crypto';

function cspNoncePlugin(): Plugin {
  return {
    name: 'vite-csp-nonce',
    transformIndexHtml(html) {
      // Generate cryptographically secure nonce (128-bit)
      const nonce = crypto.randomBytes(16).toString('base64');
      
      // Replace nonce placeholder in CSP meta tag
      let transformed = html.replace(/{{NONCE}}/g, nonce);
      
      // Add nonce to inline scripts (but NOT external scripts with src="...")
      transformed = transformed.replace(
        /<script(?![^>]*\ssrc=)([^>]*)>/gi,
        `<script nonce="${nonce}"$1>`
      );
      
      // Add nonce to inline styles (but NOT external stylesheets with href="...")
      transformed = transformed.replace(
        /<style([^>]*)>/gi,
        `<style nonce="${nonce}"$1>`
      );
      
      return transformed;
    },
  };
}

export default defineConfig({
  plugins: [
    cspNoncePlugin(),
    react(),
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })
  ].filter(Boolean),
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
  build: {
    outDir: 'dist',
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['framer-motion', 'react-hot-toast'],
          routing: ['react-router-dom'],
          // Heavy libraries - split into separate chunks
          exceljs: ['exceljs'],
          pdf: ['jspdf'],
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js', 'stripe'],
          editor: ['react-quill'],
          pptx: ['pptxgenjs'],
          charts: ['chart.js', 'react-chartjs-2'],
          maps: ['mapbox-gl']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production'
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:54321',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
      'react-hot-toast',
      'react-quill'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __DEVELOPMENT__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PRODUCTION__: JSON.stringify(process.env.NODE_ENV === 'production')
  }
});
