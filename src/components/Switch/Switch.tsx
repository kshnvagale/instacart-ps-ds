import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

/*
 * Geometry, all from the space scale. The track has 2px padding (p-0.5), so
 * the thumb's travel is: track width - thumb size - 2 x padding.
 *   md: 40 x 24 track, 20px thumb, travels 16px (translate-x-4)
 *   sm: 32 x 20 track, 16px thumb, travels 12px (translate-x-3)
 */
export const switchVariants = cva(
  [
    'peer inline-flex shrink-0 items-center rounded-full p-0.5',
    'cursor-pointer transition-colors',

    // Off: a muted track with 3:1 contrast. On: the primary green.
    'bg-content-muted data-[state=checked]:bg-action-primary',
    'enabled:data-[state=checked]:hover:bg-action-primary-hover',

    // Focus: a 2px focus-ring outline, the same way every control focuses.
    'outline-none focus-visible:outline-solid focus-visible:outline-(length:--border-width-thick)',
    'focus-visible:outline-offset-(length:--border-width-thick) focus-visible:outline-focus-ring',

    // Disabled is a fill, not an opacity. The thumb's position still shows on or off.
    'disabled:cursor-not-allowed disabled:bg-action-disabled-border',
    'disabled:data-[state=checked]:bg-action-disabled-fg',
  ],
  {
    variants: {
      size: {
        sm: 'h-5 w-8',
        md: 'h-6 w-10',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export const switchThumbVariants = cva(
  [
    'pointer-events-none block rounded-full bg-surface shadow-raised',
    'translate-x-0 transition-transform ease-standard',
  ],
  {
    variants: {
      size: {
        sm: 'size-4 data-[state=checked]:translate-x-3',
        md: 'size-5 data-[state=checked]:translate-x-4',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

type SwitchVariantProps = VariantProps<typeof switchVariants>;

export type SwitchSize = NonNullable<SwitchVariantProps['size']>;

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  /**
   * `sm` in a dense list of settings · `md` everywhere else.
   *
   * @default 'md'
   */
  size?: SwitchSize;
  /** Controlled state: on (`true`) or off (`false`). Use with `onCheckedChange`. */
  checked?: boolean;
  /** Uncontrolled starting state. */
  defaultChecked?: boolean;
  /**
   * Called with the new state the moment the switch is flipped. Apply the
   * setting HERE (save it right away); there is no Save button. If the change
   * should wait for a form submit, the control is a **Checkbox**, not a Switch.
   */
  onCheckedChange?: (checked: boolean) => void;
  /** The switch cannot be flipped. */
  disabled?: boolean;
  /** The field name, if the switch also sits inside a form. */
  name?: string;
}

/**
 * Switch: an on/off setting that applies instantly.
 *
 * **When to use:** a setting that takes effect the moment it is flipped, with
 * no save button: "Substitution alerts" or "Order updates by text" in account
 * settings, "Show prices per unit" on a list. The new state is saved in
 * `onCheckedChange`. Screen readers announce it as "on / off". Pair it with a
 * `<label htmlFor>`; there is no label prop.
 *
 * **When not to use:**
 * - A choice that only takes effect when a form is submitted ("Leave at door"
 *   on checkout, applied by "Place order"): use **Checkbox**. If there is a
 *   submit button, it is a Checkbox, never a Switch.
 * - Several picks from a list, or "I agree to the terms": use **Checkbox**.
 * - A command ("Add to cart"): use **Button**.
 *
 * The rule, both ways: applies instantly when toggled → **Switch**. Applies
 * when the form is submitted → **Checkbox**.
 *
 * @example
 * <label htmlFor="sub-alerts">Substitution alerts</label>
 * <Switch id="sub-alerts" checked={alerts} onCheckedChange={saveSubstitutionAlerts} />
 */
export const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  function Switch({ className, size = 'md', ...props }, ref) {
    return (
      <SwitchPrimitive.Root
        ref={ref}
        data-slot="switch"
        data-size={size}
        className={cn(switchVariants({ size }), className)}
        {...props}
      >
        <SwitchPrimitive.Thumb data-slot="switch-thumb" className={switchThumbVariants({ size })} />
      </SwitchPrimitive.Root>
    );
  },
);
Switch.displayName = 'Switch';
