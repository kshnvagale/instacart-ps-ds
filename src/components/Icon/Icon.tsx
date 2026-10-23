import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

/**
 * Icon sizes and tones. The wrapper sets the size; the icon inside fills it
 * (`[&>svg]:size-full`), so a Phosphor icon never needs its own `size` prop.
 * Phosphor draws in `currentColor`, so the tone is a text colour.
 */
export const iconVariants = cva(
  'inline-flex shrink-0 items-center justify-center align-middle [&>svg]:size-full [&>svg]:shrink-0',
  {
    variants: {
      size: {
        sm: 'size-icon-sm',
        md: 'size-icon-md',
        lg: 'size-icon-lg',
      },
      tone: {
        inherit: '',
        default: 'text-content',
        strong: 'text-content-strong',
        muted: 'text-content-muted',
        brand: 'text-content-brand',
        success: 'text-success-fg',
        warning: 'text-warning-fg',
        danger: 'text-danger-fg',
      },
    },
    defaultVariants: { size: 'md', tone: 'inherit' },
  },
);

type IconVariantProps = VariantProps<typeof iconVariants>;

export interface IconProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    IconVariantProps {
  /**
   * One icon from this package's icon set, such as `<ShoppingCartIcon />`.
   * Do not set its `size` or `color`: the Icon sets both.
   */
  children: React.ReactNode;
  /**
   * `sm` 16px (beside delivery text), `md` 20px (inside buttons), `lg` 24px
   * (standalone UI icons).
   *
   * @default 'md'
   */
  size?: IconVariantProps['size'];
  /**
   * The colour. `inherit` takes the colour of the text around it, which is
   * right inside a Button, Link or Badge. Use another tone only for an icon
   * that stands on its own.
   *
   * @default 'inherit'
   */
  tone?: IconVariantProps['tone'];
  /**
   * The accessible name, for an icon that carries meaning on its own (for
   * example "Delivery time"). With a label the icon is `role="img"`. Without
   * one it is decorative and hidden from screen readers, which is right when
   * text beside it already says the same thing.
   */
  label?: string;
}

/**
 * Icon: a sized, coloured wrapper around one icon from the icon set.
 *
 * **When to use:** any icon in the UI. Put one of the exported `*Icon`
 * components (`ShoppingCartIcon`, `ClockIcon`, `MapPinIcon`...) inside it,
 * next to text like "Delivery by 7:30am", or on its own with a `label`.
 * Use only those exports (the list is in the Foundations/Icons story);
 * never draw an svg by hand.
 *
 * **When not to use:**
 * - A clickable icon: use `IconButton` (it needs an `aria-label`) or `Button`
 *   with `size="icon-md"`. An Icon is never interactive.
 * - The Instacart carrot or wordmark: use `Logo`.
 * - A person or store picture: use `Avatar`.
 *
 * Icons are always passed as children. Do not set the icon's `size` or
 * `color` prop, and do not add size or colour classes to the svg: choose a
 * `size` and `tone` here.
 *
 * @example
 * import { ClockIcon, Icon, MapPinIcon, Text } from 'instacart-ps-ds';
 *
 * <Text>
 *   <Icon size="sm" tone="brand"><ClockIcon /></Icon> Delivery by 7:30am
 * </Text>
 *
 * <Icon label="Store location"><MapPinIcon /></Icon>
 */
export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { className, size, tone, label, children, ...props },
  ref,
) {
  const a11y = label
    ? ({ role: 'img', 'aria-label': label } as const)
    : ({ 'aria-hidden': true } as const);
  return (
    <span
      ref={ref}
      data-slot="icon"
      data-size={size ?? 'md'}
      {...a11y}
      className={cn(iconVariants({ size, tone }), className)}
      {...props}
    >
      {children}
    </span>
  );
});
Icon.displayName = 'Icon';
