import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/cn';

export const checkboxVariants = cva([
  'peer group/checkbox inline-flex size-5 shrink-0 items-center justify-center rounded-sm',
  'border-(length:--border-width-thick) border-content-muted bg-surface text-action-primary-fg',
  'cursor-pointer transition-colors',

  // Checked and indeterminate: the primary green fill.
  'data-[state=checked]:border-action-primary data-[state=checked]:bg-action-primary',
  'data-[state=indeterminate]:border-action-primary data-[state=indeterminate]:bg-action-primary',

  // Focus: a 2px focus-ring outline, the same way every control focuses.
  'outline-none focus-visible:outline-solid focus-visible:outline-(length:--border-width-thick)',
  'focus-visible:outline-offset-(length:--border-width-thick) focus-visible:outline-focus-ring',

  // Invalid is the ARIA attribute, styled: a red border when unchecked.
  'aria-invalid:border-action-danger aria-invalid:focus-visible:outline-action-danger',

  // Disabled is a fill, not an opacity. A checked box still reads as checked.
  'disabled:cursor-not-allowed disabled:border-action-disabled-border disabled:bg-action-disabled',
  'disabled:data-[state=checked]:bg-action-disabled-fg disabled:data-[state=checked]:border-action-disabled-fg',
  'disabled:data-[state=indeterminate]:bg-action-disabled-fg disabled:data-[state=indeterminate]:border-action-disabled-fg',
  'disabled:text-action-disabled',
]);

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /**
   * Controlled state: `true`, `false`, or `'indeterminate'` (a "select all"
   * box when only some items are picked). Use with `onCheckedChange`.
   */
  checked?: CheckboxPrimitive.CheckedState;
  /** Uncontrolled starting state. */
  defaultChecked?: CheckboxPrimitive.CheckedState;
  /**
   * Called with the new state when the person ticks or unticks the box. Store
   * it in the form; do NOT save it to the server here. If the change must
   * apply right away, the control is a **Switch**, not a Checkbox.
   */
  onCheckedChange?: (checked: CheckboxPrimitive.CheckedState) => void;
  /** The box cannot be changed. Its value is not sent with the form. */
  disabled?: boolean;
  /** The form cannot be submitted until this box is ticked. */
  required?: boolean;
  /** The field name sent with the form. */
  name?: string;
  /**
   * The value sent with the form when ticked.
   *
   * @default 'on'
   */
  value?: string;
  /**
   * Marks the choice as wrong (for example a required box left unticked).
   * This is the only way to show the error style. Point `aria-describedby` at
   * the error message.
   */
  'aria-invalid'?: React.AriaAttributes['aria-invalid'];
}

/**
 * Checkbox: an opt-in choice that takes effect when the form is submitted.
 *
 * **When to use:** a yes/no choice inside a form that the person confirms
 * with a button: "Leave at door" on checkout (applied when they tap "Place
 * order"), "Save this address", "I agree to the terms". Also several
 * independent picks from a list, and a "select all" box (`checked="indeterminate"`
 * when only some are picked). Ticking the box changes nothing until the form
 * is submitted. Pair it with a `<label htmlFor>`; there is no label prop.
 *
 * **When not to use:**
 * - A setting that applies instantly when toggled, with no save button
 *   ("Substitution alerts" in account settings): use **Switch**. If the
 *   change is saved the moment it is flipped, it is a Switch, never a Checkbox.
 * - One choice out of several that exclude each other ("Delivery" or
 *   "Pickup"): use a radio group (this system has none yet; do not fake one
 *   with Checkboxes).
 * - A command ("Add to cart"): use **Button**.
 *
 * @example
 * <form>
 *   <Checkbox id="leave-at-door" name="leaveAtDoor" />
 *   <label htmlFor="leave-at-door">Leave at door</label>
 *   <Button type="submit">Place order</Button>
 * </form>
 */
export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        data-slot="checkbox"
        className={cn(checkboxVariants(), className)}
        {...props}
      >
        <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center">
          {/* Drawn in currentColor, so the mark follows the theme. One mark per
              state; the root's data-state picks which one shows. */}
          <svg
            data-slot="checkbox-check"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            className="size-icon-sm group-data-[state=indeterminate]/checkbox:hidden"
          >
            <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
          </svg>
          <svg
            data-slot="checkbox-dash"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
            className="hidden size-icon-sm group-data-[state=indeterminate]/checkbox:block"
          >
            <path d="M4 8h8" />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  },
);
Checkbox.displayName = 'Checkbox';
