import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * The names `styles/theme.css` gives Tailwind that Tailwind's defaults do not
 * have. tailwind-merge only knows the defaults, and an unknown name is either
 * not merged at all (both `h-control-md` and `h-12` survive and CSS order
 * picks the winner) or merged into the WRONG group (`shadow-raised` read as a
 * shadow colour).
 *
 * Exported for `cn.test.ts`, which parses `theme.css` and fails if a name
 * there is missing here, so the two cannot drift. Not part of the public API.
 *
 * Colours need no entry: tailwind-merge groups any unknown `bg-*` / `text-*` /
 * `border-*` value as that property's colour, which is right for every
 * semantic colour in `theme.css`.
 */
export const instacartScales = {
  /** `--spacing-*` names that are not numbers: h-, w-, size-, min-w-, ... */
  spacing: ['control-sm', 'control-md', 'control-lg', 'control-xl', 'icon-sm', 'icon-md', 'icon-lg'],
  /** `--font-weight-*`. `regular` is ours (Tailwind calls it `normal`). */
  fontWeight: ['regular', 'medium', 'semibold', 'bold'],
  /** `--radius-*` */
  radius: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
  /** `--shadow-*` */
  shadow: ['raised', 'popover', 'overlay', 'inset'],
  /** `--ease-*` */
  ease: ['standard', 'elevated', 'bounce', 'linear'],
  /** `--z-index-*` */
  z: ['base', 'raised', 'sticky', 'overlay', 'popover', 'toast', 'tooltip'],
  /** `@utility type-*` roles that set weight as well (headings, titles, labels). */
  typeWeighted: ['display', 'h1', 'h2', 'h3', 'title', 'label', 'label-lg'],
  /** `@utility type-*` roles that leave weight to inherit (running text). */
  type: ['body-lg', 'body', 'body-sm', 'caption'],
} as const;

const twMerge = extendTailwindMerge<'ic-type' | 'ic-type-weighted'>({
  extend: {
    theme: {
      spacing: [...instacartScales.spacing],
      'font-weight': [...instacartScales.fontWeight],
      radius: [...instacartScales.radius],
      shadow: [...instacartScales.shadow],
      ease: [...instacartScales.ease],
    },
    classGroups: {
      // tailwind-merge's `z` group has no theme key, so it is extended here.
      z: [{ z: [...instacartScales.z] }],
    },
    // A later `type-*` replaces an earlier font size, line height and tracking
    // (and weight, for the roles that set it). The reverse is deliberately NOT
    // a conflict: `type-body font-semibold` keeps the role and changes only the
    // weight, which is what CSS order does anyway.
    conflictingClassGroups: {
      'ic-type': ['ic-type-weighted', 'font-size', 'leading', 'tracking'],
      'ic-type-weighted': ['ic-type', 'font-size', 'leading', 'tracking', 'font-weight'],
    },
  },
  override: {
    classGroups: {
      'ic-type': [{ type: [...instacartScales.type] }],
      'ic-type-weighted': [{ type: [...instacartScales.typeWeighted] }],
    },
  },
});

/**
 * Compose class names; on conflicting Tailwind utilities the last one wins.
 *
 * This is what makes `className` a safe escape hatch: a consumer passing
 * `className="px-6"` replaces our padding instead of racing it on specificity.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
