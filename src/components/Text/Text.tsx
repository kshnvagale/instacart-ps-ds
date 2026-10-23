import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

export const textVariants = cva('font-sans', {
  variants: {
    variant: {
      'body-lg': 'type-body-lg',
      body: 'type-body',
      'body-sm': 'type-body-sm',
      caption: 'type-caption',
      label: 'type-label',
      'label-lg': 'type-label-lg',
    },
    tone: {
      default: 'text-content',
      strong: 'text-content-strong',
      muted: 'text-content-muted',
      brand: 'text-content-brand',
      danger: 'text-danger-fg',
      inverse: 'text-content-inverse',
    },
  },
  defaultVariants: { variant: 'body', tone: 'default' },
});

type TextVariantProps = VariantProps<typeof textVariants>;

export type TextVariant = NonNullable<TextVariantProps['variant']>;
export type TextTone = NonNullable<TextVariantProps['tone']>;

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The type role: what the text IS, not the size you want.
   * `body-lg` · `body` running text · `body-sm` · `caption` fine print, the
   * 12px floor · `label` control or field text (semibold) · `label-lg`.
   *
   * @default 'body'
   */
  variant?: TextVariant;
  /**
   * The colour role. `default` · `strong` emphasis · `muted` secondary facts
   * ("Delivery by 7:30am") · `brand` green brand text · `danger` an error
   * message · `inverse` text on an inverse (dark in light mode) surface.
   *
   * @default 'default'
   */
  tone?: TextTone;
  /**
   * The element to render. `p` for a paragraph, `span` inline, `div` for a
   * block that holds other blocks, `label` to name a form control (pass
   * `htmlFor`). Never a heading: use Heading.
   *
   * @default 'p'
   */
  as?: 'p' | 'span' | 'div' | 'label';
  /**
   * Render the single child element instead, with Text's classes and props
   * merged onto it (for example a router link styled as caption text).
   *
   * @default false
   */
  asChild?: boolean;
  /** For `as="label"`: the id of the control this label names. */
  htmlFor?: string;
}

/**
 * Text: body, label and caption copy in one of the type roles.
 *
 * **When to use:** running text, fine print and short labels. For example a
 * product size ("12 oz"), a delivery fact ("Delivery by 7:30am") or small
 * print ("Service and other fees apply.").
 *
 * **When not to use:**
 * - A heading or a section title ("Often Bought With"): use **Heading**, so
 *   the page has a real h1-h6 outline. Bold or big Text is not a heading.
 * - A price ("$3.99", "$0.42/oz"): use **Price**, which formats the amount
 *   and labels a sale price for screen readers.
 * - A status tag ("Sale", "Out of stock"): use **Badge**.
 * - Navigation: use **Link**. A click target: use **Button**.
 *
 * @example
 * <Text variant="body-sm" tone="muted">Available at 35 stores</Text>
 * <Text as="span" variant="caption">*Service and other fees apply.</Text>
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(function Text(
  { className, variant = 'body', tone = 'default', as = 'p', asChild = false, ...props },
  ref,
) {
  const Comp: React.ElementType = asChild ? Slot : as;
  return (
    <Comp
      ref={ref}
      data-slot="text"
      data-variant={variant}
      data-tone={tone}
      className={cn(textVariants({ variant, tone }), className)}
      {...props}
    />
  );
});
Text.displayName = 'Text';
