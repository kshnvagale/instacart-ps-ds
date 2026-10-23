/**
 * Reads an HTML export into the same facts parse.mjs produces, so every rule
 * runs unchanged. Two shapes:
 *
 *  1. JSX inside a <script> (a page that runs the design on the Instacart bundle):
 *     the script is extracted, padded so its lines keep their HTML line
 *     numbers, and parsed as TSX. Everything, prop types included, applies.
 *
 *  2. Plain rendered HTML: there is no JSX, but every Instacart atom stamps
 *     `data-slot` on what it renders, so an element is identified by its
 *     slot (`<button data-slot="button">` is Button; a `<button>` with no slot
 *     was hand-made). Inside a component everything is the component's own
 *     output, so classes, styles and raw elements are only checked OUTSIDE
 *     components. There are no props to type-check.
 */
import { JSDOM } from 'jsdom';
import { parseDesign } from './parse.mjs';

/** Root data-slot -> atom. Parts (`button-icon`, `select-item`) are not listed. */
const SLOTS = {
  avatar: 'Avatar', badge: 'Badge', button: 'Button', checkbox: 'Checkbox', heading: 'Heading',
  icon: 'Icon', 'icon-button': 'IconButton', input: 'Input', link: 'Link', logo: 'Logo',
  price: 'Price', 'quantity-stepper': 'QuantityStepper', spinner: 'Spinner', switch: 'Switch', text: 'Text',
};

/** DOM data attributes that carry a component prop the rules read. */
const PROP_ATTRS = { 'data-tone': 'tone', 'data-variant': 'variant', 'data-size': 'size' };

const camel = (p) => p.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());

export function parseHtmlDesign(fileName, html) {
  const dom = new JSDOM(html, { includeNodeLocations: true });
  const doc = dom.window.document;

  // Shape 1: the design's JSX is in a script.
  for (const script of doc.querySelectorAll('script')) {
    const code = script.textContent ?? '';
    if (/window\.Instacart\b|Instacart\./.test(code) && /<[A-Za-z]/.test(code)) {
      const loc = dom.nodeLocation(script);
      const line = loc?.startTag ? loc.startTag.endLine : 1;
      const padded = '\n'.repeat(Math.max(0, line - 1)) + code;
      return { mode: 'script', source: padded, design: parseDesign(`${fileName}.tsx`, padded) };
    }
  }

  // Shape 2: rendered DOM.
  const elements = [];
  const walk = (node, parent, insideComponent) => {
    for (const child of node.children) {
      const slot = child.getAttribute('data-slot');
      // Radix's hidden native mirror (a <select> beside Select, an <input>
      // beside Checkbox) exists for form submission, not for the user.
      const mirror = child.getAttribute('aria-hidden') === 'true' && child.getAttribute('tabindex') === '-1';
      const component = slot ? SLOTS[slot] : null;
      const tag = component ?? child.tagName.toLowerCase();
      const attrs = {};
      for (const a of child.attributes) attrs[PROP_ATTRS[a.name] ?? a.name] = a.value;
      const loc = dom.nodeLocation(child);
      const outer = child.outerHTML;
      // What Jev reads: the markup without class and style noise (a rendered
      // atom carries dozens of utility classes that say nothing about meaning).
      const clean = child.cloneNode(true);
      for (const n of [clean, ...clean.querySelectorAll('*')]) {
        n.removeAttribute('class');
        n.removeAttribute('style');
      }
      const el = {
        tag,
        intrinsic: !slot,
        insideComponent: insideComponent || mirror,
        attrs,
        classes: insideComponent || mirror || slot ? [] : [...child.classList],
        // Everything rendered, the designer's className included: semantic
        // candidates (bold Text) need it even where static rules must not look.
        renderedClasses: [...child.classList],
        style: insideComponent || mirror || slot ? [] : (child.getAttribute('style') ?? '').split(';').filter((d) => d.includes(':')).map((d) => {
          const [prop, ...v] = d.split(':');
          return { prop: camel(prop), value: v.join(':').trim() };
        }),
        parent,
        children: [],
        text: clean.outerHTML,
        openingText: outer.slice(0, outer.indexOf('>') + 1),
        childText: (child.textContent ?? '').replace(/\s+/g, ' ').trim(),
        line: loc?.startLine ?? 1,
        column: loc?.startCol ?? 1,
      };
      if (parent) parent.children.push(el);
      elements.push(el);
      walk(child, el, insideComponent || mirror || Boolean(slot));
    }
  };
  walk(doc.body ?? doc.documentElement, null, false);
  return { mode: 'dom', design: { elements, declarations: new Map(), text: html } };
}
