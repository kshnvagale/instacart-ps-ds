/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';

import themeCss from '../styles/theme.css?raw';
import { cn, instacartScales } from './cn';

/**
 * `cn` must resolve conflicts on OUR scales the way it does on Tailwind's: the
 * later class wins and the earlier one is dropped. Without the config in
 * `cn.ts`, tailwind-merge keeps both and CSS source order decides, which is
 * how a consumer's `className` silently fails to override a component.
 */
describe('cn: our scales override and are overridden', () => {
  it.each([
    // spacing namespace: control and icon sizes
    ['h-control-md', 'h-12', 'h-12'],
    ['h-12', 'h-control-md', 'h-control-md'],
    ['h-control-sm', 'h-control-xl', 'h-control-xl'],
    ['size-icon-sm', 'size-icon-lg', 'size-icon-lg'],
    ['p-4', 'p-6', 'p-6'],
    ['gap-0.5', 'gap-2', 'gap-2'],
    // weight, radius, shadow, ease, z
    ['font-regular', 'font-semibold', 'font-semibold'],
    ['rounded-md', 'rounded-full', 'rounded-full'],
    ['shadow-raised', 'shadow-popover', 'shadow-popover'],
    ['shadow-raised', 'shadow-none', 'shadow-none'],
    ['ease-standard', 'ease-bounce', 'ease-bounce'],
    ['z-sticky', 'z-tooltip', 'z-tooltip'],
    // colours: semantic names are colours, and the last one wins
    ['bg-surface', 'bg-surface-subtle', 'bg-surface-subtle'],
    ['text-content', 'text-content-muted', 'text-content-muted'],
    ['bg-action-primary', 'bg-action-danger', 'bg-action-danger'],
    ['bg-badge-sale', 'bg-badge-neutral', 'bg-badge-neutral'],
    // type roles replace each other
    ['type-body', 'type-caption', 'type-caption'],
    ['type-h1', 'type-h2', 'type-h2'],
    ['type-body', 'type-label', 'type-label'],
  ])('cn(%s, %s) -> %s', (a, b, out) => {
    expect(cn(a, b)).toBe(out);
  });

  it('keeps classes from different groups', () => {
    expect(cn('bg-action-primary text-action-primary-fg', 'rounded-full')).toBe(
      'bg-action-primary text-action-primary-fg rounded-full',
    );
    // a colour and a type role are different things
    expect(cn('type-body', 'text-content-muted')).toBe('type-body text-content-muted');
  });

  it('a weighted role replaces an earlier weight; a later weight only changes the weight', () => {
    expect(cn('font-regular', 'type-h2')).toBe('type-h2');
    expect(cn('type-h2', 'font-bold')).toBe('type-h2 font-bold');
    // a running-text role leaves weight alone
    expect(cn('font-semibold', 'type-body')).toBe('font-semibold type-body');
  });

  it('respects variants', () => {
    expect(cn('hover:bg-action-primary-hover', 'hover:bg-action-danger-hover')).toBe('hover:bg-action-danger-hover');
    expect(cn('h-control-md', 'md:h-control-lg')).toBe('h-control-md md:h-control-lg');
  });
});

/**
 * Drift guard. Every custom name `theme.css` gives Tailwind must be known to
 * `cn`. Add a token to `theme.css` and forget `cn.ts`, and this fails.
 */
describe('cn: config matches theme.css', () => {
  const inline = themeCss.slice(themeCss.indexOf('@theme inline'));
  const names = (prefix: string) =>
    [...inline.matchAll(new RegExp(`--${prefix}-([a-z0-9-]+(?:\\\\\\.[0-9]+)?)\\s*:`, 'g'))].map((m) => m[1]!);
  const isNumeric = (n: string) => /^[0-9]/.test(n) || n === 'px';

  it.each([
    ['spacing', instacartScales.spacing, (n: string) => !isNumeric(n)],
    ['font-weight', instacartScales.fontWeight, () => true],
    ['radius', instacartScales.radius, () => true],
    ['shadow', instacartScales.shadow, () => true],
    ['ease', instacartScales.ease, () => true],
    ['z-index', instacartScales.z, () => true],
  ] as const)('--%s-*', (prefix, configured, keep) => {
    const declared = names(prefix).filter(keep);
    expect(declared.length).toBeGreaterThan(0);
    expect([...configured].sort()).toEqual([...new Set(declared)].sort());
  });

  it('every `@utility type-*` is configured, weighted exactly when it sets font-weight', () => {
    const blocks = [...themeCss.matchAll(/@utility type-([a-z0-9-]+)\s*\{([^}]*)\}/g)];
    expect(blocks.length).toBeGreaterThan(0);
    const weighted = blocks.filter((b) => /font-weight:/.test(b[2]!)).map((b) => b[1]!);
    const plain = blocks.filter((b) => !/font-weight:/.test(b[2]!)).map((b) => b[1]!);
    expect([...instacartScales.typeWeighted].sort()).toEqual(weighted.sort());
    expect([...instacartScales.type].sort()).toEqual(plain.sort());
  });
});
