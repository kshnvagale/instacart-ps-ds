import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/cn';
import { IconButton } from '../IconButton';

/* ---------------------------------------------------------------------------
 * QuantityStepper
 *
 * The "− 1 +" pill that sets how many of an item are in the cart, as on
 * instacart.com once a product has been added. It is built from two
 * IconButtons and a live count, in one fully round pill (brand/brand.md,
 * Shape). It can be controlled (`value` + `onValueChange`) or uncontrolled
 * (`defaultValue`).
 *
 * Accessibility: the root is a `role="group"` named by `label` ("Quantity of
 * Organic Lemons"). The buttons are "Decrease quantity" and "Increase
 * quantity", so the keyboard works through them (Tab, then Enter or Space).
 * The count is an `<output aria-live="polite">`, so a screen reader hears the
 * new number after each press. A button is disabled at `min` or `max`.
 * ------------------------------------------------------------------------- */

export const quantityStepperVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface p-0.5 font-sans',
    'data-disabled:border-border',
  ],
  {
    variants: {
      size: {
        sm: '',
        md: '',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

const countVariants = cva('px-2 text-center tabular-nums text-content-strong', {
  variants: {
    size: {
      sm: 'type-label',
      md: 'type-label-lg',
    },
    disabled: {
      true: 'text-content-disabled',
      false: '',
    },
  },
  defaultVariants: { size: 'md', disabled: false },
});

export type QuantityStepperSize = 'sm' | 'md';

export interface QuantityStepperProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'role'> {
  /**
   * REQUIRED. The name of the whole control, read by screen readers. Name the
   * item: "Quantity of Organic Lemons", not just "Quantity".
   */
  label: string;
  /** The count, when the parent owns it (controlled). Pair it with `onValueChange`. */
  value?: number;
  /**
   * The first count, when the stepper owns it (uncontrolled).
   *
   * @default min
   */
  defaultValue?: number;
  /** Called with the new count after each press of − or +. */
  onValueChange?: (value: number) => void;
  /**
   * The lowest count. The − button is disabled here.
   *
   * @default 0
   */
  min?: number;
  /** The highest count, such as the store's limit per order. The + button is disabled here. No limit when left out. */
  max?: number;
  /**
   * How much one press adds or removes.
   *
   * @default 1
   */
  step?: number;
  /**
   * `sm` (36px buttons) on a product tile, `md` (40px buttons, default) in the
   * cart and on the product page.
   */
  size?: QuantityStepperSize;
  /** The whole control cannot be used: both buttons are disabled and the count is greyed. */
  disabled?: boolean;
}

const MinusSvg = () => (
  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" data-slot="quantity-stepper-icon">
    <path d="M224 128a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8Z" />
  </svg>
);

const PlusSvg = () => (
  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" data-slot="quantity-stepper-icon">
    <path d="M224 128a8 8 0 0 1-8 8h-80v80a8 8 0 0 1-16 0v-80H40a8 8 0 0 1 0-16h80V40a8 8 0 0 1 16 0v80h80a8 8 0 0 1 8 8Z" />
  </svg>
);

/**
 * QuantityStepper: the "− 1 +" pill that sets how many of an item are in the cart.
 *
 * **When to use:** an item quantity, wherever a shopper changes how many of
 * a product they want: a cart row, a product tile after "Add" was pressed,
 * the product page. Always pass `label` with the item's name ("Quantity of
 * Organic Lemons"). Set `max` to the store's limit when there is one.
 *
 * **When not to use:**
 * - Never an `Input` with `type="number"`, a raw `<input>`, or a hand-made
 *   pair of IconButtons around a Text for a quantity: use this component.
 * - For a number that is not an item count (a tip, an apartment number, a
 *   rating): use `<Input>` with a `<label>`.
 * - Before the item is in the cart: show an "Add" `<Button>` (or the "+"
 *   `<IconButton>` on a tile), then swap in QuantityStepper once it is added.
 *
 * @example
 * <QuantityStepper
 *   label="Quantity of Organic Lemons"
 *   value={count}
 *   onValueChange={setCount}
 *   min={1}
 *   max={12}
 * />
 */
export const QuantityStepper = React.forwardRef<HTMLDivElement, QuantityStepperProps>(
  (
    {
      label,
      value: valueProp,
      defaultValue,
      onValueChange,
      min = 0,
      max,
      step = 1,
      size = 'md',
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [inner, setInner] = React.useState(defaultValue ?? min);
    const controlled = valueProp !== undefined;
    const value = controlled ? valueProp : inner;

    const atMin = value - step < min;
    const atMax = max !== undefined && value + step > max;

    const change = (next: number) => {
      if (!controlled) setInner(next);
      onValueChange?.(next);
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-label={label}
        data-slot="quantity-stepper"
        data-size={size}
        data-disabled={disabled ? '' : undefined}
        className={cn(quantityStepperVariants({ size }), className)}
        {...props}
      >
        <IconButton
          variant="secondary"
          size={size}
          aria-label="Decrease quantity"
          disabled={disabled || atMin}
          onClick={() => change(value - step)}
        >
          <MinusSvg />
        </IconButton>
        <output
          aria-live="polite"
          aria-atomic="true"
          data-slot="quantity-stepper-value"
          className={countVariants({ size, disabled })}
        >
          {value}
        </output>
        <IconButton
          variant="secondary"
          size={size}
          aria-label="Increase quantity"
          disabled={disabled || atMax}
          onClick={() => change(value + step)}
        >
          <PlusSvg />
        </IconButton>
      </div>
    );
  },
);
QuantityStepper.displayName = 'QuantityStepper';
