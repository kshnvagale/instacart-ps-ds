# Handoff app (slide 25)

A small Vite + React app that shows the last step of the workflow: a grocery screen designed in Claude Design, rebuilt as working code with the **real** `instacart-ps-ds` components. The facilitator demos it; attendees watch.

It builds the screen from the workshop brief:

- a store header with the logo, the store name, the delivery fee and a search field (search filters the shelves);
- "Shop your favourites" and "Deals" rows of product tiles, with sale badges and old prices;
- Add to cart, which turns into a quantity control;
- one out-of-stock product (Strawberries), which can never enter the cart;
- a cart summary with line prices, "Substitution alerts" (a Switch: it applies at once), "Leave at door" (a Checkbox: it applies when you check out), the subtotal, service fee, delivery fee, total and a checkout button;
- the empty-cart state (remove every item to see it);
- a dark theme switch in the header.

Product data and images come from `workshop/assets/` (`products.json` and `products/*.png`).

## Run it

Build the design system first, from the repo root, because the app uses its `dist/` folder:

```bash
npm install
npm run build
```

Then, in this folder:

```bash
cd examples/handoff-app
npm install
npm run dev        # open the link it prints
npm run build      # type check + production build
```

`"instacart-ps-ds": "file:../.."` installs the package from this repo, as a link. After any change to the system, run `npm run build` at the repo root again; the app picks it up.

## What to point at in the demo

| Look at | Why |
|---|---|
| `import { Button, Price, ... } from 'instacart-ps-ds'` in `src/components/` | Each `x-import` tag in the canvas maps one to one to one of these imports. Developers do not rebuild the UI. |
| `src/components/ProductTile.tsx` | The product tile is composed from Badge, Price, Text and Button. The library has no ProductCard on purpose. |
| `src/components/QuantityControl.tsx` | A stand-in made of IconButton + Text, with a TODO. It is replaced by QuantityStepper in the extend exercise (slide 24). |
| `src/components/CartSummary.tsx` | Switch for an instant setting, Checkbox for a form choice, Price for every amount. |
| `src/app.css` | Page layout only, written with the system's tokens (CSS variables). No component styling. |
| `npm run build` | The type check passes against the package's real types. |

## Notes

- The app imports `instacart-ps-ds/standalone.css`, the pre-compiled stylesheet. It holds only the classes the components use, so the page layout is in `src/app.css`. An app that runs Tailwind itself can import `instacart-ps-ds/styles.css` instead and copy the canvas's utility classes across as they are.
- The font is loaded with `@fontsource-variable/dm-sans` in `src/main.tsx`.
- `vite.config.ts` dedupes React, because the linked package folder has its own copy of React in its `node_modules`. `tsconfig.json` maps the React types to this app's copy for the same reason.
- Unofficial, for teaching only. This is not Instacart's own code or design system.
