import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/cn';

export const priceVariants = cva('inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-sans tabular-nums');

export const priceCurrentVariants = cva('', {
  variants: {
    size: {
      sm: 'type-label',
      md: 'type-title',
      lg: 'type-h2',
    },
    tone: {
      default: 'text-content-strong',
      // The site shows sale prices on the deal-yellow highlight with dark text
      // (brand.md, Decisions: Sale/deal). The badge-sale pair is contrast-gated.
      sale: 'rounded-sm bg-badge-sale px-1 text-badge-sale-fg',
    },
  },
  defaultVariants: { size: 'md', tone: 'default' },
});

export const priceSecondaryVariants = cva('text-content-muted', {
  variants: {
    size: {
      sm: 'type-caption',
      md: 'type-body-sm',
      lg: 'type-body',
    },
  },
  defaultVariants: { size: 'md' },
});

export type PriceSize = 'sm' | 'md' | 'lg';
export type PriceTone = 'default' | 'sale';

/** A per-unit price: `{ amount: 0.42, unit: 'oz' }` shows "$0.42/oz". */
export interface UnitPrice {
  /** The price of one unit, in the same currency as the main amount. */
  amount: number;
  /** The unit, as shoppers read it: "oz", "lb", "each", "fl oz". */
  unit: string;
}

export interface PriceProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The price to pay now, as a number in major units (3.99, not 399). */
  amount: number;
  /**
   * The ISO 4217 currency code.
   *
   * @default 'USD'
   */
  currency?: string;
  /**
   * The BCP 47 locale used to format every amount.
   *
   * @default 'en-US'
   */
  locale?: string;
  /**
   * The original price before a sale. Shown struck through after the current
   * price, and read by screen readers as "Original price", because a line
   * through text is not announced.
   */
  wasAmount?: number;
  /** A per-unit price shown after the price, for comparing sizes: "$0.42/oz". */
  unitPrice?: UnitPrice;
  /**
   * `sm` on a dense product tile · `md` the default · `lg` the product page.
   *
   * @default 'md'
   */
  size?: PriceSize;
  /**
   * `default` · `sale` puts the current price on the deal-yellow highlight.
   * Use `sale` when the item is on sale, usually together with `wasAmount`.
   *
   * @default 'default'
   */
  tone?: PriceTone;
}

/**
 * Price: a formatted grocery price, with an optional "was" price and a
 * per-unit price.
 *
 * **When to use:** every money amount a shopper reads on a product, in the
 * cart or at checkout: "$3.99", a sale ("$2.99", was "$3.99") and a unit
 * price ("$0.42/oz"). It formats with `Intl.NumberFormat`, so pass a number,
 * never a string with a "$" in it.
 *
 * **When not to use:**
 * - Do not write a price as plain **Text** ("$3.99" in a Text): it loses the
 *   formatting, the sale styling and the screen-reader labels.
 * - A deal tag with no amount ("Sale", "No markups"): use **Badge** with
 *   `tone="sale"`.
 * - A sentence that mentions money ("$0 delivery fees on your first 3
 *   orders"): that is copy, so use **Text**.
 *
 * @example
 * <Price amount={3.99} />
 * <Price amount={2.99} wasAmount={3.99} tone="sale" />
 * <Price amount={4.99} unitPrice={{ amount: 0.42, unit: 'oz' }} size="lg" />
 */
export const Price = React.forwardRef<HTMLSpanElement, PriceProps>(function Price(
  {
    className,
    amount,
    currency = 'USD',
    locale = 'en-US',
    wasAmount,
    unitPrice,
    size = 'md',
    tone = 'default',
    ...props
  },
  ref,
) {
  const format = new Intl.NumberFormat(locale, { style: 'currency', currency }).format;
  const hasWas = wasAmount !== undefined;

  return (
    <span
      ref={ref}
      data-slot="price"
      data-size={size}
      data-tone={tone}
      className={cn(priceVariants(), className)}
      {...props}
    >
      <data data-slot="price-current" value={String(amount)} className={priceCurrentVariants({ size, tone })}>
        {hasWas ? (
          <span data-slot="price-label" className="sr-only">
            Current price{' '}
          </span>
        ) : null}
        {format(amount)}
      </data>
      {hasWas ? (
        <s data-slot="price-was" className={priceSecondaryVariants({ size })}>
          <span data-slot="price-label" className="sr-only">
            Original price{' '}
          </span>
          <data data-slot="price-was-amount" value={String(wasAmount)}>
            {format(wasAmount)}
          </data>
        </s>
      ) : null}
      {unitPrice ? (
        <span data-slot="price-unit" className={priceSecondaryVariants({ size })}>
          <span data-slot="price-unit-visual" aria-hidden="true">
            {format(unitPrice.amount)}/{unitPrice.unit}
          </span>
          <span data-slot="price-label" className="sr-only">
            {format(unitPrice.amount)} per {unitPrice.unit}
          </span>
        </span>
      ) : null}
    </span>
  );
});
Price.displayName = 'Price';
