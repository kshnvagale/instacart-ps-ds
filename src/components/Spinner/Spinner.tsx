import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

/* ---------------------------------------------------------------------------
 * Spinner
 *
 * A turning arc. The turn is the `spinner-turn` class in
 * src/styles/components.css (a @keyframes rule, which no utility can write),
 * timed by the tier-3 token `--spinner-duration`.
 *
 * The root is a `role="status"` live region with a visually hidden label, so
 * a screen reader hears the label once when the spinner appears. The arc is
 * drawn in `currentColor`, so its colour is the `tone`.
 * ------------------------------------------------------------------------- */

export const spinnerVariants = cva('inline-flex shrink-0 items-center justify-center', {
  variants: {
    size: {
      /** 16px. Inline with small text, and inside a Button. */
      sm: 'size-icon-sm',
      /** 24px. Beside a line of body text ("Finding your shopper…"). */
      md: 'size-icon-lg',
      /** 40px. The one wait on a page or in a panel. */
      lg: 'size-10',
    },
    tone: {
      /** The brand green. The default for a wait on a page. */
      brand: 'text-content-brand',
      /** Muted grey, for a quiet wait inside a list or a card. */
      muted: 'text-content-muted',
      /** The colour of the text around it. Button uses this, so the arc matches the label. */
      current: 'text-current',
    },
  },
  defaultVariants: { size: 'md', tone: 'brand' },
});

export type SpinnerSize = NonNullable<VariantProps<typeof spinnerVariants>['size']>;
export type SpinnerTone = NonNullable<VariantProps<typeof spinnerVariants>['tone']>;

export interface SpinnerProps
  extends Omit<React.ComponentPropsWithoutRef<'span'>, 'children'>,
    VariantProps<typeof spinnerVariants> {
  /** How big the arc is: `sm` 16px, `md` 24px (default), `lg` 40px. */
  size?: SpinnerSize;
  /** The arc colour: `brand` green (default), `muted` grey, or `current` (the surrounding text colour). */
  tone?: SpinnerTone;
  /**
   * What a screen reader hears. Say what you are waiting for, in a few words
   * ("Finding your shopper"). It is not shown on screen: put visible text next
   * to the Spinner yourself. Default: "Loading".
   */
  label?: string;
}

/**
 * A turning arc that shows something is on its way.
 *
 * **When to use:** a wait you cannot measure, for example "Finding your
 * shopper…" after checkout, or a list of stores that is still loading. Put a
 * short visible message beside it, and pass the same words as `label`.
 *
 * **When not to use:**
 * - A button that is busy: use `<Button loading>`. It draws its own Spinner and
 *   sets `aria-busy`.
 * - Content whose shape you know (a product grid): show the layout with
 *   placeholder blocks instead, so the page does not jump when it loads.
 * - A wait with known progress (an upload): use a progress bar.
 *
 * @example
 * <div className="flex items-center gap-3">
 *   <Spinner label="Finding your shopper" />
 *   <Text>Finding your shopper…</Text>
 * </div>
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size, tone, label = 'Loading', ...props }, ref) => {
    const hidden = props['aria-hidden'] === true || props['aria-hidden'] === 'true';
    return (
      <span
        ref={ref}
        data-slot="spinner"
        data-size={size ?? 'md'}
        // A hidden Spinner (inside a busy Button) is decoration, not a live region.
        role={hidden ? undefined : 'status'}
        className={cn(spinnerVariants({ size, tone }), className)}
        {...props}
      >
        <svg
          data-slot="spinner-icon"
          className="spinner-turn size-full"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            data-slot="spinner-arc"
            d="M12 3a9 9 0 1 1-9 9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        {hidden ? null : (
          <span data-slot="spinner-label" className="sr-only">
            {label}
          </span>
        )}
      </span>
    );
  },
);
Spinner.displayName = 'Spinner';
