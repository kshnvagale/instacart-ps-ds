# CLAUDE.md

This repo is **`instacart-ps-ds`**: a small, unofficial Instacart design system, made for the Practice Shift workshop "Your design system in Claude". It is for teaching only. It is not made or approved by Instacart.

The workshop shows that you can design outside Figma, in Claude Design, and the design system stays intact. The system is complete: one brand (Instacart), two themes (light and dark), the foundations (tokens and utility classes), 15 components and a curated icon set. There are no molecules: larger parts, such as a product tile, are composed from the components.

Write everything the user reads in **simple English**.

## How it gets into Claude Design

- **Main path:** in Claude, new design system → **Sync from GitHub** → `kshnvagale/instacart-ps-ds`. It imports the compiled components, the colour tokens, the type styles, the fonts and the logos, and writes guides from `brand/brand.md` and `.design-sync/conventions.md`. So keep those two files correct: Claude Design reads them.
- **Optional:** `/design-sync` from Claude Code, with the setup in `.design-sync/` (see `.design-sync/NOTES.md`).
- **The design skill:** `skills/instacart-design/`, uploaded to Claude as `skills/instacart-design.zip`.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Installs everything. Needs Node 20 or newer. |
| `npm run storybook` | Opens Storybook at `http://localhost:6006`: every component and icon, its variants and states. |
| `npm test` | Runs the unit tests (Vitest). |
| `npm run typecheck` | Checks the TypeScript. |
| `npm run build` | Builds the package into `dist/`: tokens, JS, types and CSS. |
| `npm run sync:tokens` | Rebuilds `src/styles/tokens.generated.css` from `tokens/*.json`, and runs the contrast gate. |
| `npm run build:guide` | Rebuilds the component guide (`skills/instacart-design/guidelines/components.md`) from the components' TSDoc, and re-zips the skill. |
| `npm run check:rules` | Checks that every class, component and prop the docs name really exists. |
| `npm run check:design <file>` | Checks a design file (`.dc.html`, `.html`, `.tsx`, or a downloaded canvas folder) against the system. |
| `/check-design <canvas link>` | Downloads a Claude Design canvas from its link and runs the same check. |
| `npm run check:visual <canvas>` | Renders each artboard of a canvas to a screenshot, in light and dark, so you can see what it really looks like. |

Clean checks do not mean a design looks right. Look at the screenshot, and look at **light and dark**.

## Where things are

- `src/components/<Name>/`: one folder per component.
- `src/icons/`: the curated icon set. Each icon is its own export (`ShoppingCartIcon`, `PlusIcon` and so on).
- `src/index.ts`: the package entry. A component or icon exists only once it is exported here.
- `src/styles/`: the theme, base styles, fonts and the generated tokens.
- `tokens/`: the design tokens (DTCG JSON). Edit these, never `tokens.generated.css`.
- `.design-sync/`: `conventions.md` is the style reference the design agent reads first. `NOTES.md` has the optional `/design-sync` steps.
- `skills/instacart-design/`: the design skill (`SKILL.md` and the generated component guide).
- `scripts/`: the token build, the guide build, `check-design`, `visual-check` and `check-rule-names`.
- `brand/`: the Instacart brand values, each with its source, and the logos.
- `examples/handoff-app/`: a small app built from the real components (the handoff step).
- `workshop/`: the attendee handout, the facilitator notes and the product pictures.

## Component conventions

- **One folder per component**, named in PascalCase: `X.tsx`, `X.stories.tsx`, `X.test.tsx`, an `index.ts` barrel, and `_fixtures/` for story-only files such as images. Named exports only.
- **Variants with `cva`**, class merging with `cn()` from `src/lib/cn.ts`. Accept `className` and merge it last.
- **Radix for behaviour** where it helps (`@radix-ui/react-*` scoped packages). Forward the ref to the root element.
- **`data-slot="<name>"`** on the root element (and `data-slot="<name>-<part>"` on inner parts), so tools can find the component in rendered HTML.
- **Document the props with TSDoc** on the props interface. The component's TSDoc header says when to use it and when not to. The guide is built from this text, so write it for the design agent.
- **Only tokens and on-scale classes.** No raw hex, rgb or px values, no arbitrary classes (`p-[13px]`), no default Tailwind colours. The theme removes Tailwind's default scales, so an off-scale class compiles to nothing.
- **Text uses a `type-*` role** (`type-body`, `type-title` and so on), not raw sizes. 12px is the smallest text.
- **Icons are children**, not `leadingIcon` props: put an `*Icon` export inside Button, IconButton or Icon. A square control is a `size` (`icon-md`), not a boolean. Full width and other layout go through `className`, not props.
- **Light and dark come from `data-theme`** on `<html>` or on a wrapper. Components never use `dark:`. Check every visual change in both themes.
- **Stories:** CSF3 with `tags: ['autodocs']`, and the title `Atoms/<ExportName>`, so each story pairs with its export. Write a story for each state that matters (default, invalid, disabled and so on).
- **Tests:** Vitest and Testing Library. Test the roles and names, the variants, `data-slot`, the ref and `className` merging.

## Adding a component

1. Create `src/components/<Name>/` with `<Name>.tsx`, `<Name>.stories.tsx`, `<Name>.test.tsx` and `index.ts`. Follow an existing component (`Button`, `QuantityStepper`) for the shape.
2. Build it from the system's components and tokens. Never hand-build what an existing component already does.
3. Export it from `src/index.ts`.
4. Stories with the title `Atoms/<Name>`, one story per state.
5. Run `npm test`, `npm run typecheck` and `npm run build`.
6. Tell the design agent about it: add it to the component table in `.design-sync/conventions.md`, and add its Need → Use row, its group and its canvas example in `scripts/build-guide.mjs`. If it was on a "missing" list (in `conventions.md`, or `KNOWN_GAPS` in `scripts/check-rule-names.mjs`), take it off.
7. Run `npm run build:guide`, then `npm run check:rules`.
8. Push, then sync again in Claude Design (Sync from GitHub), and re-upload `skills/instacart-design.zip`.

## Secrets

The Jev (TypeSafe) key for `check:design` goes in `$TYPESAFE_API_KEY`. Never print it, and never commit it or paste it into a canvas.
