import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

/* ---------------------------------------------------------------------------
 * The artwork comes from Instacart's official logo kit (brand/logos/, sources
 * in brand/brand.md, Logo). The paths are copied unchanged. The colours are
 * NOT copied: each shape takes a `fill-logo-*` utility, which reads the
 * tokens/component.logo.json tokens (Kale, Lime, Carrot, Cashew, white).
 * ------------------------------------------------------------------------- */

/** The full wordmark, from Instacart_Logo_Kale.svg (viewBox 0 0 345.2 54.4). */
const WORDMARK = {
  viewBox: '0 0 345.2 54.4',
  leaves:
    'M36.4,9.3c-2.3,0-4,1-5.5,3.2l-4.4,6.4V0.7H15.9v18.2l-4.4-6.4c-1.5-2.2-3.2-3.2-5.5-3.2C2.4,9.3,0,11.9,0,15.1c0,2.7,1.3,4.5,4,6.3l17.1,11l17.1-11c2.7-1.8,4-3.5,4-6.3C42.3,11.9,39.9,9.3,36.4,9.3z',
  root: 'M21.1,35.1c10.2,0,18.5,7.6,18.5,18.5h-37C2.6,42.7,11,35.1,21.1,35.1z',
  letters: [
    'M61.3,12.3c-3.9,0-6.4-2.4-6.4-6.2c0-3.7,2.6-6.1,6.4-6.1c3.9,0,6.4,2.4,6.4,6.2S65.2,12.3,61.3,12.3z M67,14.7v38.9H55.5V14.7H67z',
    'M84.1,14.7v7.2h0.6c2.2-5.1,6-8,12.1-8c8.3,0,13.4,4.9,13.4,14.5v25.2H98.7V30.6c0-5.4-2.3-7.8-6.9-7.8c-4.7,0-7.4,2.6-7.4,8.1v22.7H72.9V14.7H84.1z',
    'M124.8,41.3c0.4,3.4,2.5,5.1,6.2,5.1c4.1,0,5.7-1.6,5.7-3.7c0-2.1-1.1-3.4-4.6-3.7l-5-0.6c-8.9-1-12.6-5-12.6-11.6c0-7.4,5.6-12.8,16.3-12.8c10.5,0,15.4,5,16.1,12.6h-10.6c-0.3-2.9-2-4.6-5.7-4.6c-3.8,0-5.5,1.6-5.5,3.7c0,1.9,1.2,2.9,4.1,3.3l5.6,0.7c8.8,1.2,12.6,4.7,12.6,11.7c0,7.6-5.9,13-16.5,13c-10.9,0-16.4-5.2-17.2-13.1H124.8z',
    'M154.1,42.2V23.8h-4.9v-7.6c6.4-0.4,8.9-2.8,9.1-8.7h7.3v7.2h8.7v9.1h-8.7v16.4c0,3.9,1.6,5.1,4.8,5.1c0.9,0,1.9-0.1,2.9-0.3v8.7c-1.9,0.5-3.7,0.7-5.7,0.7C158.1,54.4,154.1,50.1,154.1,42.2z',
    'M200.1,47.1h-0.5c-1.8,4.6-5.2,7.2-11.2,7.2c-7.7,0-11.9-4.8-11.9-11c0-5.7,3.2-9.7,12.1-11.4l6.6-1.2c3.4-0.6,4.6-1.8,4.6-3.8c0-2.7-1.9-4.2-5.5-4.2c-4,0-6,1.8-6.4,4.9h-10.9c1.2-8.4,7.3-13.7,17.7-13.7c11.2,0,16.6,5.7,16.6,14.4v25.2h-11.1V47.1z M199.7,35.7c-1,0.7-2.3,1.3-4.1,1.7l-3.4,0.8c-3,0.7-4.1,2.1-4.1,4.2c0,2.7,1.9,4.3,5.2,4.3c3.9,0,6.5-2.1,6.5-7.1V35.7z',
    'M236.2,13.9c12.1,0,18.9,6.6,19.7,17.2h-11.4c-0.6-4.8-3.2-7.9-8.4-7.9c-5.9,0-9.2,3.7-9.2,10.6c0,7.4,3.6,11.1,9.3,11.1c4.9,0,7.9-2.9,8.5-8.1h11.4c-1.1,10.9-8.4,17.4-20.3,17.4c-13.1,0-20.6-7.9-20.6-20.1C215.4,22,223.6,13.9,236.2,13.9z',
    'M282.7,47.1h-0.5c-1.8,4.6-5.2,7.2-11.2,7.2c-7.7,0-11.9-4.8-11.9-11c0-5.7,3.2-9.7,12.1-11.4l6.6-1.2c3.4-0.6,4.6-1.8,4.6-3.8c0-2.7-1.9-4.2-5.5-4.2c-4,0-6,1.8-6.4,4.9h-10.9c1.2-8.4,7.3-13.7,17.7-13.7c11.2,0,16.6,5.7,16.6,14.4v25.2h-11.1V47.1z M282.3,35.7c-1,0.7-2.3,1.3-4.1,1.7l-3.4,0.8c-3,0.7-4.1,2.1-4.1,4.2c0,2.7,1.9,4.3,5.2,4.3c3.9,0,6.5-2.1,6.5-7.1V35.7z',
    'M310.2,14.7v9.4h0.6c1.9-7.9,4.7-10.1,8.5-10.1c0.8,0,1.6,0.1,2.3,0.4v10.8c-0.9-0.1-1.9-0.2-3.1-0.2c-5.4,0-7.6,2.2-7.6,8.3v20.4h-11.5V14.7H310.2z',
    'M325.1,15.1c3-1.2,4.2-3.6,4.4-7.6h7.1v7.2h8.7v9.1h-8.7v16.4c0,3.9,1.6,5.1,4.8,5.1c0.9,0,1.9-0.1,2.9-0.3v8.7c-1.9,0.5-3.7,0.7-5.7,0.7c-9.4,0-13.5-4.2-13.5-12.2V15.1z',
  ],
} as const;

/** The carrot mark on its own, from Instacart_Carrot.svg (viewBox 0 0 42.3 52.9). */
const MARK = {
  viewBox: '0 0 42.3 52.9',
  leaves:
    'M36.4,8.6c-2.3,0-4,1-5.5,3.2l-4.4,6.4V0H15.9v18.2l-4.4-6.4C9.9,9.6,8.2,8.6,5.9,8.6C2.4,8.6,0,11.2,0,14.4c0,2.7,1.3,4.5,4,6.3l17.1,11l17.1-11c2.7-1.8,4-3.5,4-6.3C42.3,11.2,39.9,8.6,36.4,8.6z',
  root: 'M21.1,34.4c10.2,0,18.5,7.6,18.5,18.5h-37C2.6,42,11,34.4,21.1,34.4z',
} as const;

/**
 * The logo's height. Width follows from the artwork's shape. The smallest
 * step is 20px, the brand guide's minimum ("Small, 20px Height Min.").
 */
export const logoVariants = cva('inline-block w-auto shrink-0 align-middle', {
  variants: {
    size: {
      sm: 'h-5',
      md: 'h-6',
      lg: 'h-8',
    },
  },
  defaultVariants: { size: 'md' },
});

type LogoTone = 'color' | 'cashew' | 'white';

/** Colour of each part, per tone. Only the brand's approved pairs exist. */
const FILL: Record<LogoTone, { leaves: string; root: string; letters: string }> = {
  color: { leaves: 'fill-logo-lime', root: 'fill-logo-carrot', letters: 'fill-logo-kale' },
  cashew: { leaves: 'fill-logo-lime', root: 'fill-logo-carrot', letters: 'fill-logo-cashew' },
  white: { leaves: 'fill-logo-white', root: 'fill-logo-white', letters: 'fill-logo-white' },
};

export interface LogoProps
  extends Omit<React.SVGProps<SVGSVGElement>, 'ref' | 'viewBox' | 'role' | 'children' | 'fill'>,
    VariantProps<typeof logoVariants> {
  /**
   * `full` is the carrot and the word "instacart". `mark` is the carrot on
   * its own, for small square spaces (an app icon, a favicon, a tight header).
   * Prefer `full` wherever it fits: it is the primary brand expression.
   *
   * @default 'full'
   */
  variant?: 'full' | 'mark';
  /**
   * The colour version. Pick it by the background:
   * - `color`: Kale text with the Lime and Carrot carrot. For light
   *   backgrounds (white, Cashew). The primary logo.
   * - `cashew`: Cashew text with the Lime and Carrot carrot. For Kale or other
   *   dark backgrounds.
   * - `white`: all white. For photos, or a background where the full-colour
   *   logo is not approved.
   *
   * For the `mark`, `color` and `cashew` look the same (the carrot keeps its
   * colours).
   *
   * @default 'color'
   */
  tone?: LogoTone;
  /**
   * Height: `sm` 20px (the brand minimum; never smaller), `md` 24px, `lg`
   * 32px.
   *
   * @default 'md'
   */
  size?: VariantProps<typeof logoVariants>['size'];
  /**
   * The accessible name. The logo is `role="img"` with this name. Pass `""`
   * only when the name is already beside it in text; the logo is then hidden
   * from screen readers.
   *
   * @default 'Instacart'
   */
  title?: string;
}

/**
 * Logo: the Instacart wordmark or the carrot mark, drawn from the official
 * artwork in the brand colours.
 *
 * **When to use:** wherever the Instacart brand itself appears: the site
 * header, a footer, a "Shop on Instacart" partner moment, a sign-in screen.
 *
 * **When not to use:**
 * - A retailer or store logo ("Sprouts Farmers Market"): use `Avatar` with
 *   the store's image.
 * - A carrot as a produce or category icon: use `Icon` with Phosphor's
 *   `Carrot`. The logo is the brand, not a picture of food.
 *
 * **Brand rules (brand/brand.md, Logo):**
 * - Use the full-colour logo (`tone="color"` or `"cashew"`) only on white,
 *   Cashew, Kale, photos or video. On any other flat colour, use
 *   `tone="white"` or move the logo.
 * - Never smaller than 20px tall (`size="sm"`).
 * - Do not recolour, stretch, rotate, crop, or add shadows or gradients.
 *   Give it clear space about equal to its height.
 *
 * @example
 * <header className="bg-surface">
 *   <Logo />
 * </header>
 *
 * <div className="bg-surface-brand">
 *   <Logo tone="cashew" size="lg" />
 * </div>
 */
export const Logo = React.forwardRef<SVGSVGElement, LogoProps>(function Logo(
  { className, variant = 'full', tone = 'color', size, title = 'Instacart', ...props },
  ref,
) {
  const titleId = React.useId();
  const art = variant === 'mark' ? MARK : WORDMARK;
  const fill = FILL[tone];
  const named = title !== '';
  return (
    <svg
      ref={ref}
      data-slot="logo"
      data-variant={variant}
      data-tone={tone}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={art.viewBox}
      {...(named
        ? ({ role: 'img', 'aria-labelledby': titleId } as const)
        : ({ 'aria-hidden': true } as const))}
      focusable="false"
      className={cn(logoVariants({ size }), className)}
      {...props}
    >
      {named && (
        <title id={titleId} data-slot="logo-title">
          {title}
        </title>
      )}
      <path data-slot="logo-leaves" className={fill.leaves} d={art.leaves} />
      <path data-slot="logo-root" className={fill.root} d={art.root} />
      {variant === 'full' &&
        WORDMARK.letters.map((d) => <path key={d} data-slot="logo-letter" className={fill.letters} d={d} />)}
    </svg>
  );
});
Logo.displayName = 'Logo';
