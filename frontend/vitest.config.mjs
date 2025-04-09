import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/vitest.setup.js',
    include: ['src/tests/unit/**/*.test.{js,jsx,ts,tsx}'],
    coverage: {
      reporter: ['text'],
    exclude: [ 'src/tests/helpers/**',
                'src/main.jsx',
                'src/tests/selenium/**',
                'eslint.config.mjs',
                'vite.config.mjs',
                'vitest.config.mjs']
  }},
});
