import * as React from 'react';

import { Button, type ButtonProps, type ButtonVariant } from '../Button';

/* ---------------------------------------------------------------------------
 * IconButton
 *
 * A Button at a square `icon-*` size, with one difference that matters: its
 * TYPE requires `aria-label`. An icon is not a name, and a screen reader
 * user hears only the label. Everything else (variants, `loading`,
 * `asChild`, disabled, focus) is Button's.
 * ------------------------------------------------------------------------- */

export type IconButtonSize = 'sm' | 'md' | 'lg';

const SIZE: Record<IconButtonSize, NonNullable<ButtonProps['size']>> = {
  sm: 'icon-sm',
  md: 'icon-md',
  lg: 'icon-lg',
};

export interface IconButtonProps extends Omit<ButtonProps, 'size' | 'aria-label' | 'children'> {
  /**
   * REQUIRED. What the button does, in words, because the icon cannot say it:
   * "Add 1 lemon to cart", "Remove from cart", "Close". Name the action, not
   * the picture ("Close", not "X").
   */
  'aria-label': string;
  /** Square size: `sm` 36px with a 16px icon, `md` 40px with 20px (default), `lg` 48px with 24px. */
  size?: IconButtonSize;
  /** As Button: `primary` (default), `secondary`, `tertiary`, `danger`, `neutral`. */
  variant?: ButtonVariant;
  /** The icon, as a child: `<PlusIcon />`. Exactly one, and no text. */
  children: React.ReactNode;
}

/**
 * A round, square button with only an icon in it.
 *
 * **When to use:** a compact action whose icon everyone knows, where a text
 * label does not fit: the "+" on a product tile, a "Close" in a dialog
 * header, "Remove from cart" on a cart row. Always pass `aria-label`.
 *
 * **When not to use:**
 * - When there is room for words, or the icon is not obvious: use `<Button>`
 *   with the icon and a text label.
 * - To go to another page: use `<Link>`.
 * - For a decorative or status icon that does nothing: use `<Icon>`.
 * - For a quantity control (− 1 +): use `<QuantityStepper>`. Never build one from
 *   two IconButtons and a Text.
 *
 * @example
 * <IconButton aria-label="Add 1 lemon to cart" size="sm">
 *   <PlusIcon />
 * </IconButton>
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', ...props }, ref) => (
    <Button ref={ref} size={SIZE[size]} data-slot="icon-button" data-size={size} {...props} />
  ),
);
IconButton.displayName = 'IconButton';
