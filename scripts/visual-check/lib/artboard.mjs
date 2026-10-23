/**
 * One `.dc.html` artboard -> the pieces the render page needs.
 *
 * The artboard body goes through the checker's own converter (`dcToTsx` in
 * scripts/check-design/lib/parse-dc.mjs), so the attribute -> prop mapping is
 * the canvas runtime's: only hyphenated names are camelCased, and `class` on
 * an x-import stays a prop named `class`. esbuild then turns that TSX into a
 * plain script for the browser.
 */
import { transform } from 'esbuild';
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { dcToTsx, isDcArtboard } from '../../check-design/lib/parse-dc.mjs';

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[1] ?? m[2]) : undefined;
};

/** Attributes of the artboard's <html> tag (data-brand and the like). */
function htmlAttrs(html) {
  const tag = html.match(/<html\b[^>]*>/i)?.[0] ?? '';
  const out = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) out[m[1]] = m[2] ?? m[3];
  return out;
}

/**
 * The design-system files the artboard's <head> loads (`ds/<ns>/…`), when
 * they exist next to it. `support.js` is the canvas runtime itself; skipped.
 */
function headAssets(html, file) {
  const head = html.slice(0, Math.max(0, html.search(/<x-dc[\s>]/)));
  const dir = dirname(file);
  const css = [];
  const js = [];
  const missing = [];
  for (const tag of head.match(/<link\b[^>]*>/gi) ?? []) {
    if (!/rel\s*=\s*["']?stylesheet/i.test(tag)) continue;
    const href = attr(tag, 'href');
    if (!href || /^https?:/i.test(href)) continue;
    const p = resolve(dir, href);
    (existsSync(p) ? css : missing).push(existsSync(p) ? p : href);
  }
  for (const tag of head.match(/<script\b[^>]*>/gi) ?? []) {
    const src = attr(tag, 'src');
    if (!src || /support\.js$/.test(src) || /^https?:/i.test(src)) continue;
    const p = resolve(dir, src);
    (existsSync(p) ? js : missing).push(existsSync(p) ? p : src);
  }
  return { css, js, missing };
}

/** The `<helmet>` block's contents go into the page's <head>, as on the canvas. */
const helmet = (html) => [...html.matchAll(/<helmet>([\s\S]*?)<\/helmet>/g)].map((m) => m[1]).join('\n');

/** The artboard's `class Component extends DCLogic { … }` and its data-props. */
function dcScript(html) {
  const m = html.match(/<script\b([^>]*\bdata-dc-script\b[^>]*)>([\s\S]*?)<\/script>/i);
  if (!m) return { code: '', props: {} };
  let props = {};
  const raw = attr(` ${m[1]}`, 'data-props');
  if (raw) {
    try {
      props = JSON.parse(raw.replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
    } catch {
      props = {};
    }
  }
  return { code: m[2], props };
}

/** The hole names the artboard uses (`{{name}}`). */
const holes = (html) => [...new Set([...html.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)].map((m) => m[1].split('.')[0]))];

export async function loadArtboard(file, board = {}) {
  const html = readFileSync(file, 'utf8');
  if (!isDcArtboard(html)) throw new Error(`not a canvas artboard (no <x-dc>): ${file}`);

  let tsx = dcToTsx(html);
  // The converter declares the holes and points every namespace at one
  // global (it was written for type checking). In the browser each
  // namespace resolves on window by its own name, as the canvas does.
  tsx = tsx
    .replace(/const ([A-Za-z_$][\w$]*) = window\.[A-Za-z_$][\w$]*;/g, 'const $1 = window.__vcNamespace("$1");')
    .replace(/declare const __dc\s*:\s*any;/, 'const __dc = window.__vcHoles;');

  let js;
  try {
    const out = await transform(tsx, {
      loader: 'tsx',
      format: 'iife',
      globalName: '__vcArtboard',
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      logLevel: 'silent',
    });
    js = out.code;
  } catch (err) {
    const first = err.errors?.[0];
    const where = first?.location ? ` (line ${first.location.line})` : '';
    throw new Error(`could not convert ${basename(file)}${where}: ${first?.text ?? err.message}`);
  }

  const script = dcScript(html);
  const preview = script.props?.$preview ?? {};
  const namespaces = [...new Set([...html.matchAll(/component-from-global-scope="([A-Za-z_$][\w$]*)\./g)].map((m) => m[1]))];
  return {
    file,
    name: basename(file).replace(/\.dc\.html$/, ''),
    title: board.title ?? html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? basename(file),
    width: board.w ?? preview.width ?? 1280,
    height: board.h ?? preview.height ?? 800,
    htmlAttrs: htmlAttrs(html),
    helmet: helmet(html),
    assets: headAssets(html, file),
    namespaces,
    holes: holes(html),
    dcCode: script.code,
    dcProps: script.props,
    js,
  };
}

/** Inputs (files and canvas folders) -> [{ canvas, dir, boards: [{ file, board }] }]. */
export function collectInputs(inputs) {
  const groups = new Map();
  const add = (canvas, dir, file, board) => {
    const key = dir;
    if (!groups.has(key)) groups.set(key, { canvas, dir, boards: [] });
    const g = groups.get(key);
    if (!g.boards.some((b) => b.file === file)) g.boards.push({ file, board });
  };
  for (const input of inputs) {
    const p = resolve(input);
    if (!existsSync(p)) throw new Error(`not found: ${input}`);
    if (p.endsWith('.dc.html')) {
      const dir = dirname(p);
      const index = readCanvasJson(dir);
      add(basename(dir), dir, p, index?.boards?.[basename(p)] ?? {});
      continue;
    }
    // A folder: the canvas itself, or a download that holds `project/`.
    const dir = existsSync(resolve(p, 'canvas.json')) ? p : existsSync(resolve(p, 'project/canvas.json')) ? resolve(p, 'project') : p;
    const index = readCanvasJson(dir);
    if (!index) throw new Error(`no canvas.json in ${input}`);
    const order = index.order?.length ? index.order : Object.keys(index.boards ?? {});
    const canvas = basename(dir) === 'project' ? basename(dirname(dir)) : basename(dir);
    for (const name of order) {
      const f = resolve(dir, name);
      if (existsSync(f) && name.endsWith('.dc.html')) add(canvas, dir, f, index.boards?.[name] ?? {});
    }
  }
  return [...groups.values()];
}

function readCanvasJson(dir) {
  const f = resolve(dir, 'canvas.json');
  if (!existsSync(f)) return null;
  try {
    return JSON.parse(readFileSync(f, 'utf8'));
  } catch {
    return null;
  }
}
