import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

/* ---------------------------------------------------------------------------
 * Link
 *
 * Text that goes somewhere. An <a> by default, or the router's link through
 * `asChild`. It takes the font, size and weight of the text around it, so it
 * sits inside a sentence without changing the line.
 *
 * The underline is the non-colour cue that says "this is a link" (WCAG 1.4.1),
 * so it is on by default. Its weight and gap are tier-3 tokens
 * (tokens/component.link.json): `--link-underline-thickness`, `--link-underline-offset`.
 * ------------------------------------------------------------------------- */

export const linkVariants = cva(
  [
    'cursor-pointer rounded-sm transition-colors',
    'underline-offset-(--link-underline-offset) decoration-(length:--link-underline-thickness)',
    // The focus outline's width and offset come from base.css.
    'focus-visible:outline-focus-ring',
    // An icon child (an "opens in a new tab" arrow) sits on the text line.
    "[&_svg]:inline [&_svg]:align-middle [&_svg:not([class*='size-'])]:size-icon-sm",
  ],
  {
    variants: {
      variant: {
        /** The link green. For links in running text and standalone links on a page. */
        default: 'text-content-link hover:text-content-link-hover',
        /** The colour of the text around it, as on instacart.com. For fine print and dense lists. */
        subtle: 'text-inherit hover:text-content-strong',
        /** For a dark or brand surface, such as the Kale promo banner. */
        inverse: 'text-content-inverse',
      },
      underline: {
        /** Always underlined. The default, and the right choice inside a sentence. */
        always: 'underline',
        /** Underlined on hover and focus only. Only where it is obvious that the text is a link (a footer list, "View more"). */
        hover: 'no-underline hover:underline focus-visible:underline',
      },
    },
    defaultVariants: { variant: 'default', underline: 'always' },
  },
);

export type LinkVariant = NonNullable<VariantProps<typeof linkVariants>['variant']>;
export type LinkUnderline = NonNullable<VariantProps<typeof linkVariants>['underline']>;

export interface LinkProps extends React.ComponentPropsWithoutRef<'a'>, VariantProps<typeof linkVariants> {
  /** The colour: `default` link green, `subtle` the surrounding text colour, `inverse` for dark surfaces. */
  variant?: LinkVariant;
  /** `always` (default) underlined, or `hover`: underlined only on hover and focus. */
  underline?: LinkUnderline;
  /**
   * Render the single child element instead of an `<a>`, with the link's
   * classes and props merged onto it. Use it for a router link:
   * `<Link asChild><RouterLink to="/store/sprouts">Sprouts Farmers Market</RouterLink></Link>`.
   */
  asChild?: boolean;
  /**
   * The link leaves Instacart (another site or a PDF). Opens it in a new tab
   * (`target="_blank"`, `rel="noopener noreferrer"`) and tells screen reader
   * users so. Add a visible icon as a child if the page needs one.
   */
  external?: boolean;
}

/**
 * Text that takes you to another page.
 *
 * **When to use:** navigation, and nothing else: "Offers subject to terms and
 * eligibility" in fine print, a store name, "View more" to a full aisle, a
 * help article, a link in a sentence.
 *
 * **When not to use:**
 * - **Never for an action that writes data** (adds to cart, places or cancels
 *   an order, saves, deletes, signs out): use `<Button>`. A link may be
 *   prefetched, opened in a new tab or followed by a crawler, so it must only
 *   ever read.
 * - For a big call to action that navigates ("Start shopping"): use
 *   `<Button asChild><a href>…</a></Button>`, which looks like a button but
 *   is still a link.
 * - For an icon with no text: use `<IconButton asChild>` with an `aria-label`.
 *
 * @example
 * <Text variant="caption">
 *   *Service and other fees apply. <Link href="/help/fees">See fees</Link>
 * </Text>
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, underline, asChild = false, external = false, target, rel, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';
    return (
      <Comp
        ref={ref}
        data-slot="link"
        data-variant={variant ?? 'default'}
        target={external ? (target ?? '_blank') : target}
        rel={external ? (rel ?? 'noopener noreferrer') : rel}
        className={cn(linkVariants({ variant, underline }), className)}
        {...props}
      >
        <Slottable>{children}</Slottable>
        {external ? (
          <span data-slot="link-external-hint" className="sr-only">
            {' (opens in a new tab)'}
          </span>
        ) : null}
      </Comp>
    );
  },
);
Link.displayName = 'Link';
