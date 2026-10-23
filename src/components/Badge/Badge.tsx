import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

export const badgeVariants = cva(
  [
    'inline-flex shrink-0 items-center gap-1 rounded-sm whitespace-nowrap',
    'font-sans font-semibold',
    // Icons are children, sized by the badge unless the icon sets its own size.
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon-sm",
  ],
  {
    variants: {
      tone: {
        neutral: 'bg-badge-neutral text-badge-neutral-fg',
        success: 'bg-badge-success text-badge-success-fg',
        warning: 'bg-badge-warning text-badge-warning-fg',
        danger: 'bg-badge-danger text-badge-danger-fg',
        info: 'bg-badge-info text-badge-info-fg',
        brand: 'bg-badge-brand text-badge-brand-fg',
        sale: 'bg-badge-sale text-badge-sale-fg',
      },
      size: {
        sm: 'px-1 py-0.5 type-caption',
        md: 'px-2 py-0.5 type-label',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'md' },
  },
);

type BadgeVariantProps = VariantProps<typeof badgeVariants>;

export type BadgeTone = NonNullable<BadgeVariantProps['tone']>;
export type BadgeSize = NonNullable<BadgeVariantProps['size']>;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * What kind of fact the badge reports. `neutral` plain information ("12
   * oz") · `success` good news ("Delivered", "Organic") · `warning` act soon
   * ("Only 3 left") · `danger` a problem ("Out of stock") · `info` neutral
   * news · `brand` an Instacart label · `sale` deals and savings ("Sale",
   * "No markups"), the deal yellow.
   *
   * @default 'neutral'
   */
  tone?: BadgeTone;
  /**
   * `sm` (caption text) on a dense product tile · `md` (label text) elsewhere.
   *
   * @default 'md'
   */
  size?: BadgeSize;
}

/**
 * Badge: a small passive tag that reports a fact about the thing it sits on.
 *
 * **When to use:** status and attributes on a product, store or order:
 * "Sale", "Out of stock", "Organic", "Delivered", "Only 3 left". The word
 * carries the meaning; the colour only supports it. An icon may go first, as a
 * child.
 *
 * **When not to use:**
 * - Anything a person clicks or taps. A Badge is NEVER interactive: no
 *   `onClick`, no link, no focus. For an action use **Button**; to go
 *   somewhere use **Link**.
 * - A price or a saving amount ("$3.99"): use **Price** (with `tone="sale"`
 *   for a sale price).
 * - A sentence or a heading: use **Text** or **Heading**.
 *
 * @example
 * <Badge tone="sale">Sale</Badge>
 * <Badge tone="danger">Out of stock</Badge>
 * <Badge tone="success"><Check weight="bold" />Delivered</Badge>
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, tone = 'neutral', size = 'md', ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      data-slot="badge"
      data-tone={tone}
      data-size={size}
      className={cn(badgeVariants({ tone, size }), className)}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';
