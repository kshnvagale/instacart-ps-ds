import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import pkg from './package.json' with { type: 'json' };

/**
 * The PACKAGE build (JS only). `vite.config.ts` is Storybook's and Vitest's.
 *
 * Modern only: ESM, one file per source module (`preserveModules`), every
 * dependency and peer external, so an app dedupes Radix against its own copy.
 * There is no legacy (React 16 / webpack 4) build; that SSX branch is removed.
 *
 * Declarations are emitted separately by `tsc -p tsconfig.build.json`.
 * Stylesheets are copied by `scripts/copy-styles.mjs`.
 */
const external = [
  ...Object.keys(pkg.peerDependencies ?? {}),
  ...Object.keys(pkg.dependencies ?? {}),
];

function isExternal(id: string): boolean {
  // The prefix match also catches subpaths such as `react/jsx-runtime`.
  return external.some((dep) => id === dep || id.startsWith(`${dep}/`));
}

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: { index: 'src/index.ts' },
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    // The app's bundler minifies. A readable dist is easier to debug.
    minify: false,
    target: 'es2022',
    copyPublicDir: false,
    rollupOptions: {
      external: isExternal,
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
  },
});
