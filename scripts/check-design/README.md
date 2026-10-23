# check-design

Checks whether a design follows the Instacart design system (`instacart-ps-ds`), so developers can ship it as-is. A design can be a Claude Design canvas, an HTML export, or code made from one.

```bash
npm run check:design -- path/to/design.tsx            # deterministic rules
npm run check:design -- path/to/designs/ --jev        # + Jev semantic rules
npm run check:design -- design.tsx --jev --json       # machine-readable
npm run check:design:calibrate                        # score the rules
```

Exit codes: `0` clean (warnings allowed), `1` errors, `2` bad usage or a Jev transport failure. A design can read components from `window.Instacart` (the Claude Design shape) or import them from `instacart-ps-ds`.

**Claude Design canvas artboards** (`project/<name>.dc.html`, any HTML file containing `<x-dc>`) are the main format. An artboard mounts real components as `<x-import component-from-global-scope="Instacart.Button" variant="secondary">Cancel</x-import>`, with kebab-case props and `{{hole}}` values. The checker converts the artboard line for line into the same TSX, so every rule applies, the prop type check too. Findings point at the artboard's own lines.

- The converter copies the real canvas runtime. It does **not** change `class` into `className` on an `x-import`, because the runtime does not. That is exactly the bug `component-class` must catch.
- Handlers are `{{hole}}` values defined in the artboard's `renderVals()` script. The checker finds each definition, so Jev can see what a handler does.
- `fixtures/format-examples/` holds two real SSX canvas exports. They show the format and are not scored.

**From a link:** in Claude Code, run `/check-design <artifact link>` (the project skill in `.claude/skills/check-design/`). Claude downloads the canvas with your claude.ai login, runs the checker, and explains the result. A plain script cannot fetch a canvas, because it is private to your account.

**From a folder:** point the checker at a downloaded canvas (the folder that holds `project/canvas.json`). It checks every artboard the index lists, in order, and skips the design system's copy under `project/ds/`.

**Other HTML exports** (`.html`) are read in one of two ways:

- **The design's JSX is in a `<script>`.** The checker takes it out and checks it like a `.tsx` file. Line numbers stay the same.
- **Plain rendered HTML.** Every Instacart atom puts `data-slot` on what it renders. So `<button data-slot="button">` is our Button, and a `<button>` with no slot was made by hand.
  - Classes, styles and raw elements are checked only outside components. Inside a component, everything is the component's own output. Radix's hidden form copies (`aria-hidden` plus `tabindex="-1"`) count as component output.
  - There are no props to type-check, so `html-no-props` says so.
  - Jev reads the markup with classes and styles removed. Plain HTML has no click handlers, so the Link rule judges `href="#"` plus an action label.

## Rules

Deterministic rules are **errors** and fail the check.

| Rule | Catches |
|---|---|
| `dead-class` | A class that compiles to nothing with the Instacart theme (`gap-7`, `p-7`, `max-w-md`, `bg-white`, `shadow-lg`). It uses the real Tailwind compiler with `src/styles/instacart.css`, not a list. Marker classes (`group`, `peer`) are allowed. |
| `arbitrary-value` | `text-[13px]`, `mt-[18px]` |
| `raw-color` | Hex, `rgb()` or `hsl()` in an attribute |
| `inline-style` | A fixed colour, spacing, size, radius, shadow or type value in `style` |
| `raw-element` | A hand-made element where an atom exists: `<button>` (Button / IconButton), `<a>` (Link), `<input>` (Input; Checkbox or Switch for a yes/no), `<h1>`–`<h6>` (Heading), an `<img>` of the logo (Logo). A raw `<input type="number">` gets its own message: use QuantityStepper. A child of an `asChild` parent is allowed. A product photo `<img>` is allowed. |
| `component-class` | `class` on a component. On a canvas `x-import` it replaces the component's own classes, so it renders unstyled. Write `class-name`. |
| `interactive-badge` | A `Badge` with a click, key or link handler |
| `missing-slot` | Rendered HTML only: an element outside every component that carries an atom's recipe classes but no `data-slot`. It is either a hand-made copy of the atom or an atom that lost its `data-slot`. |
| `prop-type` | A variant, size or tone that does not exist, a missing required prop (an IconButton's `aria-label`, a Heading's `as`), a lowercase prop (`autocomplete`), or a wrong handler type. It type-checks against `dist/index.d.ts` (run `npm run build` first). |

These are **warnings**:

| Rule | Catches |
|---|---|
| `inline-layout` | A layout property in `style` (`display`, `position`, `grid-template-columns`). It silently overrides the element's classes. A canvas's visual editor writes these. |
| `not-in-design-css` | A valid class that is missing from the Claude Design stylesheet (`ds.css`), so it renders unstyled there |
| `primary-count` | More than one primary Button in a file |
| `brand-theme` | No `data-theme` on the page |
| `html-no-props` | Plain rendered HTML, so there are no props to check |

`--jev` adds semantic rules, judged by TypeSafe's Jev. They are **warnings** and never change the exit code. Code finds each candidate usage, and Jev answers one yes/no question per usage. Each rule's text comes from the component's TSDoc header (`src/components/<Name>/<Name>.tsx`); keep the two in step. Jev never judges colours, numbers or counts, because those are its weak spots. It never reads code comments either.

| Rule | Catches |
|---|---|
| `link-writes-data` | A Link that adds to cart, places or cancels an order, saves, deletes or signs out, instead of going somewhere |
| `badge-interactive` | A Badge shown as something to click, remove or filter by |
| `checkbox-instant` | A Checkbox whose change saves at once ("Substitution alerts"). That is a Switch. |
| `text-as-heading` | Bold or strong Text that titles a section. That is a Heading. |
| `vague-label` | Button labels such as OK, Yes, Confirm, Submit or Click here |
| `price-as-text` | A price ("$3.99", "$0.42/oz") written as Text or a plain element instead of Price. Money inside a sentence ("$0 delivery fees on your first 3 orders") is copy and stays Text. |
| `quantity-raw-input` | An item quantity set with a number field, or with a hand-made −/+ pair of buttons, where QuantityStepper belongs. |

Jev flags at `noul ≥ 0.8`. With `--verbose`, the unsure calls (0.5–0.8) are listed too. The API key comes from `$TYPESAFE_API_KEY` or `~/.config/typesafe.env` and is never printed.

## Calibration

`calibrate.mjs` scores every rule on two sets:

- **`fixtures/*.tsx`, `*.html` and `*.dc.html`** (top level only):
  - `bad-cart.tsx`: a cart screen with every deterministic rule and every Jev rule planted.
  - `bad-canvas-cart.dc.html`: a canvas artboard in the real format with the common canvas mistakes (`class` on an `x-import`, lowercase `autocomplete`, `gap-7`, inline style, a raw number field, a price as Text, a Checkbox that saves, an "OK" button).
  - `good-apply.tsx` and `good-apply.rendered.html` (the same screen, rendered with the real components): correct usage, some of it close to a rule's edge. They must stay quiet.
  - Each planted mistake has an `expect: rule` comment on the line before it. Any finding without one is a false positive.
- **The 14 atoms' stories:** correct usage by definition, so any Jev flag on them is a false positive.

Add a fixture case whenever a rule misfires on a real design. Before a Jev rule moves from warning to error, it needs 100% recall on the fixtures, no false positives on either set, and more cases than it has today.
