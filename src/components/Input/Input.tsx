import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

export const inputVariants = cva(
  [
    'flex w-full min-w-0 border',
    'font-sans type-body-lg text-content',
    'placeholder:text-content-muted',
    'transition-colors',

    // Focus: a 2px focus-ring outline, the same way every control focuses.
    'outline-none focus-visible:outline-solid focus-visible:outline-(length:--border-width-thick)',
    'focus-visible:outline-offset-(length:--border-width-hair) focus-visible:outline-focus-ring',

    // Invalid is the ARIA attribute, styled. There is no `invalid` prop, so the
    // red border cannot appear unless assistive technology hears it too.
    'aria-invalid:border-action-danger aria-invalid:focus-visible:outline-action-danger',

    // Disabled is a fill, not an opacity.
    'disabled:cursor-not-allowed disabled:border-action-disabled-border disabled:bg-action-disabled',
    'disabled:text-content-disabled disabled:placeholder:text-content-disabled',

    // Read-only is NOT disabled: the value stays readable and copyable. A
    // dashed border says "a value, not a field". `not-disabled` matters: a
    // disabled input also matches `:read-only`.
    'read-only:not-disabled:cursor-default read-only:not-disabled:border-dashed',
    'read-only:not-disabled:border-border-strong read-only:not-disabled:bg-surface',

    // The browser's own clear button on type="search" uses colours we do not own.
    '[&::-webkit-search-cancel-button]:appearance-none',
  ],
  {
    variants: {
      size: {
        // Aisle and product page search: a quiet grey fill, 8px corners, no
        // visible border (brand/brand.md, Shape).
        md: 'h-control-md rounded-md border-transparent bg-surface-subtle px-4',
        lg: 'h-control-lg rounded-md border-transparent bg-surface-subtle px-4',
        // The home page search: 56px pill, 1px border, white fill.
        xl: 'h-control-xl rounded-full border-border-strong bg-surface px-5',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

type InputVariantProps = VariantProps<typeof inputVariants>;

export type InputSize = NonNullable<InputVariantProps['size']>;

/**
 * The native `size` attribute (a width in characters) is left out on purpose:
 * `size` here is the design-system size, and `w-full` sets the width anyway.
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * `md` (40px) a field in a form or a dense panel · `lg` (48px) a roomier form
   * or the aisle and product page search · `xl` (56px, pill) the one big home
   * page search.
   *
   * @default 'md'
   */
  size?: InputSize;
  /**
   * The native input type, passed through ("text", "email", "tel", "search",
   * ...). Never `"number"` for an item quantity: use QuantityStepper.
   *
   * @default 'text'
   */
  type?: React.HTMLInputTypeAttribute;
  /**
   * Marks the value as wrong. This is the only way to show the error style:
   * the red border reads this attribute. Point `aria-describedby` at the error
   * message so it is announced.
   */
  'aria-invalid'?: React.AriaAttributes['aria-invalid'];
  /** The field cannot be used and its value is not sent with the form. */
  disabled?: boolean;
  /** The value can be read, selected and copied, but not changed. It is still sent with the form. */
  readOnly?: boolean;
}

/**
 * Input: a single-line text field.
 *
 * **When to use:** any short typed value: an email, a phone number, a promo
 * code, a delivery address line, a search ("Search products, stores, and
 * recipes"). It has NO label prop: always pair it with a `<label htmlFor>`
 * (or, for a search with a visible icon, an `aria-label`). Help or error text
 * is a separate element linked with `aria-describedby`. Show an error with
 * `aria-invalid`, never with a class.
 *
 * **When not to use:**
 * - An item quantity ("how many lemons"): use **QuantityStepper**. Never an
 *   Input with `type="number"` for a quantity.
 * - A yes/no choice: use **Checkbox** (saved when the form is submitted) or
 *   **Switch** (applies instantly).
 * - Text that cannot be edited and is not part of a form: use **Text**.
 *
 * @example
 * <label htmlFor="promo">Promo code</label>
 * <Input id="promo" aria-invalid aria-describedby="promo-error" />
 * <p id="promo-error">This code has expired</p>
 *
 * <Input size="xl" type="search" aria-label="Search" placeholder="Search products, stores, and recipes" />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, size = 'md', type = 'text', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      data-slot="input"
      data-size={size}
      type={type}
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  );
});
Input.displayName = 'Input';
