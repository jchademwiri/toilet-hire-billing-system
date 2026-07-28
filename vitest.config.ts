import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Engine tests are pure logic — no DOM needed
    environment: 'node',
    include: ['src/engine/__tests__/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
