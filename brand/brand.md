# Instacart brand values

Phase 1 output for `instacart-ds`. Every value below has a source. Nothing here is a token yet: the user approves this page first (see `docs/PLAN.md`, Phase 1).

`instacart-ds` is an unofficial teaching system that copies Instacart's look for a workshop. It is not made or approved by Instacart.

**Date checked for every row: 2026-10-23.**

## How each value was read

| Label | Meaning |
|---|---|
| **published** | Written down by Instacart in a guide or doc page (text or a swatch label). |
| **published (image)** | Printed in an image on an Instacart guide page. We read the label, then sampled the image's pixels to confirm the hex. |
| **measured** | Read with Playwright from the computed styles of the live site. Pages measured: `https://www.instacart.com/` (home), `https://www.instacart.com/categories/316-food/317-fresh-produce` (aisle), `https://www.instacart.com/store/products/3259496-lemon-each` (product). Logged out, US, desktop 1440 px wide. |
| **measured (token)** | A CSS custom property (`--ids-*`, Instacart's own design-system tokens) that the live site ships in its stylesheets. This is the most reliable kind of measured value. |
| **computed** | Worked out by us (for example, a contrast ratio or a darker step). Not an Instacart value. |
| **Brandfetch** | Not used. The Brandfetch API returned `quota_exceeded` (108 of 100 calls used). The raw reply is in the scratchpad, not the repo. |

Main sources:

- Instacart Brand Guide: `https://heyitsinstacart.com/` (linked from the press page as "View Brand Guidelines"). Pages used: `/color`, `/typography`, `/logo`, `/carrot`, `/brandelement`. The site is public but shows a "Login" link, so some sections may be hidden.
- Instacart Media Hub: `https://company.instacart.com/press`
- Instacart Developer Platform design docs: `https://docs.instacart.com/developer_platform_api/guide/concepts/design/overview`, plus `.../design/cta_design` and `.../design/logos`
- Live site: the three pages listed above.

---

## Logo

| Value | Source URL | How read | Date |
|---|---|---|---|
| Official logo kit (zip): full logo in Kale, Cashew and All White, the Carrot mark in colour and white, plus Instacart+ versions, as SVG, PNG, CMYK and PMS | https://docs.instacart.com/assets/files/Instacart_logos-57199d80485c89007384e11523992fe8.zip (linked from https://docs.instacart.com/developer_platform_api/guide/concepts/design/logos) | published | 2026-10-23 |
| Logo colours inside the SVGs: Carrot `#FF7009`, Lime `#0AAD0A`, wordmark Kale `#003D29` (dark version) or Cashew `#FAF1E5` (light version) | same zip, `fill` values in the SVG files | published | 2026-10-23 |
| "Our full-color dark logo is the primary expression of the Instacart brand. It should be used wherever possible." | https://heyitsinstacart.com/logo | published | 2026-10-23 |
| Versions: Full Color Dark, Full Color Light, Single Color Kale, Single Color White ("NOT CASHEW") | https://heyitsinstacart.com/logo | published | 2026-10-23 |
| Backgrounds: the full-colour logo is approved on Cashew, Kale, photos and video only. "Do not place logo on flat colored backgrounds other than Cashew and Kale." | https://heyitsinstacart.com/color | published | 2026-10-23 |
| Minimum size: **20 px height** ("Small, 20px Height Min."). Large is above 80 px height. | https://heyitsinstacart.com/logo | published | 2026-10-23 |
| Clear space: "based on the height of the logo". The exact multiple is shown only in a picture we did not read. | https://heyitsinstacart.com/logo | TODO: read the clear-space picture, or use "clear space = logo height" as the closest guess | 2026-10-23 |
| Misuse rules: no shadows or overlays, no angles, no gradients or textures, no mixed colours, no single-colour logo in non-brand colours. Carrot: no new colour pairs other than Carrot and Lime, no changes to its proportions, no crops so tight it can't be recognised. | https://heyitsinstacart.com/logo, https://heyitsinstacart.com/carrot | published | 2026-10-23 |
| Licence: the zip is offered to Developer Platform partners for CTAs ("you should use the most recent Instacart logos"). No general licence is stated. The user has decided the logo may be committed to this private repo. | https://docs.instacart.com/developer_platform_api/guide/concepts/design/logos | published | 2026-10-23 |

### Logo files saved in `brand/logos/`

All files come from the official zip above. Each SVG was checked: it holds only `path`, `polygon`, `g` and `style` elements, with no scripts, links or embedded images.

| File | What it is | Path inside the zip |
|---|---|---|
| `Instacart_Logo_Kale.svg` | Full Color Dark wordmark (Kale text, colour carrot). Use on light backgrounds. | `Full Logo/RGB/SVG/` |
| `Instacart_Logo_Kale.png` | The same, 1439 × 227 PNG fallback | `Full Logo/RGB/PNG/` |
| `Instacart_Logo_Cashew.svg` | Full Color Light wordmark (Cashew text, colour carrot). Use on Kale or dark backgrounds. | `Full Logo/RGB/SVG/` |
| `Instacart_Logo_AllWhite.svg` | Single Color White wordmark | `Full Logo/RGB/SVG/` |
| `Instacart_Carrot.svg` | Carrot mark, full colour | `Logos - Carrot/RGB/SVG/` |
| `Instacart_Carrot_White.png` | Carrot mark, white, 792 × 1000 PNG. The zip has no white carrot SVG. | `Logos - Carrot/RGB/AI/` |

Not in the kit: a **Single Color Kale** wordmark or carrot. TODO: if we need one, recolour the white SVG to `#003D29` and record that we made it.

---

## Brand colours

From the Color page of the brand guide. Hex and RGB come from the swatch labels. We sampled each swatch's pixels, and every one matched its label exactly.

Source for every row: https://heyitsinstacart.com/color (the swatch image on that page). How read: **published (image)**. Date: 2026-10-23.

| Group | Name | Hex | Pantone | Role (from the guide) |
|---|---|---|---|---|
| Primary | **Kale** | `#003D29` | 3435 C | Main dark brand colour. Logo text, hero bands, dark CTA. |
| Primary | **Cashew** | `#FAF1E5` | 9224 C | Main light brand colour. Light surfaces, light CTA. |
| Primary (spot) | **Lime** | `#0AAD0A` | 2421 C | Brand green. "Spot color". Logo leaves. The guide shows it as a button fill ("Start shopping"). |
| Primary (spot) | **Carrot** | `#FF7009` | 1505 C | Brand orange. "Spot color". Logo carrot. |
| Primary | Honeydew | `#C5FF96` | 2282 U | |
| Primary | Cantaloupe | `#FFBB6E` | 721 C | |
| Primary | Spinach | `#3A682F` | 364 C | |
| Secondary | Matcha | `#85CC3E` | 368 C | |
| Secondary | Granny Smith | `#DBEF77` | 373 C | |
| Secondary | Butter | `#F9FB93` | 600 C | |
| Secondary | Mushroom | `#EDC9A2` | 468 C | |
| Secondary | Tangerine | `#FFA323` | 1375 C | |
| Exclusive | Banana | `#FFE200` | 109 C | "used for affordability-focused moments such as deals, savings, and price drops" |
| Exclusive | Watermelon | `#FF8E67` | 1625 C | seasonal only |
| Exclusive | Mint | `#C6F0CB` | 621 C | seasonal only |
| Neutral | Dark Chocolate | `#442202` | | |
| Neutral | Cashew 80 | `#32302E` | | |
| Neutral | Cashew 60 | `#716C67` | | |
| Neutral | Cashew 30 | `#E1D9CE` | | |
| Neutral | Cashew 20 | `#EFE1CF` | | |
| Neutral | Cashew 10 | `#FAF1E5` | | (same as Cashew) |
| Neutral | Cashew 050 | `#FDF8F2` | | |
| Neutral | Cashew 025 | `#FEFBF9` | | |
| Neutral | Cashew 00 | `#FFFFFF` | | |

Colour rules quoted from the same page:

- "Avoid using Carrot or Lime as background colors or for body copy. These are spot colors intended to add emphasis and energy, not serve as primary reading colors."
- "Spot colors should be used sparingly … and should never become the dominant color in a layout."
- "Do not use as CTA button" (about the neutral palette). "Do not use Dark neutral as UI background." "Do not create undefined tints or shades."
- "Avoid using color pairings for text that do not meet at least WCAG AA contrast requirements."

The Developer Platform CTA rules confirm the same core colours (https://docs.instacart.com/developer_platform_api/guide/concepts/design/cta_design, **published**):

| CTA variant | Background | Text | Stroke |
|---|---|---|---|
| Dark | `#003D29` | `#FAF1E5` | none |
| Light | `#FAF1E5` | `#003D29` | `#EFE9E1`, 0.5 px |
| White | `#FFFFFF` | `#000000` | `#E8E9EB`, 0.5 px |

The CTA is 46 px tall with 16 px vertical and 18 px horizontal padding and a 22 px logo, and must be "round". Its labels are "Shop ingredients" or "Shop on Instacart".

---

## UI colours (web app)

The live site ships Instacart's design-system tokens as CSS custom properties (`--ids-color-*`). These are the colours the product UI is built on, and they differ from the marketing palette: the UI green is a darker Lime, and the UI greys are cool, not the warm Cashew greys.

Source for every row: https://www.instacart.com/ (the same 62 tokens appear on the aisle page too). How read: **measured (token)**, unless the row says otherwise. Date: 2026-10-23.

### Brand tokens

| Token (`--ids-color-…`) | Hex | Seen in use |
|---|---|---|
| `brand-primary-extra-light` | `#F6FDF6` | |
| `brand-primary-light` | `#E9FBE9` | |
| `brand-primary-regular` | `#108910` | "Sign up", "Add to cart" and "Add" buttons (white text), green text such as "Delivery by 7:30am", green icons |
| `brand-primary-dark` | `#0D720D` | (hover, likely) |
| `brand-primary-extra-dark` | `#0A610A` | (pressed, likely) |
| `brand-secondary-light` | `#EDF7F4` | |
| `brand-secondary-regular` | `#003D29` | Kale. Hero band and the top promo banner. |
| `brand-secondary-dark` | `#003121` | |
| `brand-secondary-extra-dark` | `#001810` | |
| `brand-tertiary-light` | `#F7F5F0` | header background on the home page |
| `brand-tertiary-regular` | `#FAF1E5` | Cashew |
| `brand-tertiary-dark` | `#EFE9E1` | |
| `brand-max-light` | `#FFDC23` | yellow highlight behind deal text and sale prices ("No markups", "$15 off on $115+", "$0.24") |
| `brand-max-dark` | `#242529` | |
| `brand-plus-regular` (and light/dark) | `#750046` (`#FFD7E8`, `#B00074`, `#5E0038`, `#46002A`) | Instacart+ only. Not needed here. |

### Greys

| Token | Hex | Seen in use (measured) |
|---|---|---|
| `system-grayscale-00` | `#FFFFFF` | page and card background |
| `system-grayscale-10` | `#F6F7F8` | quiet fills: search field, quantity field, filter chips on the aisle page |
| `system-grayscale-20` | `#E8E9EB` | secondary button fill ("Show all", "View more"), chips, card borders (1 px) |
| `system-grayscale-30` | `#C7C8CD` | outline button border ("Log in"), search field border, disabled icon |
| `system-grayscale-40` | `#8F939B` | |
| `system-grayscale-50` | `#72767E` | secondary text (aisle page) |
| `system-grayscale-60` | `#56595E` | secondary text (product page) |
| `system-grayscale-70` | `#343538` | **main body text** (the most common text colour on all three pages) |
| `system-grayscale-80` | `#242529` | headings, button text on grey, the dark "All" chip |
| `system-grayscale-90` | `#191A1C` | |
| `system-grayscale-99` | `#0B0C0D` | |

Other measured UI values:

| Value | Where | How read |
|---|---|---|
| Hairline border `1px rgba(0,0,0,0.12)` (token `--ids-opacity-border: 0.12`) | header and dividers on home and product | measured |
| Opacity tokens: light `0.08`, border `0.12`, regular `0.16`, dark `0.24` | home | measured (token) |
| Links: no underline, coloured `#343538` like body text. The few blue links (`#0000EE`) are browser defaults on unstyled elements, not a brand choice. | home, product | measured |

### Status colours

| Token | Hex | How read |
|---|---|---|
| `system-feedback-success-regular` | `#108910` (same as the brand green) | measured (token) |
| `system-feedback-success-light` / `dark` / `extra-dark` | `#E9FBE9` / `#0D720D` / `#0A610A` | measured (token) |
| `system-feedback-alert-regular` (warning) | `#FFA500` | measured (token) |
| `system-feedback-alert-light` | `#FFBE1D` | measured (token) |
| `system-feedback-detrimental-regular` (danger) | `#DE3534` | measured (token) |
| `system-feedback-detrimental-light` / `dark` / `extra-dark` | `#FEF0F0` / `#BB1C1B` / `#AC1615` | measured (token) |
| **Info** | **TODO.** Instacart ships no info token. The only blue we measured (`#0070DC`) is Walmart's store tile, not Instacart's. Closest candidates: (a) use Kale `#003D29` and `brand-secondary-light` `#EDF7F4` as the "info" pair, which stays on brand; or (b) add one blue of our own and mark it as not from Instacart. Ask the user. | — |

### Dark mode

**TODO.** instacart.com has no dark theme that we could find, and the brand guide says "Do not use Dark neutral as UI background". Our system still needs dark mode (a decision already made). Closest candidates: the IDS greys `#0B0C0D` / `#191A1C` / `#242529` for dark surfaces, and Lime `#0AAD0A` for the dark-mode action colour (it passes on those greys; see Contrast). We must design dark mode ourselves and say so in the docs.

---

## Typeface

| Value | Source URL | How read | Date |
|---|---|---|---|
| Brand family **Instacart Sans**, with styles Instacart Sans Headline, Sub and Text, plus **Instacart Contrast** (a display face for headlines) | https://heyitsinstacart.com/typography (and the font list in the page source of https://heyitsinstacart.com/) | published | 2026-10-23 |
| UI font stack: `"Instacart Sans", "Instacart Sans Fallback", Arial, sans-serif`. It is a variable font, weights 400–800. The file is served from Instacart's CDN, and no licence is offered. | https://www.instacart.com/ | measured | 2026-10-23 |
| Weights used in the UI: **400** (body) and **600** (labels, buttons, chips, titles). **700** appears on a few large headings. | home, aisle, product | measured | 2026-10-23 |
| Common sizes: 14 px (body and labels, by far the most common), 16 px (buttons, inputs), 17 px / 600 (card titles), 20, 23, 24, 26 and 28 px (section headings), 44 px / 700 (aisle page H1) | home, aisle, product | measured | 2026-10-23 |
| Type scale rule: title size X, subtitle X/2, body and annotations X/3 or smaller | https://heyitsinstacart.com/typography | published | 2026-10-23 |

**Instacart Sans is proprietary.** We can't ship it.

**Recommendation: DM Sans** (`@fontsource-variable/dm-sans`, SIL Open Font License, weights 100–1000).

To choose, we rendered the real Instacart Sans (loaded from the live site) next to eight open fonts at the same size, using a real headline and real UI labels. That screenshot is in the scratchpad (path below).

| Candidate | One-line verdict |
|---|---|
| **DM Sans** | Closest: similar width, round geometric "o", "e" and "c", a single-storey "g" and a plain "y", and it stays tidy at 14 px. **Recommended.** |
| Plus Jakarta Sans | Close in letter shapes, but narrower and a little more "tech". Second choice. |
| Inter | Very readable, but more neutral and grotesque. It loses the friendly roundness. |
| Figtree | Friendly, but narrower and lighter at the same weight. |
| Outfit | Too geometric and condensed. Its labels look cramped. |
| Manrope, Onest, Instrument Sans | Each is noticeably narrower, or squarer, than Instacart Sans. |

This is a recommendation. **The user should confirm it** (it is an open point in `docs/BRAND-RESEARCH.md`).

---

## Shape

All rows: **measured** on the three live pages, unless the row says otherwise. Date: 2026-10-23.

| Item | Value | Source |
|---|---|---|
| Radius tokens | `--ids-system-radius-0/4/8/12/24` = 0, 4, 8, 12, 24 px | home (measured token) |
| Spacing tokens | `--ids-system-space-4/8/12/16/24/32/40/48` | home (measured token) |
| Buttons | **Fully round (pill)**: the radius is half the height. 36 px tall → 20 px radius ("Add"). 40 px → 20 px ("Log in", "Sign up", "Show all"). 48 px → 24 px ("Log in" on the product page). 56 px → 28 px ("Add to cart", "Sign up to get $0 delivery fee*", "View more"). Primary: `#108910` fill, white text. Secondary: `#E8E9EB` fill, `#242529` text. Outline: white fill, 1 px `#C7C8CD` border. | home, aisle, product |
| Chips / filter pills | 32 px tall, `999px` radius, 600 / 14 px. Selected: `#242529` fill, white text. Unselected: `#E8E9EB` fill. | home |
| Inputs | Home search: 56 px tall, 28 px radius (pill), 1 px `#C7C8CD` border. Aisle and product search: 40–56 px tall, **8 px radius**, `#F6F7F8` fill, no border. | home, aisle, product |
| Quantity field | 56 px tall, 12 px radius, `#F6F7F8` fill | product |
| Cards | **12 px radius** (store and offer cards, product tiles), 1 px `#E8E9EB` border, white fill. Home store cards use 8 px. | aisle, product, home |
| Retailer logo tiles | 8–12 px radius, 1 px `rgba(0,0,0,0.12)` border | home |
| Shadows (used sparingly; borders do most of the work) | Card or raised: `0 1px 8px rgba(0,0,0,0.08)` (the most common). Popover: `0 2px 12px rgba(0,0,0,0.10)`. Larger overlay: `0 0 16px rgba(0,0,0,0.16)`. Pressed field: `inset 0 2px 4px rgba(0,0,0,0.05)`. | product, aisle, home |
| Motion easing | smooth `cubic-bezier(0,0,0,1)`, elevated `cubic-bezier(0,1.25,0.6,1)`, bounce `cubic-bezier(0,1.7,0.4,0.9)` | home (measured token) |
| CTA shape | "round", 46 px tall | https://docs.instacart.com/developer_platform_api/guide/concepts/design/cta_design (published) |

---

## Iconography

| Value | Source URL | How read | Date |
|---|---|---|---|
| UI icons: 24 × 24 viewBox, a single filled path each, drawn to look like a **rounded outline of about 1.5–2 px**. Coloured `#343538` (or `#108910` for delivery and status icons). 16 px versions sit beside delivery text. Examples: Home, EBT, Offers, Grocery and Account in the side nav. | https://www.instacart.com/store/products/3259496-lemon-each, https://www.instacart.com/ | measured | 2026-10-23 |
| Brand "Quality Icons": **chunky, filled, rounded** shapes in Lime on Cashew (a stack, pointer, pencil, arrows, sparkle, storefront, check) | https://heyitsinstacart.com/color (Spot Colors usage image) | published (image) | 2026-10-23 |
| The brand guide has an "Iconography" section, but we could not open it (it may need a login) | https://heyitsinstacart.com/ (nav) | TODO | 2026-10-23 |

**Phosphor decision:** Phosphor is a close match.

- Use **Phosphor Regular** (1.5 px stroke at 24 px, rounded joins) for UI icons. It matches the side-nav and header icons.
- Use **Phosphor Fill** only for small brand or emphasis moments (such as a check on a success state), which matches the chunky "Quality Icons".
- Avoid Bold for UI. It reads heavier than Instacart's nav icons.

---

## Voice

Real UI strings, copied from the live site and the docs. Case and punctuation are kept as shown. Date: 2026-10-23.

| # | String | Where | Source URL |
|---|---|---|---|
| 1 | Add to cart | product page, primary button | https://www.instacart.com/store/products/3259496-lemon-each |
| 2 | Add | product tile button | same |
| 3 | Order groceries for delivery or pickup today | home H1 | https://www.instacart.com/ |
| 4 | Sign up to get $0 delivery fee* | home hero button | same |
| 5 | \*Service and other fees apply. 3 orders in 14 days. Excludes restaurants. | home, small print | same |
| 6 | $0 delivery fees on your first 3 orders | product page, top banner | https://www.instacart.com/store/products/3259496-lemon-each |
| 7 | Search products, stores, and recipes | product page, search placeholder | same |
| 8 | Delivery by 7:30am | store card | https://www.instacart.com/ |
| 9 | Pickup available | store card | same |
| 10 | No markups | yellow deal tag | same |
| 11 | Lots of deals | store tag | same |
| 12 | Many in stock | product tile, stock status | https://www.instacart.com/store/products/3259496-lemon-each |
| 13 | Available at 35 stores from $0.39 | product page | same |
| 14 | Browse Sprouts Farmers Market | product page, secondary button | same |
| 15 | Often Bought With | product page, section heading | same |
| 16 | Items to add next | product page, section heading | same |
| 17 | View more / Show all / Show more | secondary buttons | aisle, home, product |
| 18 | Offers subject to terms and eligibility | home, small print | https://www.instacart.com/ |
| 19 | What happens if something is out of stock and I need to give specific instructions? | home FAQ | same |
| 20 | Start shopping | brand guide, example UI button | https://heyitsinstacart.com/color |
| 21 | Shop ingredients / Shop on Instacart | partner CTA labels | https://docs.instacart.com/developer_platform_api/guide/concepts/design/cta_design |

What the strings show about the tone:

- Short, plain verbs that say exactly what happens: "Add to cart", "Add", "Start shopping", "Browse Sprouts Farmers Market". There are no vague labels like "Submit" or "OK".
- Sentence case everywhere, except some section headings ("Often Bought With").
- Concrete facts beat adjectives: "Delivery by 7:30am", "Available at 35 stores from $0.39", "3 orders in 14 days".
- Fine print is honest and short ("Service and other fees apply.").
- The brand guide calls this "Care as Voice. Type that balances trust with a touch of delight." (https://heyitsinstacart.com/brandelement, published).

Not found while logged out: checkout strings such as "Leave at door", "Checkout" and "Substitution alerts". **TODO:** these come from the logged-in checkout flow. Keep the ones in `docs/PLAN.md` as our own wording, or capture them from a logged-in session.

---

## Contrast (WCAG 2.x, **computed**)

Thresholds: 4.5:1 for normal text, 3:1 for large text (24 px, or 18.66 px bold) and for UI shapes.

| Foreground | Background | Ratio | Result |
|---|---|---|---|
| Lime `#0AAD0A` | white | **3.00** | **Fails as text.** Large text and icons only. |
| white | Lime `#0AAD0A` | 3.00 | Fails for normal button text. The brand guide's "Start shopping" button only works as large text. |
| Lime `#0AAD0A` | Cashew `#FAF1E5` | 2.68 | Fails |
| Lime `#0AAD0A` | `#242529` | 5.10 | Passes |
| Lime `#0AAD0A` | `#191A1C` | 5.80 | Passes |
| Lime `#0AAD0A` | `#0B0C0D` | 6.52 | Passes |
| Lime `#0AAD0A` | Kale `#003D29` | 4.12 | Large text only |
| **UI green `#108910`** | white | **4.56** | **Passes (just).** This is Instacart's own text and button green. |
| white | `#108910` | 4.56 | Passes. White button text is fine. |
| `#108910` | `#F6F7F8` | 4.25 | Fails as text on the grey fill |
| `#108910` | `#E9FBE9` (green light) | 4.22 | Fails as text. Use `#0D720D` (5.67). |
| `#0D720D` | white | 6.12 | Passes |
| Carrot `#FF7009` | white | **2.77** | **Fails as text** |
| Carrot `#FF7009` | Cashew | 2.48 | Fails |
| Carrot `#FF7009` | `#242529` | 5.52 | Passes |
| Carrot `#FF7009` | `#0B0C0D` | 7.06 | Passes |
| Carrot `#FF7009` | Kale | 4.46 | Large text only |
| Kale `#003D29` | white | 12.36 | Passes |
| Kale `#003D29` | Cashew | 11.05 | Passes |
| `#343538` (body text) | white | 12.26 | Passes |
| `#72767E` (secondary text) | white | 4.56 | Passes (just) |
| `#8F939B` | white | 3.08 | Fails as text. Use it for icons and placeholders only. |
| Danger `#DE3534` | white | 4.50 | Passes (just) |
| Danger dark `#BB1C1B` | white | 6.37 | Passes |
| Warning `#FFA500` | white | 1.97 | Fails. Use it as a fill only, with `#242529` text on it (7.75). |
| `#242529` | deal yellow `#FFDC23` | 11.31 | Passes |

**Answer: the brand green (Lime `#0AAD0A`) does not pass 4.5:1 as text on white.** For text and for buttons with white text, use **`#108910`** (4.56:1). That is Instacart's own `brand-primary-regular` token, so we don't need to invent a step. It is very close to the computed minimum (Lime darkened just to 4.5:1 is `#088A08`). Keep Lime for fills, the logo, large text and dark mode.

Carrot needs about **`#C25507`** (computed, 4.57:1) to work as text on white. Instacart ships no darker carrot token, and the guide says Carrot is never for body copy, so we should not use orange as a text colour at all.

---

## Reference screens

Screenshots are for the team only. They stay in the scratchpad, not in this repo (they show retailer logos and Instacart's pages).

| Screen | Page | Status |
|---|---|---|
| Store home (logged-out home) | https://www.instacart.com/ | captured |
| Aisle | https://www.instacart.com/categories/316-food/317-fresh-produce | captured |
| Product | https://www.instacart.com/store/products/3259496-lemon-each | captured |
| Cart, checkout | — | **TODO:** needs a logged-in session with an address. Not captured. |
| Brand guide: colour page, palette chart, accessible pairings | https://heyitsinstacart.com/color | captured |

---

## Proposed palette for tokens

This is ready for Phase 2 ramps, once the user approves it. Each anchor below should sit exactly on a ramp step.

| Role | Hex | Source | Notes |
|---|---|---|---|
| **Brand green, fill** (Lime) | `#0AAD0A` | brand guide /color (published) | Logo, large accents, dark-mode action |
| **Brand green, action and text** | `#108910` | `--ids-color-brand-primary-regular` (measured token) | `action.primary` in light mode. 4.56:1 with white. |
| Green hover / pressed | `#0D720D` / `#0A610A` | IDS primary dark / extra-dark (measured token) | |
| Green tints | `#E9FBE9` / `#F6FDF6` | IDS primary light / extra-light (measured token) | Success background |
| **Kale** (deep green) | `#003D29` | brand guide (published) and IDS secondary-regular | Hero bands, dark CTA, strong headings |
| **Carrot orange** | `#FF7009` | brand guide (published) | Spot colour only: logo and small highlights. Never text on light backgrounds. |
| **Cashew** (warm surface) | `#FAF1E5` | brand guide (published) and IDS tertiary-regular | Brand surfaces. `#F7F5F0` for the header band. |
| **Neutral base** (UI greys) | `#FFFFFF`, `#F6F7F8`, `#E8E9EB`, `#C7C8CD`, `#8F939B`, `#72767E`, `#56595E`, `#343538`, `#242529`, `#191A1C`, `#0B0C0D` | `--ids-color-system-grayscale-00…99` (measured token) | The cool greys the web app uses. Body text `#343538`, headings `#242529`. |
| Deal / sale highlight | `#FFDC23` | `--ids-color-brand-max-light` (measured token) | Sale-price and deal-tag background, with `#242529` text. (Brand-guide Banana is `#FFE200`.) |
| **Success** | `#108910` (light `#E9FBE9`) | IDS feedback-success (measured token) | Same as the brand green |
| **Warning** | `#FFA500` (light `#FFBE1D`) | IDS feedback-alert (measured token) | Fill only, with dark text |
| **Danger** | `#DE3534` (light `#FEF0F0`, dark `#BB1C1B`) | IDS feedback-detrimental (measured token) | Use `#BB1C1B` for small danger text for safety margin |
| **Info** | **TODO** | none from Instacart | Proposal: Kale `#003D29` on `#EDF7F4` (IDS secondary-light), or a new blue we mark as ours. Ask the user. |

## Open points for the user

1. **Typeface:** approve DM Sans as the Instacart Sans substitute (Plus Jakarta Sans is the second choice).
2. **Info colour:** use Kale-on-mint-tint, or add our own blue?
3. **Dark mode:** Instacart has none. Approve designing it ourselves on the IDS dark greys, with Lime as the dark action colour.
4. **Neutrals:** use the cool IDS greys for UI (what the web app does), and keep the warm Cashew greys for brand surfaces only. Confirm.
5. **Checkout strings and screens:** capture them from a logged-in session, or write our own?
6. **Brandfetch** returned "quota exceeded". Retry later if a second source is wanted. Every value here already comes from Instacart's own pages.

## Decisions (23 October 2026, made by the builder; the user asked for no more questions)

| Topic | Decision | Why |
|---|---|---|
| Typeface | **DM Sans**, self-hosted through `@fontsource-variable/dm-sans` | Closest open match to Instacart Sans in the side-by-side (width and round letters). Plus Jakarta Sans was second. |
| Action green | `#108910` for buttons, links and green text. `#0AAD0A` (Lime) only for decorative fills and the logo. | Lime is 3.00:1 on white, so it fails as text. `#108910` is Instacart's own action token and passes 4.56:1. |
| Info colour | A blue of our own, used only for the `info` status. Marked as **not an Instacart value**. | Instacart has none. Kale already means "brand", so using it for info would blur the two meanings. |
| Dark mode | The site's cool dark greys for surfaces, with Lime `#0AAD0A` (or a lighter step) as the action colour. Every pair must pass the contrast gate. | Instacart has no dark mode. Our system offers one, so every screen can be checked in both themes. |
| Greys | Cool greys for all UI. Cashew warm tones only for brand surfaces (banners). | Matches the live site. |
| Sale/deal | `#FFDC23` yellow fill with dark text, as measured on the site. | It's the real "deal" look. |
| Brandfetch | Not used. The key was over its quota (108 of 100 calls) on 23 October 2026. | All values come from the brand guide, the developer docs and the live site instead. |
