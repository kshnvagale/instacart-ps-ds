/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';

import tokensCss from './tokens.generated.css?raw';

/**
 * NOTHING IN A COMPONENT IS HARD-CODED.
 *
 * Every colour, length, z-index and duration a component uses comes from the
 * foundations (tokens/*.json -> tokens.generated.css -> the theme.css bridge).
 * This test reads the source of every component and fails on a value that did
 * not.
 *
 * Why a test and not a lint: theme.css switches Tailwind's default scales off,
 * so an off-scale class (`p-7`, `max-w-md`) no longer compiles. That is the
 * point, but it fails SILENTLY: the class is simply missing from the CSS. This
 * test makes the mistake loud.
 *
 * Not a hard-code, so it passes:
 *   - a token, or arithmetic over tokens (`calc(var(--space-2)*2)`);
 *   - mechanics that are not design decisions: 0, 50%, 100%, `1lh`, the
 *     viewport itself (`100vh`, `100dvh`), fr tracks, `rotate-90`/`rotate-180`
 *     (a chevron turning).
 * Anything else needs a token. If a new value is really needed, add it to
 * tokens/ (a scale step, or a tier-3 `component.*` token), not here.
 */

const sources = import.meta.glob('../components/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const files = Object.entries(sources).filter(
  ([f]) => !/\.(stories|test)\.tsx?$/.test(f) && !f.includes('/_fixtures/'),
);

/** Files allowed to hold a raw colour, and why. (Phase 4: the Logo's own artwork.) */
const RAW_COLOUR_ALLOWED: Record<string, string> = {};

/** Space steps that exist, read from the tokens rather than restated. */
const SPACE_STEPS = new Set(
  [...tokensCss.matchAll(/--space-([a-z0-9-]+):/g)].map((m) => m[1]!.replace(/^(\d+)-(\d+)$/, '$1.$2')),
);

const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

/** Every whitespace-separated token inside a string literal. */
function classTokens(src: string): string[] {
  const out: string[] = [];
  for (const m of stripComments(src).matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`/g)) {
    const str = m[1] ?? m[2] ?? m[3] ?? '';
    for (const tok of str.split(/\s+/)) if (tok && !tok.includes('${')) out.push(tok);
  }
  return out;
}

/** `md:hover:[&_svg]:h-4` -> variants ['md','hover','[&_svg]'], utility 'h-4'. */
function split(tok: string): { variants: string[]; utility: string } {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < tok.length; i++) {
    const c = tok[i];
    if (c === '[' || c === '(') depth++;
    else if (c === ']' || c === ')') depth--;
    else if (c === ':' && depth === 0) {
      parts.push(tok.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(tok.slice(start));
  const utility = parts.pop()!.replace(/^!|!$/g, '');
  return { variants: parts, utility };
}

/** A literal design value inside an arbitrary `[...]`, after mechanics are removed. */
function literalIn(value: string): string | null {
  const v = value
    .replace(/var\((--[a-z0-9-]+)(,[^()]*)?\)/g, 'VAR')
    .replace(/\b100(vh|dvh|svh|lvh|vw|dvw|%)/g, 'FULL')
    .replace(/\b50%/g, 'HALF')
    .replace(/(^|[^\d.])0%/g, '$1ZERO')
    .replace(/\b0(px|rem|%)?\b/g, 'ZERO')
    .replace(/\b1lh\b/g, 'LINE')
    .replace(/\d+(\.\d+)?fr\b/g, 'FR');
  // `(?![a-z])`, not `\b`: `%` is not a word character.
  const lit = v.match(
    /#[0-9a-f]{3,8}\b|\b(rgb|hsl|oklch|oklab)a?\(|-?\d*\.?\d+(px|rem|em|ch|vh|dvh|svh|vw|dvw|%|deg|ms|s)(?![a-z])/i,
  );
  return lit ? lit[0] : null;
}

/** Arbitrary values whose content is structural, never a design value. */
const STRUCTURAL_ARBITRARY = /^-?(content|grid-cols|grid-rows|col|row|list|shrink|grow|flex|order)-\[/;

/** Why one class is a hard-code, or null if it is fine. */
function problem(utility: string, variants: string[]): string | null {
  for (const v of variants) {
    const inner = v.match(/\[(.*)\]/)?.[1];
    if (inner && !/^(data|aria)-/.test(v) && literalIn(inner)) return `variant ${v} has ${literalIn(inner)}`;
  }

  const arb = utility.match(/^(-?[a-z0-9-]+?)-\[(.+)\]$/);
  if (arb) {
    const [, name, value] = arb as unknown as [string, string, string];
    if (/^(data|aria|has|not|supports)$/.test(name)) return null;
    if (
      /^-?(z|opacity|text|leading|tracking|font|rounded|shadow|duration|delay|ease|blur|aspect|ring|outline|border)$/.test(name) &&
      /^-?\d/.test(value)
    )
      return `arbitrary ${name} value`;
    if (STRUCTURAL_ARBITRARY.test(utility) && !/\d(px|rem|em|ch)\b/.test(value)) return null;
    const lit = literalIn(value);
    return lit ? `literal ${lit}` : null;
  }

  // Off-scale spacing: `p-7` does not compile, so it must not be written.
  const sp = utility.match(
    /^-?(p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|gap|gap-x|gap-y|space-x|space-y|w|h|size|min-w|min-h|max-w|max-h|top|bottom|left|right|start|end|inset|inset-x|inset-y|translate-x|translate-y|basis|indent)-(\d+(\.\d+)?)$/,
  );
  if (sp && !SPACE_STEPS.has(sp[2]!)) return `off-scale step ${sp[2]}`;

  if (/^-?z-\d+$/.test(utility) && utility !== 'z-0') return 'numeric z-index (use z-sticky, z-overlay, ...)';
  if (/^(duration|delay)-\d+$/.test(utility) && !/-0$/.test(utility)) return 'numeric duration (use the motion tokens)';
  if (/^(opacity)-\d+$/.test(utility) && !/^opacity-(0|100)$/.test(utility)) return 'numeric opacity';
  if (/^(border|border-[xytblrse]|ring|outline|outline-offset|divide-[xy])-\d+$/.test(utility) && !/-0$/.test(utility))
    return 'numeric width';
  if (/^rotate-\d+$/.test(utility) && !/^rotate-(0|90|180)$/.test(utility)) return 'numeric rotation';
  if (/^(bg|text|border|border-[xytblrse]|ring|outline|fill|stroke|shadow|from|via|to|decoration|divide|placeholder|caret|accent)-[a-z-]+\/\d+$/.test(utility))
    return 'colour with a literal alpha';
  return null;
}

/** Every hard-coded value in one source file, as readable strings. */
function scan(src: string, opts: { rawColourAllowed?: boolean } = {}): string[] {
  const out: string[] = [];
  for (const tok of new Set(classTokens(src))) {
    const { variants, utility } = split(tok);
    if (!/^-?[a-z@[]/.test(utility) && !variants.length) continue;
    const why = problem(utility, variants);
    if (why) out.push(`${tok}  (${why})`);
  }
  if (!opts.rawColourAllowed)
    for (const m of stripComments(src).matchAll(/#[0-9a-fA-F]{6,8}\b|\b(rgba?|hsla?|oklch)\(\s*\d/g)) out.push(`${m[0]}  (raw colour)`);
  for (const m of stripComments(src).matchAll(/\b(sideOffset|alignOffset|collisionPadding|arrowPadding)=\{\s*[1-9]\d*\s*\}/g))
    out.push(`${m[0]}  (pixel number passed to a positioning prop)`);
  return out;
}

describe('the checker itself', () => {
  it('read the space scale from the tokens', () => {
    expect(SPACE_STEPS.has('4')).toBe(true);
    expect(SPACE_STEPS.has('0.5')).toBe(true);
    expect(SPACE_STEPS.has('7')).toBe(false);
  });

  it('flags a component full of hard-codes', () => {
    const bad = `
      const recipe = cva('p-7 gap-4 bg-[#ff0000] w-[13px] z-50 duration-300 rounded-[6px] text-content/80', {
        variants: { size: { sm: 'h-[36px] [&_svg]:size-[18px]' } },
      });
      const style = { color: '#1A2B3C', boxShadow: 'rgba(0, 0, 0, 0.2)' };
      <Popover.Content sideOffset={8} />
    `;
    const found = scan(bad).map((s) => s.split('  ')[0]);
    expect(found).toEqual(
      expect.arrayContaining([
        'p-7',
        'bg-[#ff0000]',
        'w-[13px]',
        'z-50',
        'duration-300',
        'rounded-[6px]',
        'text-content/80',
        'h-[36px]',
        '[&_svg]:size-[18px]',
        '#1A2B3C',
        'rgba(0',
        'sideOffset={8}',
      ]),
    );
    expect(found).not.toContain('gap-4');
  });

  it('passes a component that uses only the foundations', () => {
    const good = `
      // a comment may say #FF0000 or 13px; comments are not code
      const recipe = cva(
        'inline-flex items-center gap-2 px-4 h-control-md rounded-full type-label-lg bg-action-primary text-action-primary-fg hover:bg-action-primary-hover z-sticky shadow-raised transition-colors duration-0 w-full max-h-[100dvh] grid-cols-[1fr_auto] rotate-180 p-0.5 h-[var(--control-height-md)]',
      );
    `;
    expect(scan(good)).toEqual([]);
  });
});

describe('components take every value from the foundations', () => {
  // There are no components yet (Phase 4). This still runs, so the first
  // component written is checked from day one.
  it.each(files.length ? files : [['(no components yet)', '']])('%s', (file, src) => {
    expect(scan(src, { rawColourAllowed: file in RAW_COLOUR_ALLOWED })).toEqual([]);
  });
});
