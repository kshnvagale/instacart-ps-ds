/**
 * Token build: tokens/*.json (DTCG) -> src/styles/tokens.generated.css.
 *
 *   npm run sync:tokens
 *
 * What it does, in order:
 *   1. Reads every tokens/*.json and merges them into one tree.
 *   2. Walks the tree. A token is a node with `$value` (the same in both
 *      themes) or a node with `light` / `dark` children (a themed token).
 *   3. Writes the CSS. An alias (`{color.green.9}`) becomes `var(--color-green-9)`,
 *      so the CSS says where each value comes from, and a component token that
 *      points at a semantic one follows the theme.
 *   4. Runs the gates. If any fails, it prints why and exits non-zero, and the
 *      CSS file is NOT written: a broken token set never reaches the theme.
 *
 * The output is deterministic: tokens are sorted by name, numbers are formatted
 * the same way every time, and there is no timestamp. Running it twice gives
 * byte-identical files.
 *
 * Node builtins only. Ported from SSX's tokens/build.py (resolve, walk,
 * css_name, px -> rem, the contrast gate), for one brand with light and dark.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const TOKENS_DIR = resolve(ROOT, 'tokens');
const OUT_CSS = resolve(ROOT, 'src/styles/tokens.generated.css');

const THEMES = ['light', 'dark'];

// ---- 1. load ------------------------------------------------------------------

function deepMerge(dst, src) {
  for (const [k, v] of Object.entries(src)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && dst[k] && typeof dst[k] === 'object') deepMerge(dst[k], v);
    else dst[k] = v;
  }
  return dst;
}

function load() {
  const tree = {};
  for (const name of readdirSync(TOKENS_DIR).sort()) {
    if (!name.endsWith('.json')) continue;
    deepMerge(tree, JSON.parse(readFileSync(resolve(TOKENS_DIR, name), 'utf8')));
  }
  return tree;
}

// ---- 2. walk ------------------------------------------------------------------

const isLeaf = (n) => n && typeof n === 'object' && '$value' in n;
const isThemed = (n) => n && typeof n === 'object' && isLeaf(n.light);

/**
 * Every token as { path, type, value } (static) or { path, type, light, dark }
 * (themed; `dark` may be missing, and then the light value is used in dark too).
 *
 * `$type` is inherited from the nearest group, as DTCG says. Not passing it
 * down is a silent failure SSX hit: a cubicBezier with no type prints as
 * `0,0,0,1`, which is not a timing function, and every transition dies.
 */
function* walk(node, path = [], type = '') {
  if (isLeaf(node)) {
    yield { path: path.join('.'), type: node.$type || type, value: node.$value };
    return;
  }
  if (isThemed(node)) {
    const t = node.$type || type;
    yield {
      path: path.join('.'),
      type: t,
      light: node.light.$value,
      dark: node.dark ? node.dark.$value : undefined,
    };
    return;
  }
  if (node && typeof node === 'object') {
    const here = node.$type || type;
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      yield* walk(v, [...path, k], here);
    }
  }
}

const ALIAS = /^\{([^}]+)\}$/;

/** The concrete value of a token in one theme, following aliases. */
function resolveIn(theme, value, index, seen = new Set()) {
  if (typeof value !== 'string') return value;
  const m = value.trim().match(ALIAS);
  if (!m) return value;
  const target = m[1];
  if (seen.has(target)) fail(`circular alias: {${target}}`);
  const tok = index.get(target);
  if (!tok) fail(`unresolved alias: {${target}}`);
  return resolveIn(theme, valueIn(theme, tok), index, new Set([...seen, target]));
}

/** A token's own (unresolved) value in one theme. A missing dark falls back to light. */
const valueIn = (theme, tok) => ('value' in tok ? tok.value : theme === 'dark' ? (tok.dark ?? tok.light) : tok.light);

// ---- 3. names and formats -----------------------------------------------------

const COMPONENT_TIER = 'component';

/**
 * Kebab-case all the way down: `action.primary.bgHover` -> `--action-primary-bg-hover`,
 * `space.0.5` -> `--space-0-5`. Tier-3 tokens drop their `component` segment:
 * `component.badge.sale.bg` -> `--badge-sale-bg`, the name a component reads.
 */
function cssName(path) {
  let parts = path.split('.');
  if (parts[0] === COMPONENT_TIER && parts.length > 1) parts = parts.slice(1);
  return '--' + parts.map((p) => p.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()).join('-');
}

/**
 * Sizes are AUTHORED in px (designers read px, the gates read px) and WRITTEN in
 * rem, so a reader's browser text-size setting scales the system. 16px = 1rem.
 * Left in px on purpose: borders and focus (a hairline stays one pixel),
 * breakpoints (rem in a media query ignores the root size), shadows (depth,
 * not size), space.px and radius.full.
 */
const REM_PREFIXES = ['space.', 'radius.', 'type.', 'size.', 'component.control.'];
const KEEP_PX = new Set(['space.px', 'radius.full']);

function pxToRem(v) {
  const m = String(v).match(/^(-?\d+(?:\.\d+)?)px$/);
  if (!m) return v;
  const n = Number(m[1]);
  if (n === 0) return '0px';
  return `${Number((n / 16).toFixed(6))}rem`;
}

function formatShadow(s) {
  const one = (x) => `${x.inset ? 'inset ' : ''}${x.offsetX} ${x.offsetY} ${x.blur} ${x.spread} ${x.color}`;
  return Array.isArray(s) ? s.map(one).join(', ') : one(s);
}

/** A concrete (non-alias) value as CSS. */
function formatValue(path, type, v) {
  if (type === 'cubicBezier' && Array.isArray(v)) return `cubic-bezier(${v.join(', ')})`;
  if (type === 'fontFamily' && Array.isArray(v)) return v.map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ');
  if (type === 'shadow' && typeof v === 'object') return formatShadow(v);
  if (type === 'dimension' && REM_PREFIXES.some((p) => path.startsWith(p)) && !KEEP_PX.has(path)) return pxToRem(v);
  if (v && typeof v === 'object') fail(`${path}: composite value with no known $type (${type || 'none'}); it would print as [object Object]`);
  return String(v);
}

/** A token's value as CSS: an alias becomes var(--target), anything else is formatted. */
function cssValue(tok, raw, index) {
  if (typeof raw === 'string') {
    const m = raw.trim().match(ALIAS);
    if (m) {
      if (!index.has(m[1])) fail(`${tok.path}: unresolved alias {${m[1]}}`);
      return `var(${cssName(m[1])})`;
    }
  }
  return formatValue(tok.path, tok.type, raw);
}

/** Natural sort, so --color-green-2 comes before --color-green-10. No locale. */
function natural(a, b) {
  const re = /(\d+)|(\D+)/g;
  const pa = a.match(re) ?? [];
  const pb = b.match(re) ?? [];
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i];
    const y = pb[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    if (x === y) continue;
    const nx = /^\d/.test(x);
    const ny = /^\d/.test(y);
    if (nx && ny) return Number(x) - Number(y);
    return x < y ? -1 : 1;
  }
  return 0;
}

// ---- 4. gates -----------------------------------------------------------------

const problems = [];
function fail(msg) {
  console.error(`build-tokens: ${msg}`);
  process.exit(1);
}

/** WCAG 2.x relative luminance and contrast ratio. */
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/**
 * The pairs the contrast gate checks: [foreground, background, kind].
 *   kind 'text'  needs 4.5:1 (WCAG 1.4.3, normal text). The default.
 *   kind 'large' needs 3:1, and ONLY for text that is always 24px+, or 18.66px+
 *                bold. A pair is marked large here, by name, never by accident.
 *   kind 'ui'    needs 3:1 (WCAG 1.4.11): a focus ring, an icon.
 * Action, status and badge pairs are derived from the token tree, so a new
 * variant or tone is gated the moment it exists.
 */
const MINIMUM = { text: 4.5, large: 3, ui: 3 };

function declaredPairs(index) {
  const pairs = [];
  const has = (p) => index.has(p);
  const children = (prefix) =>
    [...new Set([...index.keys()].filter((k) => k.startsWith(prefix + '.')).map((k) => k.slice(prefix.length + 1).split('.')[0]))].sort(natural);

  // Body text roles on every everyday surface.
  for (const fg of ['default', 'strong', 'muted', 'link', 'linkHover', 'brand'])
    for (const bg of ['default', 'subtle', 'raised', 'hover', 'active'])
      pairs.push([`content.${fg}`, `surface.${bg}`, 'text']);
  pairs.push(['content.inverse', 'surface.inverse', 'text']);
  pairs.push(['content.onBrand', 'surface.brand', 'text']);
  for (const fg of ['default', 'strong', 'muted']) pairs.push([`content.${fg}`, 'surface.brandSubtle', 'text']);
  pairs.push(['content.onAction', 'action.primary.bg', 'text']);

  // Every action label on its resting, hovered and pressed fill. The tertiary
  // (outline) button is transparent at rest, so it is checked on the surfaces
  // it sits on instead. `disabled` is exempt (WCAG 1.4.3).
  for (const v of children('action')) {
    if (v === 'disabled') continue;
    for (const state of ['bg', 'bgHover', 'bgActive']) {
      const bg = `action.${v}.${state}`;
      if (!has(bg) || (v === 'tertiary' && state === 'bg')) continue;
      pairs.push([`action.${v}.fg`, bg, 'text']);
    }
  }
  pairs.push(['action.tertiary.fg', 'surface.default', 'text']);
  pairs.push(['action.tertiary.fg', 'surface.subtle', 'text']);

  // Status text on its own tint, and on the page (an inline error message).
  for (const s of children('status')) {
    pairs.push([`status.${s}.fg`, `status.${s}.bg`, 'text']);
    pairs.push([`status.${s}.fg`, 'surface.default', 'text']);
  }

  // Every badge tone.
  for (const tone of children('component.badge')) pairs.push([`component.badge.${tone}.fg`, `component.badge.${tone}.bg`, 'text']);

  // The focus ring must be visible on every surface it can land on.
  for (const bg of ['default', 'subtle', 'raised']) pairs.push(['focus.ring', `surface.${bg}`, 'ui']);
  return pairs;
}

/**
 * Pairs allowed to fail, by theme. It is EMPTY, and it should stay empty:
 * every pair passes in both themes. If one ever has to go here, write it as
 *   { theme: 'dark', fg: '<token path>', bg: '<token path>', why: '...' }
 * An exception that no longer fails is itself an error, so the list cannot rot.
 */
const GATE_EXCEPTIONS = [];

const isTransparent = (hex) => /^#[0-9a-f]{6}00$/i.test(hex);

function contrastGate(index) {
  const pairs = declaredPairs(index);
  const rows = [];
  const used = new Set();
  for (const theme of THEMES) {
    for (const [fg, bg, kind] of pairs) {
      for (const p of [fg, bg]) if (!index.has(p)) problems.push(`contrast gate: pair names a missing token ${p}`);
      if (!index.has(fg) || !index.has(bg)) continue;
      const f = resolveIn(theme, valueIn(theme, index.get(fg)), index);
      const b = resolveIn(theme, valueIn(theme, index.get(bg)), index);
      if (!/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(f) || !/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(b)) {
        problems.push(`contrast gate: ${fg} on ${bg} (${theme}) is not a hex colour (${f} on ${b})`);
        continue;
      }
      if (isTransparent(b) || isTransparent(f)) {
        problems.push(`contrast gate: ${fg} on ${bg} (${theme}) is transparent; check it on the surface it sits on instead`);
        continue;
      }
      if (f.length === 9 || b.length === 9) {
        problems.push(`contrast gate: ${fg} on ${bg} (${theme}) is translucent; composite it before gating`);
        continue;
      }
      const ratio = contrast(f, b);
      const min = MINIMUM[kind];
      const ok = ratio >= min;
      const exc = GATE_EXCEPTIONS.find((e) => e.theme === theme && e.fg === fg && e.bg === bg);
      if (exc) used.add(exc);
      if (exc && ok) problems.push(`GATE_EXCEPTIONS: ${fg} on ${bg} (${theme}) now passes (${ratio.toFixed(2)}:1); remove the exception`);
      if (!ok && !exc) problems.push(`contrast: ${fg} on ${bg} in ${theme} is ${ratio.toFixed(2)}:1, needs ${min}:1 [${f} on ${b}]`);
      rows.push({ theme, fg, bg, kind, ratio, min, ok, excepted: Boolean(exc && !ok), f, b });
    }
  }
  for (const e of GATE_EXCEPTIONS) if (!used.has(e)) problems.push(`GATE_EXCEPTIONS: ${e.fg} on ${e.bg} (${e.theme}) is not a declared pair`);
  return rows;
}

function printAudit(rows) {
  console.log('Contrast audit (WCAG 2.x): text 4.5:1, large text and UI 3:1');
  for (const theme of THEMES) {
    const mine = rows.filter((r) => r.theme === theme);
    const passed = mine.filter((r) => r.ok).length;
    const excepted = mine.filter((r) => r.excepted).length;
    console.log(`  ${theme.padEnd(5)}  ${passed}/${mine.length} pass${excepted ? `, ${excepted} excepted` : ''}. Lowest:`);
    for (const r of [...mine].sort((a, b) => a.ratio / a.min - b.ratio / b.min).slice(0, 5)) {
      const tag = r.ok ? 'PASS' : r.excepted ? 'EXCP' : 'FAIL';
      console.log(`    ${tag} ${r.ratio.toFixed(2).padStart(5)}:1 (min ${r.min})  ${r.fg} on ${r.bg}  [${r.f} on ${r.b}]`);
    }
  }
}

/**
 * Instacart's own hexes must sit EXACTLY on a ramp step (brand/brand.md). If a
 * ramp is regenerated and an anchor drifts, the brand quietly changes; this
 * makes it loud.
 */
const BRAND_ANCHORS = {
  '#108910': 'action green (IDS brand-primary-regular)',
  '#0AAD0A': 'Lime',
  '#0D720D': 'green hover (IDS brand-primary-dark)',
  '#0A610A': 'green pressed (IDS brand-primary-extra-dark)',
  '#FF7009': 'Carrot',
  '#DE3534': 'danger (IDS detrimental-regular)',
  '#FFDC23': 'deal yellow (IDS brand-max-light)',
  '#003D29': 'Kale',
  '#FAF1E5': 'Cashew',
  '#343538': 'body text grey',
  '#242529': 'heading grey',
  '#E8E9EB': 'secondary fill grey',
  '#C7C8CD': 'control border grey',
  '#F6F7F8': 'quiet fill grey',
};

function anchorGate(tokens) {
  const primitives = new Set(tokens.filter((t) => t.path.startsWith('color.') && 'value' in t).map((t) => String(t.value).toUpperCase()));
  for (const [hex, what] of Object.entries(BRAND_ANCHORS))
    if (!primitives.has(hex)) problems.push(`brand anchor ${hex} (${what}) is not on any primitive colour step`);
}

/** Two token paths that emit the same custom property would silently overwrite each other. */
function collisionGate(tokens) {
  const seen = new Map();
  for (const t of tokens) {
    const n = cssName(t.path);
    if (seen.has(n)) problems.push(`name collision: ${t.path} and ${seen.get(n)} both emit ${n}`);
    seen.set(n, t.path);
  }
}

/** The space scale is short on purpose: skipping 7, 9 and 11 keeps spacing choices few and distinct. */
function spaceGate(index) {
  if (index.has('space.7')) problems.push('space.7 exists. The space scale skips 7 on purpose; use 6 or 8.');
}

/** The 12px floor: no type role smaller. */
function typeFloorGate(tokens) {
  for (const t of tokens) {
    if (!/^type\.[^.]+\.size$/.test(t.path)) continue;
    const px = parseFloat(t.value);
    if (!(px >= 12)) problems.push(`${t.path} is ${t.value}; the type floor is 12px`);
  }
}

// ---- main -----------------------------------------------------------------------

const tree = load();
const tokens = [...walk(tree)].filter((t) => t.path);
const index = new Map(tokens.map((t) => [t.path, t]));

// Every alias must resolve in every theme (resolveIn exits on a bad one).
for (const t of tokens) for (const theme of THEMES) resolveIn(theme, valueIn(theme, t), index);

collisionGate(tokens);
anchorGate(tokens);
spaceGate(index);
typeFloorGate(tokens);
const rows = contrastGate(index);
printAudit(rows);

if (problems.length) {
  console.error(`\nbuild-tokens: ${problems.length} problem(s). tokens.generated.css was NOT written.`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

// ---- write the CSS --------------------------------------------------------------

const decl = (tok, raw) => `  ${cssName(tok.path)}: ${cssValue(tok, raw, index)};`;
const byName = (a, b) => natural(cssName(a.path), cssName(b.path));

const staticTokens = tokens.filter((t) => 'value' in t).sort(byName);
const themed = tokens.filter((t) => !('value' in t)).sort(byName);
const darkTokens = themed.filter((t) => t.dark !== undefined);
const durations = staticTokens.filter((t) => t.path.startsWith('motion.duration.'));

const lightBody = ['  color-scheme: light;', ...themed.map((t) => decl(t, t.light))].join('\n');
const darkBody = (indent) =>
  ['color-scheme: dark;', ...darkTokens.map((t) => decl(t, t.dark).trim())].map((l) => indent + l).join('\n');

const css = `/* ---------------------------------------------------------------------------
 * GENERATED by scripts/build-tokens.mjs from tokens/*.json. Do not edit.
 * Change a token in tokens/ and run \`npm run sync:tokens\`.
 *
 * Blocks:
 *   :root                          tokens that are the same in both themes
 *   :root, [data-theme]            light values of the themed tokens. Also on
 *                                  [data-theme], so data-theme="light" on a
 *                                  subtree restores light, and a token that
 *                                  points at a themed one re-resolves there.
 *   [data-theme="dark"]            dark values
 *   prefers-color-scheme: dark     dark values when the OS asks for dark and
 *                                  nothing pins data-theme="light"
 * ------------------------------------------------------------------------- */

:root {
${staticTokens.map((t) => decl(t, t.value)).join('\n')}
}

:root,
[data-theme] {
${lightBody}
}

[data-theme="dark"] {
${darkBody('  ')}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${darkBody('    ')}
  }
}

/* Reduced motion: every duration collapses, so every transition that reads a
   token does too. 1ms rather than 0 so transitionend events still fire. */
@media (prefers-reduced-motion: reduce) {
  :root {
${durations.map((t) => `    ${cssName(t.path)}: 1ms;`).join('\n')}
  }
}
`;

mkdirSync(dirname(OUT_CSS), { recursive: true });
writeFileSync(OUT_CSS, css);
console.log(`\nbuild-tokens: ${tokens.length} tokens (${staticTokens.length} static, ${themed.length} themed) -> src/styles/tokens.generated.css`);
