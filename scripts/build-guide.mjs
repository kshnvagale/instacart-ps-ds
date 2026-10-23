#!/usr/bin/env node
/**
 * Builds the design skill's component guide from the components themselves:
 *
 *   npm run build:guide
 *   -> skills/instacart-design/guidelines/components.md
 *
 * Every rule in the guide comes from source:
 *   - each entry's text is the component's own TSDoc header (src/components/X/X.tsx);
 *   - each props table is the component's own props, read with the TypeScript
 *     compiler (names, values, required or not, @default and TSDoc).
 * Only three things are written here by hand, and `npm run check:rules`
 * validates every name in them: the Need -> Use table, the canvas example for
 * each component, and the "Missing parts" section.
 *
 * The output is committed, together with skills/instacart-design.zip (the
 * skill as Claude uploads it). Re-run this after changing any component's
 * TSDoc or props, or SKILL.md, then run `npm run check:rules`.
 * `--zip-only` re-zips the skill without regenerating the guide.
 *
 * `loadApi()` is also used by scripts/check-rule-names.mjs.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'skills/instacart-design/guidelines/components.md');

/* ---------------------------------------------------------------------------
 * The public API, read from a TypeScript entry (src/index.ts or dist/index.d.ts)
 * ------------------------------------------------------------------------- */

const isPascal = (s) => /^[A-Z][A-Za-z0-9]*$/.test(s);

/** camelCase prop -> the attribute a canvas `x-import` needs. `aria-*` and `data-*` stay. */
export const canvasAttr = (prop) => (/^(aria|data)-/.test(prop) ? prop : prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));

/** Canvas attribute -> prop, exactly as the canvas runtime does it on an x-import. */
export const attrToProp = (attr) => (/^(aria|data)-/.test(attr) ? attr : attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase()));

function describeType(checker, type) {
  const parts = type.isUnion() ? type.types : [type];
  const literals = [];
  let acceptsString = false;
  let other = [];
  for (const t of parts) {
    if (t.flags & ts.TypeFlags.Undefined || t.flags & ts.TypeFlags.Null) continue;
    if (t.isStringLiteral()) literals.push(t.value);
    else if (t.flags & (ts.TypeFlags.String | ts.TypeFlags.TemplateLiteral | ts.TypeFlags.Any | ts.TypeFlags.Unknown)) acceptsString = true;
    // `string & {}`: "any string, but keep the literal suggestions".
    else if (t.isIntersection() && t.types.some((x) => x.flags & ts.TypeFlags.String)) acceptsString = true;
    else other.push(t);
  }
  // `true | false` is how TS spells boolean.
  const bools = other.filter((t) => t.flags & ts.TypeFlags.BooleanLiteral);
  other = other.filter((t) => !(t.flags & ts.TypeFlags.BooleanLiteral));
  const text = [
    ...literals.map((v) => JSON.stringify(v)),
    ...(acceptsString ? ['string'] : []),
    ...(bools.length ? ['boolean'] : []),
    ...other.map((t) => checker.typeToString(t)),
  ];
  const extras = text.slice(literals.length);
  return { literals, acceptsString, extras, text: [...new Set(text)].join(' | ') };
}

/**
 * Every exported component with its props.
 * @returns {{ entry: string, components: Map<string, Component>, exports: Set<string> }}
 */
export function loadApi(entry) {
  const program = ts.createProgram([entry], {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    esModuleInterop: true,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);
  if (!source) throw new Error(`cannot read ${entry}`);
  const moduleSymbol = checker.getSymbolAtLocation(source);
  const all = checker.getExportsOfModule(moduleSymbol);
  const resolve = (s) => (s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s);
  const byName = new Map(all.map((s) => [s.getName(), resolve(s)]));

  const components = new Map();
  for (const [name, sym] of byName) {
    if (!isPascal(name) || !(sym.flags & ts.SymbolFlags.Value)) continue;
    const propsSym = byName.get(`${name}Props`);
    if (!propsSym) continue;
    const decl = sym.valueDeclaration ?? sym.declarations?.[0];
    const propsDecl = propsSym.declarations?.find((d) => ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d));
    const propsType = checker.getDeclaredTypeOfSymbol(propsSym);

    const props = new Map();
    for (const p of checker.getPropertiesOfType(propsType)) {
      const pDecl = p.valueDeclaration ?? p.declarations?.[0];
      const own = !!pDecl && pDecl.parent === propsDecl;
      const type = pDecl ? checker.getTypeOfSymbolAtLocation(p, pDecl) : checker.getTypeOfSymbol(p);
      const tags = p.getJsDocTags(checker);
      const def = tags.find((t) => t.name === 'default');
      props.set(p.getName(), {
        name: p.getName(),
        own,
        required: !(p.flags & ts.SymbolFlags.Optional),
        doc: ts.displayPartsToString(p.getDocumentationComment(checker)).trim(),
        default: def ? ts.displayPartsToString(def.text).trim() : undefined,
        // The type as written in source (`React.ReactNode`, `UnitPrice`), for display.
        written: pDecl && pDecl.type ? pDecl.type.getText() : undefined,
        ...describeType(checker, type),
      });
    }

    components.set(name, {
      name,
      file: decl?.getSourceFile().fileName,
      doc: ts.displayPartsToString(sym.getDocumentationComment(checker)).trim(),
      examples: sym
        .getJsDocTags(checker)
        .filter((t) => t.name === 'example')
        .map((t) => ts.displayPartsToString(t.text).trim()),
      props,
    });
  }
  return { entry, components, exports: new Set(byName.keys()) };
}

/* ---------------------------------------------------------------------------
 * The hand-written parts (all names validated by check:rules)
 * ------------------------------------------------------------------------- */

/** Each row is its own line, so a single row can be changed or removed. */
const NEEDS = [
  ['The one main action on a view ("Add to cart", "Checkout")', '`Button variant="primary"`'],
  ['Another action ("Show all", "View more")', '`Button variant="secondary"`'],
  ['A quiet action beside a filled one ("Log in")', '`Button variant="tertiary"`'],
  ['Remove or cancel something ("Remove", "Cancel order")', '`Button variant="danger"`'],
  ['A strong action that must not read as the brand green', '`Button variant="neutral"`'],
  ['A call to action that goes to another page ("Start shopping")', '`Button asChild` around an `<a href>`'],
  ['A button that is busy while "Add to cart" is sent', '`Button loading`'],
  ['A compact icon-only action ("+" on a product tile, "Close")', '`IconButton` with an `aria-label`'],
  ['Go to another page, or a link inside a sentence', '`Link`'],
  ['A page, section or product title', '`Heading` (with `as`)'],
  ['Body copy, fine print, a product size ("12 oz")', '`Text`'],
  ['The label of a field', '`Text as="label"` with `htmlFor`'],
  ['Any money amount ("$3.99", "$0.42/oz")', '`Price`'],
  ['A sale price with the old price', '`Price tone="sale"` with `wasAmount`'],
  ['A deal tag with no amount ("Sale", "No markups")', '`Badge tone="sale"`'],
  ['A fact or status ("Out of stock", "Organic", "Delivered")', '`Badge`'],
  ['A single-line text field, or a search', '`Input`'],
  ['A yes/no choice that applies when the form is submitted ("Leave at door")', '`Checkbox`'],
  ['A setting that applies instantly ("Substitution alerts")', '`Switch`'],
  ['A person: the shopper, a customer, the signed-in account', '`Avatar`'],
  ['An icon beside text, or on its own with a label', '`Icon`'],
  ['The Instacart brand', '`Logo`'],
  ['A wait you cannot measure ("Finding your shopper")', '`Spinner`'],
  ['An item quantity (- 1 +) in the cart or on a product tile', '`QuantityStepper` with a `label` ("Quantity of Organic Lemons")'],
];

/** The sections, in reading order. Each exported component must be in one. */
const GROUPS = [
  ['Actions', ['Button', 'IconButton', 'Link']],
  ['Text and prices', ['Heading', 'Text', 'Price']],
  ['Status', ['Badge', 'Spinner']],
  ['Forms', ['Input', 'Checkbox', 'Switch', 'QuantityStepper']],
  ['People, icons and brand', ['Avatar', 'Icon', 'Logo']],
];

const PLUS_ICON = '<x-import component-from-global-scope="Instacart.PlusIcon"></x-import>';
const CLOCK_ICON = '<x-import component-from-global-scope="Instacart.ClockIcon"></x-import>';

/**
 * The icon set: every name exported by src/icons/index.ts (Phosphor icons
 * re-exported so the bundle carries them into Claude Design).
 * Also used by scripts/check-rule-names.mjs.
 */
export function loadIconNames(file = path.join(ROOT, 'src/icons/index.ts')) {
  const src = fs.readFileSync(file, 'utf8').replace(/\/\/.*$/gm, '');
  const names = [];
  for (const block of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of block[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop();
      if (name) names.push(name);
    }
  }
  return names.sort();
}

function iconsSection(names) {
  return `## Icons

The icons are real exports of this system (Phosphor, Regular weight). Only these exist: on a canvas each is \`Instacart.\` plus its name (\`Instacart.ShoppingCartIcon\`), in code \`import { ShoppingCartIcon } from 'instacart-ps-ds'\`. Never draw an \`<svg>\` by hand. To use an icon that is not listed, a developer must first add it to \`src/icons/index.ts\`.

Put one icon inside \`Icon\` (or straight inside a \`Button\`, \`IconButton\` or \`Badge\`), and give the icon no props: the wrapper sets its size and colour.

${names.map((n) => `\`${n}\``).join(', ')}

**On a canvas:**

\`\`\`html
<x-import component-from-global-scope="Instacart.Icon" size="md"><x-import component-from-global-scope="Instacart.ShoppingCartIcon"></x-import></x-import>
\`\`\`

**In code:**

\`\`\`tsx
<Icon size="md"><ShoppingCartIcon /></Icon>
\`\`\``;
}

/** One canvas example per component, in x-import form. */
const CANVAS = {
  Button: `<x-import component-from-global-scope="Instacart.Button" variant="primary" size="xl" class-name="w-full" loading="{{adding}}">Add to cart</x-import>`,
  IconButton: `<x-import component-from-global-scope="Instacart.IconButton" aria-label="Add Organic Lemons to cart" size="sm">\n  ${PLUS_ICON}\n</x-import>`,
  Link: `<x-import component-from-global-scope="Instacart.Link" href="/help/fees" underline="hover">See fees</x-import>`,
  Heading: `<x-import component-from-global-scope="Instacart.Heading" as="h2">Often Bought With</x-import>`,
  Text: `<x-import component-from-global-scope="Instacart.Text" variant="body-sm" tone="muted">Delivery by 7:30am</x-import>`,
  Price: `<x-import component-from-global-scope="Instacart.Price" amount="{{lemonPrice}}" was-amount="{{lemonWas}}" unit-price="{{lemonUnit}}" tone="sale"></x-import>`,
  Badge: `<x-import component-from-global-scope="Instacart.Badge" tone="danger" size="sm">Out of stock</x-import>`,
  Spinner: `<div class="flex items-center gap-3">\n  <x-import component-from-global-scope="Instacart.Spinner" label="Finding your shopper"></x-import>\n  <x-import component-from-global-scope="Instacart.Text">Finding your shopper…</x-import>\n</div>`,
  Input: `<x-import component-from-global-scope="Instacart.Text" as="label" variant="label" html-for="promo">Promo code</x-import>\n<x-import component-from-global-scope="Instacart.Input" id="promo" auto-complete="off" aria-invalid="true" aria-describedby="promo-error"></x-import>\n<x-import component-from-global-scope="Instacart.Text" id="promo-error" variant="body-sm" tone="danger">This code has expired</x-import>`,
  Checkbox: `<div class="flex items-center gap-2">\n  <x-import component-from-global-scope="Instacart.Checkbox" id="leave-at-door" name="leaveAtDoor"></x-import>\n  <x-import component-from-global-scope="Instacart.Text" as="label" html-for="leave-at-door">Leave at door</x-import>\n</div>`,
  Switch: `<div class="flex items-center justify-between gap-4">\n  <x-import component-from-global-scope="Instacart.Text" as="label" html-for="sub-alerts">Substitution alerts</x-import>\n  <x-import component-from-global-scope="Instacart.Switch" id="sub-alerts" default-checked="{{yes}}" on-checked-change="{{saveSubstitutionAlerts}}"></x-import>\n</div>`,
  Avatar: `<x-import component-from-global-scope="Instacart.Avatar" src="{{shopperPhoto}}" name="Maria Lopez" tone="brand" alt="Maria Lopez, your shopper"></x-import>`,
  Icon: `<x-import component-from-global-scope="Instacart.Icon" size="sm" tone="brand">\n  ${CLOCK_ICON}\n</x-import>`,
  Logo: `<x-import component-from-global-scope="Instacart.Logo" tone="color" size="md"></x-import>`,
  QuantityStepper: `<x-import component-from-global-scope="Instacart.QuantityStepper" label="Quantity of Organic Lemons" size="sm" value="{{lemonCount}}" min="{{one}}" on-value-change="{{setLemonCount}}"></x-import>`,
};

const MISSING = `## Missing parts

This system has atoms only. When a screen needs a part that is not here:

1. **Compose it from atoms** and the classes in the README's class table.
2. **Name what it stands for** in a comment (\`<!-- ProductCard (composed) -->\`), so developers can swap in the real one.
3. **Never hand-build a control.** No styled \`<button>\`, \`<input>\`, \`<select>\` or \`<a>\`.

| Missing part | What to do until it exists |
|---|---|
| ProductCard, Card | A \`div\` with \`flex flex-col gap-2 rounded-lg border border-border bg-surface p-4\`, holding an \`img\`, \`Heading\`, \`Price\`, \`Badge\` and \`Button\`. |
| Tabs | A row of \`Link\` elements if each tab is its own page. Otherwise say the part is missing. |
| Radio group, select | Not built. Do not fake a one-of-several choice with Checkboxes. Say the part is missing. |
| Dialog, sheet, toast | Not built. Compose the frame from layout classes (\`bg-surface rounded-lg shadow-overlay p-6\`) and put real atoms inside. Mark it composed. |
`;

/* ---------------------------------------------------------------------------
 * Rendering
 * ------------------------------------------------------------------------- */

const cell = (s) => s.replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim();

/** cva `defaultVariants` in a component file, for props with no @default tag. */
function cvaDefaults(file) {
  const out = {};
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/defaultVariants:\s*\{([^}]*)\}/g)) {
    for (const kv of m[1].matchAll(/(\w+):\s*'([^']*)'/g)) out[kv[1]] ??= `'${kv[2]}'`;
  }
  return out;
}

function propsTable(c) {
  const own = [...c.props.values()].filter((p) => p.own);
  if (!own.length) return '';
  const defaults = cvaDefaults(c.file);
  const rows = own.map((p) => {
    const values = p.literals.length && p.literals.length <= 12
      ? [...p.literals, ...p.extras].map((v) => `\`${v}\``).join(' ')
      : `\`${p.written ?? p.text}\``;
    const def = p.default ?? defaults[p.name] ?? '';
    const name = `\`${p.name}\`${p.required ? ' (required)' : ''}`;
    const attr = p.name === 'children' ? 'the tag\'s content' : `\`${canvasAttr(p.name)}\``;
    return `| ${name} | ${attr} | ${cell(values)} | ${def ? `\`${cell(def)}\`` : ''} | ${cell(p.doc)} |`;
  });
  return [
    `**Props** this component adds (it also takes the usual HTML attributes of its element):`,
    '',
    '| Prop | On a canvas | Values | Default | What it does |',
    '|---|---|---|---|---|',
    ...rows,
  ].join('\n');
}

function entry(c) {
  const parts = [`### \`${c.name}\``, '', c.doc];
  const table = propsTable(c);
  if (table) parts.push('', table);
  if (CANVAS[c.name]) parts.push('', '**On a canvas:**', '', '```html', CANVAS[c.name], '```');
  if (c.examples.length) parts.push('', '**In code:**', '', '```tsx', c.examples.join('\n\n'), '```');
  return parts.join('\n');
}

export function renderGuide(api) {
  const grouped = new Set(GROUPS.flatMap(([, names]) => names));
  const ungrouped = [...api.components.keys()].filter((n) => !grouped.has(n));
  const groups = ungrouped.length ? [...GROUPS, ['Other', ungrouped]] : GROUPS;

  const out = [
    '<!-- GENERATED by scripts/build-guide.mjs from the components\' TSDoc. Edit the source, then run `npm run build:guide`. -->',
    '',
    '# Instacart component guide',
    '',
    'Use this guide to choose a component and learn its rules. Start from the **Need → Use** table, then read the entry for each component you use. Every entry below is the component\'s own source documentation, and every props table is read from its TypeScript types.',
    '',
    'On a canvas, each component is `<x-import component-from-global-scope="Instacart.<Name>">`. Write `class-name`, never `class`, and write each prop in the **On a canvas** column form (`was-amount`, not `wasAmount` or `wasamount`). A value that is not text (a boolean, a number, an object or a handler) goes in a `{{ }}` hole from `renderVals()`: `loading="{{adding}}"`, `amount="{{lemonPrice}}"`.',
    '',
    '## Need → Use',
    '',
    '| Need | Use |',
    '|---|---|',
    ...NEEDS.map(([need, use]) => `| ${need} | ${use} |`),
  ];
  for (const [title, names] of groups) {
    out.push('', `## ${title}`);
    for (const n of names) {
      const c = api.components.get(n);
      if (c) out.push('', entry(c));
    }
  }
  out.push('', iconsSection(loadIconNames()));
  out.push('', MISSING);
  return out.join('\n');
}

/* ------------------------------------------------------------------------- */

/**
 * skills/instacart-design.zip: SKILL.md and guidelines/ at the zip's root,
 * the shape Claude's "upload a skill" takes. Uses the system `zip`.
 */
function writeZip() {
  const dir = path.join(ROOT, 'skills/instacart-design');
  const zip = path.join(ROOT, 'skills/instacart-design.zip');
  fs.rmSync(zip, { force: true });
  const r = spawnSync('zip', ['-r', '-X', '-q', zip, 'SKILL.md', 'guidelines', '-x', '.*', '*/.*'], { cwd: dir });
  if (r.status !== 0) {
    console.warn(`build:guide could not write ${path.relative(ROOT, zip)} (is \`zip\` installed?)`);
    return;
  }
  console.log(`build:guide wrote ${path.relative(ROOT, zip)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // --zip-only: re-zip the skill as it is, without regenerating the guide.
  if (!process.argv.includes('--zip-only')) {
    const api = loadApi(path.join(ROOT, 'src/index.ts'));
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, renderGuide(api));
    console.log(`build:guide wrote ${path.relative(ROOT, OUT)} (${api.components.size} components)`);
  }
  writeZip();
}
