/**
 * Deterministic rules. These are facts, not opinions, so they are errors and
 * they fail the check. Everything here mirrors a rule in a component's TSDoc
 * header (src/components/<Name>/<Name>.tsx), the instacart-design skill, or the
 * class table in .design-sync/conventions.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile } from '@tailwindcss/node';

/** Marker classes that compile to nothing by design. */
const MARKERS = /^(group|peer)(\/[\w-]+)?$/;

/** A raw element and the Instacart atom that replaces it. */
const RAW_ELEMENTS = {
  button: 'Button (or IconButton for an icon with no text)',
  a: 'Link (or Button asChild for a call to action that navigates)',
  input: 'Input, or Checkbox (saved on submit) / Switch (applies instantly) for a yes/no',
  h1: 'Heading', h2: 'Heading', h3: 'Heading', h4: 'Heading', h5: 'Heading', h6: 'Heading',
  img: 'Logo for the Instacart logo',
};

/** A product photo is a plain `<img>` (there is no image atom); only a logo image is flagged. */
const isLogoImage = (el) => /logo|instacart/i.test(`${el.attrs.src ?? ''} ${el.attrs.alt ?? ''}`);

/** Hints for a raw `<input>`, by its type: full sentences. */
const RAW_INPUT = {
  checkbox: 'Use Checkbox (saved when the form is submitted) or Switch (applies instantly).',
  radio: 'This system has no radio group yet: flag the gap instead of faking one.',
  number: 'For an item quantity use QuantityStepper. For any other number use Input.',
  range: 'This system has no slider yet: flag the gap.',
};

/** Inline style properties that must come from tokens or utilities. */
const STYLE_PROPS = /^(color|background|backgroundColor|border|borderColor|borderRadius|boxShadow|fill|stroke|font|fontSize|fontWeight|fontFamily|lineHeight|letterSpacing|margin\w*|padding\w*|gap|rowGap|columnGap|width|height|minWidth|maxWidth|minHeight|maxHeight|top|right|bottom|left|inset|zIndex|opacity)$/;

const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?|oklch|oklab|lab|lch)\(/;

const INTERACTIVE_ATTRS = ['onClick', 'onKeyDown', 'onPointerDown', 'href', 'tabIndex'];

let compilerPromise;
function tailwind(root) {
  // Tailwind plus OUR theme, which removes every stock scale and adds back only
  // ours, so `gap-7`, `bg-white` or `shadow-lg` compile to nothing.
  compilerPromise ??= compile(`@import 'tailwindcss';\n@import './src/styles/instacart.css';`, {
    base: root,
    onDependency() {},
  });
  return compilerPromise;
}

let syncCssCache;
/** The compiled design-sync stylesheet (`ds.css`), if a sync build exists. */
function designCss(root) {
  if (syncCssCache === undefined) {
    const file = path.join(root, 'ds.css');
    syncCssCache = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  }
  return syncCssCache;
}

let recipesPromise;
/**
 * Each atom's default recipe classes, read from the built package's `cva`
 * exports (`avatarVariants()` and so on). Short recipes (Text, Heading, Logo)
 * are left out: a plain element may share a few classes by chance.
 */
function recipes(root) {
  recipesPromise ??= (async () => {
    const file = path.join(root, 'dist/index.js');
    if (!fs.existsSync(file)) return [];
    try {
      const mod = await import(pathToFileURL(file).href);
      return Object.entries(mod)
        .filter(([k, v]) => /^[a-z]\w*Variants$/.test(k) && typeof v === 'function')
        .map(([k, v]) => ({ atom: k.replace(/Variants$/, '').replace(/^\w/, (c) => c.toUpperCase()), classes: String(v()).split(/\s+/).filter(Boolean) }))
        .filter((r) => r.classes.length >= 8 && !/(Thumb|Current|Secondary)$/.test(r.atom));
    } catch {
      return [];
    }
  })();
  return recipesPromise;
}
/** Share of a recipe's classes an element must carry to count as that atom. */
const RECIPE_MATCH = 0.7;

const escapeClass = (c) => c.replace(/[^a-zA-Z0-9_-]/g, (m) => `\\${m}`);

export async function staticRules(design, { root }) {
  const findings = [];
  const add = (el, rule, severity, message) =>
    findings.push({ rule, severity, line: el.line, column: el.column, message, evidence: el.openingText.slice(0, 160) });

  // Dead classes: compile every class with the real theme; what emits no
  // selector does not exist in this system.
  const all = [...new Set(design.elements.flatMap((e) => e.classes))];
  const css = (await tailwind(root)).build(all);
  const dead = new Set(all.filter((c) => !MARKERS.test(c) && !css.includes(`.${escapeClass(c)}`)));
  // Valid in code but not in the stylesheet Claude Design renders with (the
  // safelist in .design-sync/ds.source.css plus what components use).
  const syncCss = designCss(root);
  const unsynced = new Set(syncCss ? all.filter((c) => !dead.has(c) && !MARKERS.test(c) && !/\[/.test(c) && !syncCss.includes(`.${escapeClass(c)}`)) : []);

  const atomRecipes = design.elements.some((e) => e.renderedClasses) ? await recipes(root) : [];
  let primaries = 0;
  const hasTheme = /data-theme/.test(design.text);

  for (const el of design.elements) {
    for (const c of el.classes) {
      if (dead.has(c)) add(el, 'dead-class', 'error', `\`${c}\` compiles to nothing: it is not on an Instacart scale (see the class table in .design-sync/conventions.md).`);
      else if (/\[[^\]]+\]/.test(c)) add(el, 'arbitrary-value', 'error', `\`${c}\` is an arbitrary value. Use a token utility instead.`);
      else if (unsynced.has(c)) add(el, 'not-in-design-css', 'warning', `\`${c}\` is a valid Instacart class but missing from the Claude Design stylesheet, so it renders unstyled there. Add it to the safelist in .design-sync/ds.source.css.`);
    }

    const layout = [];
    for (const s of el.style) {
      if (STYLE_PROPS.test(s.prop) && !/var\(--/.test(String(s.value))) {
        add(el, 'inline-style', 'error', `inline \`${s.prop}: ${s.value}\`. Use a token utility or the component's own prop.`);
      } else if (!STYLE_PROPS.test(s.prop)) layout.push(`${s.prop}: ${s.value}`);
    }
    if (layout.length) {
      // Layout in a style attribute (a canvas's visual editor writes these)
      // silently overrides the classes beside it: `display: flex` undoes `grid`.
      add(el, 'inline-layout', 'warning', `inline layout (${layout.join('; ')}) overrides this element's classes. Express it as classes so code and design agree.`);
    }

    // A component's own output (rendered HTML) is the component's business.
    const own = el.insideComponent || (!el.intrinsic && 'data-slot' in el.attrs);
    for (const [name, value] of Object.entries(el.attrs)) {
      if (own || name === 'style' || name === 'd') continue;
      if (typeof value === 'string' && RAW_COLOR.test(value)) {
        add(el, 'raw-color', 'error', `raw colour in \`${name}="${value}"\`. Colours come from tokens.`);
      }
    }

    if (el.intrinsic && !el.insideComponent && RAW_ELEMENTS[el.tag] && !el.parent?.attrs.asChild && (el.tag !== 'img' || isLogoImage(el))) {
      const type = typeof el.attrs.type === 'string' ? el.attrs.type.toLowerCase() : '';
      const hint = el.tag === 'input' && RAW_INPUT[type] ? RAW_INPUT[type] : `Use ${RAW_ELEMENTS[el.tag]}.`;
      const shown = el.tag === 'input' && type ? `<input type="${type}">` : `<${el.tag}>`;
      add(el, 'raw-element', 'error', `raw \`${shown}\`. ${hint}`);
    }

    // `class` on a component (a canvas x-import passes it through unchanged)
    // overwrites the component's own classes: it renders unstyled.
    // (Source only: in rendered HTML every element has a class attribute.)
    if (!el.intrinsic && /^[A-Z]/.test(el.tag) && 'class' in el.attrs && !('data-slot' in el.attrs)) {
      add(el, 'component-class', 'error', `\`class\` on ${el.tag} replaces its own styling, so it renders unstyled. In a canvas write \`class-name="${el.attrs.class}"\`; in code, \`className\`.`);
    }

    // Rendered HTML: an element outside every component that carries an atom's
    // recipe but no data-slot is either a hand-built copy of that atom or an
    // atom that lost its data-slot (a design-system bug). Tools cannot tell it
    // is a component either way.
    if (el.renderedClasses && el.intrinsic && !el.insideComponent && el.renderedClasses.length) {
      const have = new Set(el.renderedClasses);
      const match = atomRecipes.find((r) => r.classes.filter((c) => have.has(c)).length / r.classes.length >= RECIPE_MATCH);
      if (match) add(el, 'missing-slot', 'error', `this \`<${el.tag}>\` carries the ${match.atom} recipe but no \`data-slot\`. Use the ${match.atom} component; if it already is one, ${match.atom} is missing its data-slot (a design-system bug).`);
    }

    if (el.tag === 'Badge' && INTERACTIVE_ATTRS.some((a) => a in el.attrs)) {
      add(el, 'interactive-badge', 'error', 'Badge is a passive tag and is never clickable. For an action use Button; to go somewhere use Link.');
    }

    if (el.tag === 'Button' && (el.attrs.variant ?? 'primary') === 'primary') primaries += 1;
  }

  if (primaries > 1) {
    findings.push({ rule: 'primary-count', severity: 'warning', line: 1, column: 1, message: `${primaries} primary Buttons. A primary Button is the one thing a screen is for; check that this file is more than one screen.`, evidence: '' });
  }
  if (design.elements.length && !hasTheme) {
    findings.push({ rule: 'brand-theme', severity: 'warning', line: 1, column: 1, message: 'No data-theme. A page or design sets data-theme="light" or "dark" on <html> or its root; a single component file need not.', evidence: '' });
  }
  return findings;
}

export const relative = (root, file) => path.relative(root, file);
