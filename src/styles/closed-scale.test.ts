// @vitest-environment node
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compile } from '@tailwindcss/node';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * THE CLOSED SCALE (Phase 3's done-criterion).
 *
 * Compiles the REAL theme with Tailwind and asks which classes produce CSS.
 * Off-scale classes must produce nothing at all; our names must produce a rule.
 * This is the same check the checker's `dead-class` rule makes on a design.
 */
const here = dirname(fileURLToPath(import.meta.url));

/** The classes that must be DEAD: Tailwind defaults our theme removed. */
const DEAD = [
  'p-7',
  'gap-7', // the space scale skips 7 on purpose
  'm-9',
  'bg-blue-500',
  'text-white',
  'bg-green-9', // a primitive ramp step: only semantic roles get utilities
  'shadow-lg',
  'shadow-sm',
  'max-w-md',
  'rounded-3xl',
  'text-sm',
  'font-light',
  'leading-tight',
  'tracking-wide',
  'ease-in',
  'blur-sm',
];

/** The classes that must be ALIVE: our tokens. */
const ALIVE = [
  'p-4',
  'gap-4',
  'p-0.5',
  'px-px',
  'gap-16',
  'h-control-md',
  'size-icon-lg',
  'bg-surface',
  'bg-surface-subtle',
  'text-content',
  'text-content-muted',
  'bg-action-primary',
  'hover:bg-action-primary-hover',
  'text-action-primary-fg',
  'border-border',
  'bg-success',
  'text-danger-fg',
  'bg-badge-sale',
  'text-badge-sale-fg',
  'rounded-full',
  'rounded-lg',
  'shadow-raised',
  'type-body',
  'type-h1',
  'font-semibold',
  'font-sans',
  'ease-standard',
  'z-sticky',
  'md:p-4',
  'dark:bg-surface',
];

let css = '';

/** The CSS rule for exactly this class, or '' if it compiled to nothing. */
function ruleFor(cls: string): string {
  const escaped = cls.replace(/[.:/[\]]/g, (c) => `\\${c}`);
  const at = css.search(new RegExp(`\\.${escaped.replace(/[\\^$*+?()|{}]/g, '\\$&')}(?![\\w-])`));
  return at === -1 ? '' : css.slice(at, css.indexOf('}', at) + 1);
}

beforeAll(async () => {
  const compiler = await compile(`@import 'tailwindcss' source(none);\n@import './instacart.css';`, {
    base: here,
    onDependency: () => {},
  });
  css = compiler.build([...DEAD, ...ALIVE]);
});

describe('closed scale: off-system classes compile to nothing', () => {
  it.each(DEAD)('%s is dead', (cls) => {
    expect(ruleFor(cls)).toBe('');
  });
});

describe('closed scale: our tokens compile', () => {
  it.each(ALIVE)('%s is alive', (cls) => {
    expect(ruleFor(cls)).not.toBe('');
  });

  it('colours stay live references, so they follow data-theme', () => {
    expect(ruleFor('bg-surface')).toContain('var(--surface-default)');
    expect(ruleFor('bg-action-primary')).toContain('var(--action-primary-bg)');
  });

  it('p-4 is the 16px token, not a multiplier', () => {
    expect(ruleFor('p-4')).toContain('var(--space-4)');
  });

  it('dark: follows data-theme', () => {
    expect(css).toMatch(/\.dark\\:bg-surface:where\(\[data-theme=['"]?dark['"]?\]/);
  });
});

describe('theme.css breakpoints match the tokens', () => {
  const tokens = readFileSync(resolve(here, 'tokens.generated.css'), 'utf8');
  const theme = readFileSync(resolve(here, 'theme.css'), 'utf8');
  const read = (src: string) =>
    Object.fromEntries([...src.matchAll(/--breakpoint-([a-z0-9]+):\s*([0-9]+px);/g)].map((m) => [m[1], m[2]]));

  it('the literal values in theme.css equal tokens/primitive.scales.json', () => {
    expect(read(theme)).toEqual(read(tokens));
    expect(Object.keys(read(tokens)).length).toBeGreaterThan(0);
  });
});
