import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';
import { Spinner } from '../Spinner';

/* ---------------------------------------------------------------------------
 * Button
 *
 * Structure follows shadcn/ui and the SSX Button: a `cva` recipe, a
 * `React.forwardRef` component, `data-slot` hooks, `asChild` for links and
 * router links, icons passed as CHILDREN, and a square button as a `size`
 * (`icon-md`), not a boolean.
 *
 * The variants ARE the meaning (tokens/semantic.color.json, action.*):
 *   primary    the green fill. The one main action: "Add to cart", "Checkout".
 *   secondary  the grey fill: "Show all", "View more".
 *   tertiary   the outline: "Log in".
 *   danger     destroys or cancels something: "Remove", "Cancel order".
 *   neutral    the dark fill: a strong action that must not be green.
 *
 * Every pill is fully round (`rounded-full`): Instacart's buttons measure a
 * radius of half their height at every size (brand/brand.md, Shape).
 *
 * States are data attributes, so they work the same on a <button> and on an
 * `asChild` <a>: `data-disabled` and `data-loading`. Hover and press styles
 * are gated with `not-data-disabled:not-data-loading:`, so neither state
 * reacts to the pointer. (Written out in full on purpose: Tailwind finds
 * classes by reading this file, so a class built from a template string
 * would never be compiled.)
 * ------------------------------------------------------------------------- */

export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'rounded-full border border-transparent font-sans select-none',
    'cursor-pointer transition-colors',
    // The focus outline's width and offset come from base.css; the colour is
    // stated here too, so the recipe says what it looks like.
    'focus-visible:outline-focus-ring',
    // Icons are children. The button sizes them, unless an icon sets its own size.
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon-sm",
    // Disabled is a fill, not an opacity: a faded button also fades the surface
    // behind it.
    'data-disabled:cursor-not-allowed data-disabled:border-action-disabled-border',
    'data-disabled:bg-action-disabled data-disabled:text-action-disabled-fg',
    // Loading keeps the variant's colours and says "busy" with the cursor. The
    // Spinner takes the place of any icon child, so the width does not change.
    'data-loading:cursor-progress data-loading:[&>svg]:hidden',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-action-primary text-action-primary-fg border-action-primary-border',
          'not-data-disabled:not-data-loading:hover:bg-action-primary-hover',
          'not-data-disabled:not-data-loading:active:bg-action-primary-active',
        ],
        secondary: [
          'bg-action-secondary text-action-secondary-fg border-action-secondary-border',
          'not-data-disabled:not-data-loading:hover:bg-action-secondary-hover',
          'not-data-disabled:not-data-loading:active:bg-action-secondary-active',
        ],
        tertiary: [
          'bg-action-tertiary text-action-tertiary-fg border-action-tertiary-border',
          'not-data-disabled:not-data-loading:hover:bg-action-tertiary-hover',
          'not-data-disabled:not-data-loading:active:bg-action-tertiary-active',
        ],
        danger: [
          'bg-action-danger text-action-danger-fg border-action-danger-border',
          'not-data-disabled:not-data-loading:hover:bg-action-danger-hover',
          'not-data-disabled:not-data-loading:active:bg-action-danger-active',
        ],
        neutral: [
          'bg-action-neutral text-action-neutral-fg border-action-neutral-border',
          'not-data-disabled:not-data-loading:hover:bg-action-neutral-hover',
          'not-data-disabled:not-data-loading:active:bg-action-neutral-active',
        ],
      },
      size: {
        /** 36px: the "Add" button on a product tile. */
        sm: 'h-control-sm px-4 type-label',
        /** 40px: "Log in", "Show all". The default. */
        md: 'h-control-md px-4 type-label-lg',
        /** 48px. */
        lg: "h-control-lg px-5 type-label-lg [&_svg:not([class*='size-'])]:size-icon-md",
        /** 56px: "Add to cart" on the product page. */
        xl: "h-control-xl px-6 type-label-lg [&_svg:not([class*='size-'])]:size-icon-md",
        /** Square, 36px, 16px icon. */
        'icon-sm': 'size-control-sm p-0',
        /** Square, 40px, 20px icon. */
        'icon-md': "size-control-md p-0 [&_svg:not([class*='size-'])]:size-icon-md",
        /** Square, 48px, 24px icon. */
        'icon-lg': "size-control-lg p-0 [&_svg:not([class*='size-'])]:size-icon-lg",
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

/** The Spinner matches the icon size of each button size. */
const SPINNER_SIZE: Record<ButtonSize, string> = {
  sm: 'size-icon-sm',
  md: 'size-icon-sm',
  lg: 'size-icon-md',
  xl: 'size-icon-md',
  'icon-sm': 'size-icon-sm',
  'icon-md': 'size-icon-md',
  'icon-lg': 'size-icon-lg',
};

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {
  /**
   * What the button means, not how it looks. `primary` (default) is the one
   * main action on the view; `secondary` the grey alternative; `tertiary` the
   * outline; `danger` destroys or cancels; `neutral` a dark, non-green action.
   */
  variant?: ButtonVariant;
  /**
   * Control height: `sm` 36px, `md` 40px (default), `lg` 48px, `xl` 56px.
   * The `icon-sm`, `icon-md` and `icon-lg` sizes are square (36 / 40 / 48px)
   * and need an `aria-label`; prefer `<IconButton>`, which requires one.
   */
  size?: ButtonSize;
  /**
   * Render the single child element instead of a `<button>`, with the
   * button's classes and props merged onto it. Use it for a link that looks
   * like a button: `<Button asChild><a href="/store/sprouts">Browse Sprouts Farmers Market</a></Button>`.
   */
  asChild?: boolean;
  /**
   * Busy. Shows a Spinner in place of any icon, sets `aria-busy` and
   * `aria-disabled`, and ignores clicks. The button keeps its label, its
   * width and keyboard focus. Use it while "Add to cart" or checkout is
   * being sent.
   */
  loading?: boolean;
}

/**
 * A pill-shaped button that does something: adds, saves, sends, removes.
 *
 * **When to use:** any action. Pick the variant by meaning:
 * - `primary` for the main action, such as "Add to cart" or "Checkout".
 *   Use **at most one primary Button per view**; if two actions compete, make
 *   the other one `secondary` or `tertiary`.
 * - `secondary` for other actions: "Show all", "View more".
 * - `tertiary` (outline) for a quiet action beside a filled one: "Log in".
 * - `danger` for an action that removes or cancels: "Remove", "Cancel order".
 * - `neutral` for a strong action that must not read as the brand green.
 *
 * **When not to use:**
 * - To go to another page or URL: use `<Link>`. (For a call to action that
 *   navigates, such as "Start shopping", use `<Button asChild><a href>…</a></Button>`.)
 * - For an icon with no text: use `<IconButton>`, which requires an `aria-label`.
 * - For an on/off setting that applies at once ("Substitution alerts"): use `<Switch>`.
 * - For a vague label: write the verb that says what happens ("Add to cart",
 *   not "Submit" or "OK").
 *
 * @example
 * <Button size="xl" className="w-full" loading={adding}>
 *   <PlusIcon />
 *   Add to cart
 * </Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, type, onClick, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const resolvedSize: ButtonSize = size ?? 'md';
    const inactive = loading || !!disabled;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (inactive) {
        // A loading button is still enabled (so it keeps focus); an asChild
        // link cannot be natively disabled. Both stop the click here.
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.(event);
    };

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant ?? 'primary'}
        data-size={resolvedSize}
        data-loading={loading ? '' : undefined}
        data-disabled={disabled && !loading ? '' : undefined}
        // A native `disabled` only when it is really off and really a <button>:
        // a loading button stays focusable so focus is not lost mid-checkout.
        disabled={!asChild && disabled && !loading ? true : undefined}
        aria-disabled={inactive ? true : undefined}
        aria-busy={loading ? true : undefined}
        type={asChild ? type : (type ?? 'button')}
        className={cn(buttonVariants({ variant, size }), className)}
        onClick={handleClick}
        {...props}
      >
        {loading ? <Spinner aria-hidden="true" size="sm" tone="current" className={SPINNER_SIZE[resolvedSize]} /> : null}
        <Slottable>{children}</Slottable>
      </Comp>
    );
  },
);
Button.displayName = 'Button';
