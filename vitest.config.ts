// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/services/**', 'src/components/**'],
      exclude: ['node_modules', 'src/tests/**']
    },
    testTimeout: 30000, // Reduced from 60000
    hookTimeout: 30000, // Reduced from 60000
    pool: 'forks', // Use forks instead of threads (more stable)
    poolOptions: {
      forks: {
        singleFork: true // Run tests in single fork to avoid timeout
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
