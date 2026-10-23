/**
 * Builds the scripts the render page loads:
 *
 * - `react.js`: React and ReactDOM as globals (`window.React`, `window.ReactDOM`),
 *   the way the canvas runtime supplies them to every artboard.
 * - a design-system bundle: an ESM entry (such as `dist/index.js`) turned
 *   into an IIFE that sets `window.<Global>`, with React taken from the page
 *   (never a second copy).
 *
 * Builds are cached in `<out>/.cache/`, keyed by the entry path and its mtime.
 */
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../../..');

/** `react`, `react-dom` and their subpaths come from the page's globals. */
const pageReact = {
  name: 'page-react',
  setup(b) {
    b.onResolve({ filter: /^react(-dom)?(\/.*)?$/ }, (args) => ({ path: args.path, namespace: 'page-react' }));
    b.onLoad({ filter: /.*/, namespace: 'page-react' }, (args) => {
      const map = {
        react: 'window.React',
        'react/jsx-runtime': 'window.__vcJsxRuntime',
        'react/jsx-dev-runtime': 'window.__vcJsxRuntime',
        'react-dom': 'window.ReactDOM',
        'react-dom/client': 'window.ReactDOM',
      };
      const global = map[args.path] ?? 'window.ReactDOM';
      return { contents: `module.exports = ${global};`, loader: 'js' };
    });
  },
};

const stamp = (paths) =>
  createHash('sha1')
    .update(paths.map((p) => `${p}:${existsSync(p) ? statSync(p).mtimeMs : 0}`).join('|'))
    .digest('hex')
    .slice(0, 12);

/** React + ReactDOM as page globals, from this repo's node_modules. */
export async function buildReactVendor(outDir) {
  const cache = join(outDir, '.cache');
  mkdirSync(cache, { recursive: true });
  const reactPkg = join(REPO, 'node_modules/react/package.json');
  const file = join(cache, `react.${stamp([reactPkg])}.js`);
  if (existsSync(file)) return file;
  const entry = join(cache, 'react-entry.mjs');
  writeFileSync(
    entry,
    [
      "import * as React from 'react';",
      "import * as ReactDOM from 'react-dom';",
      "import * as Client from 'react-dom/client';",
      "import * as JSX from 'react/jsx-runtime';",
      // Plain, mutable objects: some bundles add `jsx` to window.React.
      'window.React = Object.assign({}, React);',
      'window.ReactDOM = Object.assign({}, ReactDOM, Client);',
      'window.__vcJsxRuntime = Object.assign({}, JSX);',
    ].join('\n'),
  );
  await build({
    entryPoints: [entry],
    bundle: true,
    format: 'iife',
    outfile: file,
    minify: true,
    nodePaths: [join(REPO, 'node_modules')],
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'error',
  });
  return file;
}

/**
 * An ESM design-system entry as an IIFE exposing `window[globals[0]]` (and
 * each further name in `globals` as an alias).
 */
export async function buildDsBundle(entry, globals, outDir) {
  const abs = resolve(entry);
  if (!existsSync(abs)) throw new Error(`bundle entry not found: ${abs}`);
  const cache = join(outDir, '.cache');
  mkdirSync(cache, { recursive: true });
  const [main, ...aliases] = globals;
  const file = join(cache, `ds-${main}.${stamp([abs])}.${createHash('sha1').update(globals.join(',')).digest('hex').slice(0, 6)}.js`);
  if (existsSync(file)) return file;
  await build({
    entryPoints: [abs],
    bundle: true,
    format: 'iife',
    globalName: main,
    outfile: file,
    minify: false,
    plugins: [pageReact],
    loader: { '.css': 'empty' },
    define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env': '{}' },
    footer: { js: aliases.map((a) => `window.${a} = window.${main};`).join('\n') },
    logLevel: 'error',
  });
  return file;
}

export const DEFAULTS = {
  entry: join(REPO, 'dist/index.js'),
  global: 'Instacart',
  css: join(REPO, 'dist/instacart.standalone.css'),
};

export { REPO };
