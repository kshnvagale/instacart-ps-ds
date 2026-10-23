import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

export const headingVariants = cva('font-sans text-balance', {
  variants: {
    variant: {
      display: 'type-display',
      h1: 'type-h1',
      h2: 'type-h2',
      h3: 'type-h3',
      title: 'type-title',
    },
    tone: {
      strong: 'text-content-strong',
      default: 'text-content',
      brand: 'text-content-brand',
      inverse: 'text-content-inverse',
    },
  },
  defaultVariants: { variant: 'h2', tone: 'strong' },
});

type HeadingVariantProps = VariantProps<typeof headingVariants>;

export type HeadingVariant = NonNullable<HeadingVariantProps['variant']>;
export type HeadingTone = NonNullable<HeadingVariantProps['tone']>;
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/** The look each level gets when `variant` is not set. */
const DEFAULT_VARIANT: Record<HeadingLevel, HeadingVariant> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'title',
  h5: 'title',
  h6: 'title',
};

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * The heading level in the page outline. REQUIRED: pick it from the page's
   * structure (one `h1` per page, then `h2` for sections, `h3` inside them),
   * never from how big you want the text. Use `variant` for the size.
   */
  as: HeadingLevel;
  /**
   * The type role, set apart from the level. `display` the one big page title
   * · `h1` · `h2` · `h3` · `title` a card or product title. Leave it out to
   * get the role that matches `as` (h4-h6 get `title`).
   */
  variant?: HeadingVariant;
  /**
   * The colour role. `strong` (headings are the darkest text) · `default` ·
   * `brand` · `inverse` on an inverse surface.
   *
   * @default 'strong'
   */
  tone?: HeadingTone;
  /**
   * Render the single child element instead, with Heading's classes and props
   * merged onto it. The child must then be the right heading element itself.
   *
   * @default false
   */
  asChild?: boolean;
}

/**
 * Heading: a real h1-h6 heading, with its look set apart from its level.
 *
 * **When to use:** page titles ("Order groceries for delivery or pickup
 * today"), section titles ("Often Bought With", "Items to add next") and card
 * or product titles. `as` is required, so every heading has a level in the
 * page outline.
 *
 * **When not to use:**
 * - Body copy, labels or fine print: use **Text**.
 * - Text that is only bold or big for emphasis, with no section under it:
 *   use **Text** with `tone="strong"`.
 * - A price: use **Price**.
 *
 * @example
 * <Heading as="h1" variant="display">Order groceries for delivery or pickup today</Heading>
 * <Heading as="h2">Often Bought With</Heading>
 * <Heading as="h3" variant="title">Organic Bananas</Heading>
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { className, as, variant, tone = 'strong', asChild = false, ...props },
  ref,
) {
  const resolved = variant ?? DEFAULT_VARIANT[as];
  const Comp: React.ElementType = asChild ? Slot : as;
  return (
    <Comp
      ref={ref}
      data-slot="heading"
      data-variant={resolved}
      data-tone={tone}
      className={cn(headingVariants({ variant: resolved, tone }), className)}
      {...props}
    />
  );
});
Heading.displayName = 'Heading';
