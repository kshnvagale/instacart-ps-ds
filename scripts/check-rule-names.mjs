#!/usr/bin/env node
/**
 * The rules for Claude must only name things that exist.
 *
 *   npm run check:rules            check against the build (dist/index.d.ts)
 *   npm run check:rules -- --src   check against src/index.ts (no build needed)
 *
 * Reads the files Claude is taught from:
 *   .design-sync/conventions.md                       the README header in Claude Design
 *   skills/instacart-design/SKILL.md                  the design skill
 *   skills/instacart-design/guidelines/components.md  the component guide
 *
 * and checks, mechanically:
 *   1. Classes. Every class the docs offer (the class tables' "Use" and
 *      "Class" columns, every class="", class-name="" and className="" in an
 *      example, every utility named in prose) compiles with the REAL theme
 *      (@tailwindcss/node, as in src/styles/closed-scale.test.ts). Every class
 *      the docs say NOT to use (the "Not" columns) really compiles to nothing.
 *      Offered classes missing from the sync stylesheet's safelist
 *      (.design-sync/ds.source.css) and from every component are warnings.
 *   2. Components. Every `Instacart.X`, `<X>`, `X prop="..."`, `X` and **X**
 *      names an export, an icon from the icon set (src/icons/index.ts; a
 *      Phosphor `*Icon` outside the set is an error), a Phosphor icon (in
 *      code examples), or a part the docs list as missing. A part listed as missing that now exists is an
 *      error: the docs are stale.
 *   3. Props. Every prop on an x-import, a JSX tag or an inline `X prop=""`
 *      exists on that component (x-import attributes are converted the way the
 *      canvas does it: only hyphenated names are camelCased, aria-* and data-*
 *      stay). A literal value must be one the type allows; a number, boolean,
 *      object or handler prop needs a {{hole}}. `class` on an x-import is an
 *      error.
 *   4. The guide's props tables name real props with the right canvas form.
 *
 * A code line that shows a mistake on purpose ends with `<!-- wrong -->` or
 * `// wrong`; it is skipped.
 *
 * Exits 1 when there are errors, and lists them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compile } from '@tailwindcss/node';

import { attrToProp, canvasAttr, loadApi, loadIconNames } from './build-guide.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = [
  '.design-sync/conventions.md',
  'skills/instacart-design/SKILL.md',
  'skills/instacart-design/guidelines/components.md',
];

/** Parts the docs describe as NOT built yet. Each must really be absent. */
const KNOWN_GAPS = new Set(['ProductCard', 'Card', 'Tabs', 'NumberInput', 'RadioGroup', 'Select', 'Dialog', 'Field']);

/** Off-scale classes the docs may cite in prose as examples of what NOT to write. Each must be dead. */
const DEAD_EXAMPLES = ['p-7', 'gap-9', 'mt-14', 'max-w-md', 'text-lg', 'bg-green-500', 'shadow-lg'];

/** Classes that compile to nothing by design. */
const MARKERS = /^(group|peer)(\/[\w-]+)?$/;

/** A token in prose counts as a class only if it starts like a utility. */
const UTILITY =
  /^(?:[a-z0-9]+:)*-?(?:(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y|w|h|size|min-w|min-h|max-w|max-h|bg|text|border|divide|rounded|shadow|z|type|font|aspect|grid-cols|grid-rows|col-span|items|justify|self|place|inset|top|bottom|left|right|leading|tracking|fill|stroke|ring|outline|opacity|overflow|object|line-clamp|whitespace)-[a-z0-9./-]+|flex|grid|block|hidden|inline-flex|inline-block|truncate|relative|absolute|sticky|fixed|underline|sr-only|border|tabular-nums)$/;

/** Components from elsewhere that examples use with `asChild`. */
const FOREIGN = new Set(['RouterLink', 'NextLink']);

/** English words that may appear in bold on their own. */
const BOLD_WORDS = new Set(['Never', 'Not', 'Note', 'Props', 'Always', 'Quantity']);

const useSrc = process.argv.includes('--src');

/* ------------------------------------------------------------------------- */

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}  ${msg}`);
const warn = (where, msg) => warnings.push(`${where}  ${msg}`);

const escapeClass = (c) => c.replace(/[^a-zA-Z0-9_-]/g, (m) => `\\${m}`);

/** Split a markdown table row into cells (ignores escaped pipes). */
const cells = (line) =>
  line
    .trim()
    .replace(/^\||\|$/g, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim());

const spans = (text) => [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]);

/** Attributes of a tag body, skipping balanced {...} values. */
function parseAttrs(body) {
  const out = [];
  let i = 0;
  while (i < body.length) {
    const m = /^\s*([A-Za-z_:][\w:.-]*)/.exec(body.slice(i));
    if (!m) {
      i++;
      continue;
    }
    i += m[0].length;
    const name = m[1];
    let value = null;
    let kind = 'bare';
    const eq = /^\s*=\s*/.exec(body.slice(i));
    if (eq) {
      i += eq[0].length;
      const q = body[i];
      if (q === '"' || q === "'") {
        const end = body.indexOf(q, i + 1);
        value = body.slice(i + 1, end === -1 ? undefined : end);
        kind = 'string';
        i = end === -1 ? body.length : end + 1;
      } else if (q === '{') {
        let depth = 0;
        const start = i;
        for (; i < body.length; i++) {
          if (body[i] === '{') depth++;
          else if (body[i] === '}' && --depth === 0) break;
        }
        value = body.slice(start, ++i);
        kind = 'expr';
      }
    }
    out.push({ name, value, kind });
  }
  return out;
}

/* ------------------------------------------------------------------------- */

const entry = useSrc || !fs.existsSync(path.join(ROOT, 'dist/index.d.ts')) ? 'src/index.ts' : 'dist/index.d.ts';
const api = loadApi(path.join(ROOT, entry));
const phosphor = new Set(Object.keys(await import('@phosphor-icons/react')));
// The curated icon set (src/icons/index.ts). Icons are exports, not documented components.
const iconSet = new Set(loadIconNames());
for (const name of iconSet) {
  if (!api.exports.has(name)) err('src/icons/index.ts', `\`${name}\` is in the icon set but not exported from ${entry}. Rebuild, or check src/index.ts.`);
  if (!phosphor.has(name)) err('src/icons/index.ts', `\`${name}\` is not a Phosphor icon.`);
}

const compiler = await compile(`@import 'tailwindcss' source(none);\n@import './src/styles/instacart.css';`, {
  base: ROOT,
  onDependency() {},
});

// The sync stylesheet's safelist (`@source inline`), plus every class string the components use.
const dsSource = fs.readFileSync(path.join(ROOT, '.design-sync/ds.source.css'), 'utf8');
const syncCompiler = await compile(dsSource, { base: path.join(ROOT, '.design-sync'), onDependency() {} });
const syncCss = syncCompiler.build([]);
const componentText = fs
  .readdirSync(path.join(ROOT, 'src/components'), { recursive: true })
  .filter((f) => /\.tsx$/.test(f) && !/\.test\.tsx$/.test(f))
  .map((f) => fs.readFileSync(path.join(ROOT, 'src/components', f), 'utf8'))
  .join('\n');

/** Class claims: { cls, want: 'alive' | 'dead' | 'prose', where } */
const claims = [];
let phosphorLine = false; // the current line talks about Phosphor icons
const mentioned = new Set();

function checkComponentName(name, where, { inCode }) {
  if (api.components.has(name)) {
    mentioned.add(name);
    return true;
  }
  if (KNOWN_GAPS.has(name)) {
    // Naming a missing part in prose is fine; mounting it in an example is not.
    if (inCode) err(where, `\`${name}\` is not built yet, but an example uses it.`);
    return false;
  }
  if (iconSet.has(name)) return false; // an icon from the set: no docs needed
  if (/Icon$/.test(name) && phosphor.has(name)) {
    err(where, `\`${name}\` is a Phosphor icon, but not in the icon set. Add it to src/icons/index.ts, or use an icon from the set.`);
    return false;
  }
  if (api.exports.has(name)) return false; // a type, such as ButtonVariant
  if (FOREIGN.has(name)) return false;
  if ((inCode || phosphorLine) && phosphor.has(name)) return false;
  err(where, `\`${name}\` is not a component in ${entry}${inCode ? ' (nor a Phosphor icon)' : ''}.`);
  return false;
}

function checkProp(comp, propName, value, kind, where, how) {
  const c = api.components.get(comp);
  if (!c) return;
  if (/^data-/.test(propName) || propName === 'key' || propName === 'ref') return;
  const p = c.props.get(propName);
  if (!p) {
    err(where, `${comp} has no prop \`${propName}\`${how ? ` (from ${how})` : ''}.`);
    return;
  }
  if (kind !== 'string' || value == null || /\{\{.*\}\}/.test(value)) return;
  if (p.acceptsString || p.literals.includes(value)) return;
  if (p.literals.length) err(where, `${comp} \`${propName}="${value}"\`: not an allowed value (${p.literals.join(', ')}).`);
  else err(where, `${comp} \`${propName}="${value}"\` is a string, but the prop is \`${p.text}\`. Use a {{hole}}.`);
}

function checkXImport(body, where) {
  const attrs = parseAttrs(body);
  const from = attrs.find((a) => a.name === 'component-from-global-scope');
  const m = from?.value?.match(/^Instacart\.([A-Za-z]+)$/);
  if (m?.[1] === 'NAME') return;
  if (!m) {
    if (from) err(where, `x-import names \`${from.value}\`, not \`Instacart.<Component>\`.`);
    return;
  }
  const comp = m[1];
  if (!checkComponentName(comp, where, { inCode: true })) return;
  for (const a of attrs) {
    if (a.name === 'component-from-global-scope' || a.name === 'style') continue;
    if (a.name === 'class') {
      err(where, `\`class\` on an x-import (${comp}) overwrites its styling. Write \`class-name\`.`);
      continue;
    }
    if (a.name === 'class-name') {
      for (const cls of (a.value ?? '').split(/\s+/).filter(Boolean)) claims.push({ cls, want: 'alive', where });
      continue;
    }
    checkProp(comp, attrToProp(a.name), a.value, a.kind, where, a.name.includes('-') ? `\`${a.name}\`` : '');
  }
}

function checkJsx(name, body, where) {
  if (!checkComponentName(name, where, { inCode: true })) return;
  for (const a of parseAttrs(body)) {
    if (a.name === 'className') {
      if (a.kind === 'string') for (const cls of a.value.split(/\s+/).filter(Boolean)) claims.push({ cls, want: 'alive', where });
      continue;
    }
    checkProp(name, a.name, a.value, a.kind, where);
  }
}

/** Code: a fenced block's line, or an inline span. */
function scanCode(code, where) {
  if (/<!--\s*wrong\s*-->|\/\/\s*wrong\b/.test(code)) return;
  for (const m of code.matchAll(/<x-import\b([^>]*)>/g)) checkXImport(m[1], where);
  for (const m of code.matchAll(/<([A-Z][A-Za-z0-9]*)((?:\s+(?:[^<>{}]|\{(?:[^{}]|\{[^{}]*\})*\})*)?)\s*\/?>/g)) checkJsx(m[1], m[2] ?? '', where);
  // Plain HTML classes (class="" outside an x-import) and JSX className="".
  for (const m of code.matchAll(/<(?!x-import\b)[a-z][\w-]*\b[^>]*?\sclass(?:Name)?="([^"]*)"/g)) {
    if (/\{\{/.test(m[1])) continue;
    for (const cls of m[1].split(/\s+/).filter(Boolean)) claims.push({ cls, want: 'alive', where });
  }
}

/** An inline span outside a table class column. */
function scanSpan(span, where) {
  if (/[<>]/.test(span)) return scanCode(span, where);
  // `Button variant="primary"`, `Button asChild`, `Text as="label"`
  const inline = span.match(/^([A-Z][A-Za-z0-9]*)(\s+[\s\S]*)?$/);
  if (inline) {
    const [, name, rest] = inline;
    if (!rest) {
      checkComponentName(name, where, { inCode: false });
      return;
    }
    if (/^(\s+[A-Za-z][\w-]*(=(?:"[^"]*"|\{[^}]*\}))?)+$/.test(rest)) checkJsx(name, rest, where);
    return;
  }
  const inst = span.match(/^Instacart\.([A-Za-z]+)$/);
  if (inst) {
    checkComponentName(inst[1], where, { inCode: false });
    return;
  }
  if (/[="{]/.test(span)) return;
  const tokens = span.split(/\s+/).filter(Boolean);
  if (tokens.length && tokens.every((t) => UTILITY.test(t) && !/\[/.test(t))) {
    for (const cls of tokens) claims.push({ cls, want: 'prose', where });
  }
}

/* ------------------------------------------------------------------------- */

for (const rel of DOCS) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) {
    err(rel, 'file is missing.');
    continue;
  }
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let fence = false;
  let header = null; // current table's header cells
  let current = null; // the guide entry being read (### `X`)

  lines.forEach((line, i) => {
    const where = `${rel}:${i + 1}`;
    // `Instacart.<Name>` is a placeholder, not a component.
    line = line.replace(/Instacart\.<Name>/g, 'Instacart.NAME');
    phosphorLine = /Phosphor/.test(line) || /Phosphor/.test(lines[i - 1] ?? '');
    if (/^\s*```/.test(line)) {
      fence = !fence;
      return;
    }
    if (fence) {
      scanCode(line, where);
      return;
    }
    for (const m of line.matchAll(/Instacart\.([A-Z][a-z][A-Za-z]*)/g)) checkComponentName(m[1], where, { inCode: false });

    const h = line.match(/^###\s+`([A-Z][A-Za-z]*)`/);
    if (h) {
      current = h[1];
      checkComponentName(current, where, { inCode: false });
    } else if (/^#{1,2}\s/.test(line)) current = null;

    const isRow = /^\s*\|/.test(line);
    if (!isRow) header = null;
    if (isRow && /^\s*\|[\s|:-]+\|\s*$/.test(line)) return; // separator
    if (isRow && !header) {
      header = cells(line).map((c) => c.toLowerCase());
      return;
    }

    if (isRow) {
      const row = cells(line);
      const classTable = header.includes('not') || header[0] === 'class';
      const propsTable = header[0] === 'prop';
      row.forEach((cellText, col) => {
        const name = header[col] ?? '';
        if (classTable && (name === 'use' || name === 'class' || name === 'not')) {
          for (const s of spans(cellText)) {
            for (const cls of s.split(/\s+/).filter(Boolean)) claims.push({ cls, want: name === 'not' ? 'dead' : 'alive', where });
          }
          return;
        }
        if (propsTable && current && col <= 2) {
          const c = api.components.get(current);
          const [propSpan] = spans(row[0]);
          if (col === 0 && propSpan && c && !c.props.has(propSpan)) err(where, `${current} has no prop \`${propSpan}\` (props table).`);
          if (col === 1 && propSpan && spans(cellText)[0] && spans(cellText)[0] !== canvasAttr(propSpan))
            err(where, `canvas form of \`${propSpan}\` is \`${canvasAttr(propSpan)}\`, not \`${spans(cellText)[0]}\`.`);
          const lit = c?.props.get(propSpan)?.literals.length ?? 0;
          if (col === 2 && propSpan && lit > 0 && lit <= 12) {
            const p = c.props.get(propSpan);
            for (const v of spans(cellText)) if (!p.literals.includes(v) && !p.extras.includes(v)) err(where, `${current} \`${propSpan}\` has no value \`${v}\`.`);
          }
          return;
        }
        for (const s of spans(cellText)) scanSpan(s, where);
        for (const m of cellText.replace(/`[^`]*`/g, '').matchAll(/\*\*([A-Z][A-Za-z]+)\*\*/g)) {
          if (!BOLD_WORDS.has(m[1])) checkComponentName(m[1], where, { inCode: false });
        }
      });
      return;
    }

    for (const s of spans(line)) scanSpan(s, where);
    for (const m of line.replace(/`[^`]*`/g, '').matchAll(/\*\*([A-Z][A-Za-z]+)\*\*/g)) {
      if (!BOLD_WORDS.has(m[1])) checkComponentName(m[1], where, { inCode: false });
    }
  });
}

/* ---- classes: compile them all with the real theme ---------------------- */

const asCandidate = (cls) => (cls.endsWith(':') ? `${cls}flex` : cls);
const deadDocumented = new Set([...DEAD_EXAMPLES, ...claims.filter((c) => c.want === 'dead').map((c) => c.cls)]);
const candidates = [...new Set([...claims.map((c) => asCandidate(c.cls)), ...DEAD_EXAMPLES])];
const css = compiler.build(candidates);
const alive = (cls) => MARKERS.test(cls) || css.includes(`.${escapeClass(asCandidate(cls))}`);
const inSync = (cls) =>
  cls.endsWith(':') ||
  syncCss.includes(`.${escapeClass(cls)}`) ||
  new RegExp(`(^|[\\s'"\`])${cls.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}(?=[\\s'"\`]|$)`, 'm').test(componentText);

for (const cls of DEAD_EXAMPLES) if (alive(cls)) err('scripts/check-rule-names.mjs', `DEAD_EXAMPLES lists \`${cls}\`, but it compiles.`);

const seen = new Set();
for (const { cls, want, where } of claims) {
  const key = `${where}|${cls}|${want}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const isAlive = alive(cls);
  if (want === 'dead') {
    if (isAlive) err(where, `\`${cls}\` is listed under "Not", but it compiles. Pick an example that is really off the scale.`);
  } else if (!isAlive) {
    if (want === 'prose' && deadDocumented.has(cls)) continue; // cited as a wrong example
    err(where, `\`${cls}\` compiles to nothing with the real theme (src/styles/theme.css).`);
  } else if (want !== 'prose' && !inSync(cls)) {
    warn(where, `\`${cls}\` compiles, but is not in the sync safelist (.design-sync/ds.source.css) or any component, so it renders unstyled in Claude Design.`);
  }
}

/* ---- every component is taught somewhere --------------------------------- */

for (const name of api.components.keys()) {
  if (!mentioned.has(name)) warn(entry, `${name} is exported but never named in the rules for Claude.`);
}
for (const name of KNOWN_GAPS) {
  if (api.components.has(name)) err(entry, `${name} now exists, but the docs still treat it as missing. Update KNOWN_GAPS and the "Missing parts" sections.`);
}

/* ------------------------------------------------------------------------- */

const classCount = new Set(claims.map((c) => c.cls)).size;
console.log(`check:rules  ${DOCS.length} files, ${classCount} classes, ${mentioned.size}/${api.components.size} components, checked against ${entry}`);
for (const w of warnings) console.log(`  warning  ${w}`);
for (const e of errors) console.log(`  error    ${e}`);
if (errors.length) {
  console.log(`\n${errors.length} error(s). Every name in the rules must exist in the build.`);
  process.exit(1);
}
console.log(warnings.length ? `OK, with ${warnings.length} warning(s).` : 'OK: every name exists.');
