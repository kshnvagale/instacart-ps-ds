import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * For Storybook (which uses the Vite builder) and for the tests. The PACKAGE
 * is built by `vite.lib.config.ts` (Phase 5).
 *
 * React 19 only, with the automatic JSX runtime (tsconfig: "jsx": "react-jsx").
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
  },
});
