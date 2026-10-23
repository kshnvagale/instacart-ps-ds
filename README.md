# instacart-ps-ds

A small, **unofficial** Instacart design system, made for the Practice Shift workshop *"Your design system in Claude"*. It is for teaching only. It is not made or approved by Instacart, and the Instacart name and logos belong to Instacart.

The workshop shows one thing: **you can design outside Figma, in Claude Design, and your design system stays intact.**

What is in it: one brand (Instacart), light and dark themes, design tokens, 15 components (Button, IconButton, Link, Text, Heading, Badge, Price, Input, Checkbox, Switch, QuantityStepper, Avatar, Icon, Logo, Spinner) and a curated icon set, each icon exported as its own component (`ShoppingCartIcon`, `PlusIcon` and so on). Built with React 19, TypeScript, Tailwind v4, `cva`, Radix, Storybook 10 and Vitest.

## Use it in Claude Design

1. **Import:** in Claude, create a new design system → **Sync from GitHub** → `kshnvagale/instacart-ps-ds`. Claude Design imports the compiled components (with live previews), the colour tokens for light and dark, the type styles, the DM Sans fonts and the logos, and writes guides from `brand/brand.md` and `.design-sync/conventions.md`.
2. **Teach:** add the design skill. In Claude, **Settings → Capabilities → Skills → Upload skill**, pick `skills/instacart-design.zip`, and turn it on.
3. **Design:** start a new design with the imported system. The workshop brief is in `workshop/HANDOUT.md`.
4. **Check:** in Claude Code, inside a clone of this repo, run `/check-design <canvas link>`.
5. **Look:** at the screen yourself, in light and dark. Clean checks do not mean it looks right.
6. **Hand off:** each `x-import` tag in the canvas maps one to one to an import from this package. `examples/handoff-app` shows a screen rebuilt with the real components.

## Get started locally

You need Node 20 or newer, and Claude Code for the checks.

```bash
git clone https://github.com/kshnvagale/instacart-ps-ds.git
cd instacart-ps-ds
npm install
npm run storybook
```

## Commands

| Command | What it does |
|---|---|
| `npm run storybook` | Every component and icon, with its variants and states, at `http://localhost:6006`. |
| `npm test` | The unit tests. |
| `npm run build` | Builds the package into `dist/`. |
| `/check-design <canvas link>` | In Claude Code: downloads a Claude Design canvas and checks it against the system. |
| `npm run check:design <file>` | Checks a design file or a downloaded canvas folder against the system. |
| `npm run check:visual <canvas>` | Screenshots each artboard of a canvas, in light and dark, so you can see it. |
| `npm run build:guide` | Rebuilds the design skill's component guide and its zip. |
| `npm run check:rules` | Checks that the docs only name classes, components and props that exist. |

`CLAUDE.md` has the component conventions and the steps for adding a component.

## Where things are

- `src/components/`: the components. `src/icons/`: the icon set. `src/index.ts` exports both.
- `tokens/`: the design tokens. `npm run sync:tokens` builds the CSS from them.
- `skills/instacart-design/`: the design skill for Claude. Upload `skills/instacart-design.zip`.
- `.design-sync/`: the style reference (`conventions.md`) that Claude Design reads, and the optional `/design-sync` setup.
- `scripts/check-design/` and `scripts/visual-check/`: the checkers.
- `brand/`: the brand values, each with its source, and the logos.
- `examples/handoff-app/`: a small app built from the real components.
- `workshop/`: the handout and free-to-use product pictures.
