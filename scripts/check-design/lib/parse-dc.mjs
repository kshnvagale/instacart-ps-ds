/**
 * Claude Design canvas artboards (`project/<name>.dc.html`).
 *
 * An artboard mounts the design system's real components as custom tags:
 *
 *   <x-import component-from-global-scope="Instacart.Button" variant="secondary">Cancel</x-import>
 *
 * with kebab-case props (`default-value`), `{{hole}}` values from the
 * artboard's renderVals(), and plain HTML (`class=`, `for=`) for layout. That
 * is source, so it converts to the equivalent TSX and every rule, the prop
 * type check included, runs unchanged. Each line stays on its line, so
 * findings point at the artboard.
 */

const VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;

export const isDcArtboard = (html) => /<x-dc[\s>]/.test(html);

/**
 * Attribute -> prop, exactly as the canvas runtime does it (dc-runtime.js):
 * on plain HTML, `class` and `for` become `className` and `htmlFor`; on an
 * x-import ONLY hyphenated names are camelCased (`html-for` -> `htmlFor`,
 * `class-name` -> `className`), and `class` / `for` pass through unchanged.
 * Translating them here would hide a real bug: a component given `class`
 * has its own classes overwritten and renders unstyled.
 */
const propName = (name, isComponent) => {
  if (!isComponent) return name === 'class' ? 'className' : name === 'for' ? 'htmlFor' : name;
  if (/^(aria|data)-/.test(name)) return name;
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
};

const cssToObject = (css) =>
  `{{${css.split(';').map((d) => d.trim()).filter((d) => d.includes(':')).map((d) => {
    const i = d.indexOf(':');
    const key = d.slice(0, i).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return `${JSON.stringify(key)}: ${JSON.stringify(d.slice(i + 1).trim())}`;
  }).join(', ')}}}`;

const attrValue = (value, name) => {
  const hole = value.match(/^\{\{\s*([\w.]+)\s*\}\}$/);
  if (hole) return `{__dc.${hole[1]}}`;
  if (name === 'style') return cssToObject(value);
  return JSON.stringify(value);
};

function convertTag(tag, stack) {
  if (tag.startsWith('<!--')) return `{/*${tag.slice(4, -3).replace(/\*\//g, '* /')}*/}`;
  if (tag.startsWith('</')) {
    const name = tag.slice(2, -1).trim();
    if (name === 'x-import') return `</${stack.pop() ?? 'x-import'}>`;
    stack.pop();
    return tag;
  }
  const m = tag.match(/^<([\w-]+)([\s\S]*?)(\/?)>$/);
  if (!m) return tag;
  let [, name, rest, selfClose] = m;
  let isComponent = false;
  const attrs = [];
  for (const a of rest.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g)) {
    const [, an, v1, v2] = a;
    const value = v1 ?? v2;
    if (name === 'x-import' && an === 'component-from-global-scope') {
      name = value;
      isComponent = true;
      continue;
    }
    const component = isComponent || name.includes('.');
    attrs.push(value === undefined ? propName(an, component) : `${propName(an, component)}=${attrValue(value, an)}`);
  }
  const closes = selfClose === '/' || VOID.test(name);
  if (!closes) stack.push(name);
  // Keep the tag's own line breaks so later lines do not move.
  const breaks = '\n'.repeat((tag.match(/\n/g) ?? []).length);
  return `<${name}${attrs.length ? ` ${attrs.join(' ')}` : ''}${closes ? ' /' : ''}>${breaks}`;
}

/** The artboard as TSX, line for line. */
export function dcToTsx(html) {
  const start = html.search(/<x-dc[\s>]/);
  const end = html.indexOf('</x-dc>');
  const openEnd = html.indexOf('>', start) + 1;
  let body = html.slice(openEnd, end < 0 ? undefined : end);
  // <helmet> is the page's <head> styling, not UI: blank it, keeping lines.
  body = body.replace(/<helmet>[\s\S]*?<\/helmet>/g, (h) => '\n'.repeat((h.match(/\n/g) ?? []).length));
  const stack = [];
  const converted = body
    .replace(/<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>/g, (t) => convertTag(t, stack))
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, '{__dc.$1}');

  const before = html.slice(0, openEnd);
  const pad = '\n'.repeat((before.match(/\n/g) ?? []).length);
  // Whatever global the canvas's install uses (`Instacart` today; an older
  // install may differ) is the same package: check every namespace against it.
  const namespaces = [...new Set([...html.matchAll(/component-from-global-scope="([A-Za-z_$][\w$]*)\./g)].map((m) => m[1]))];
  const globals = (namespaces.length ? namespaces : ['Instacart']).map((ns) => `const ${ns} = window.Instacart;`).join(' ');
  return `${pad}declare const __dc: any; ${globals} export default function Artboard() { return (<>${converted}</>); }\n`;
}

/**
 * Handler definitions for the artboard's `{{hole}}` values. Handlers live in
 * the DCLogic script after </x-dc> (`saveAlerts(v) { fetch(...) }`), outside
 * the converted part, so Jev would otherwise never see what a handler does.
 * name -> its source text (a bounded slice from where it is defined).
 */
export function dcHandlers(html) {
  const script = html.match(/<script[^>]*type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';
  const out = new Map();
  if (!script) return out;
  for (const [, name] of html.matchAll(/\{\{\s*([A-Za-z_$][\w$]*)\s*\}\}/g)) {
    if (out.has(name)) continue;
    const at = script.search(new RegExp(`(^|[\\s,{])(async\\s+)?${name}\\s*(\\(|:|=)`, 'm'));
    if (at >= 0) out.set(name, script.slice(at, at + 400).trim());
  }
  return out;
}
