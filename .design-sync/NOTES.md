# design-sync notes: instacart-ps-ds

> **23 October 2026: the main import path is now Claude Design's own Sync from GitHub.** In Claude: new design system → Sync from GitHub → `kshnvagale/instacart-ps-ds`. A real test imported every component (compiled, with live previews), 174 light and dark colour tokens, the type styles, the DM Sans fonts and the logos, and wrote guides from `brand/brand.md` and `conventions.md`. `/design-sync` (below) is **optional**: a facilitator path with more control (a validate step and a story-by-story compare). `conventions.md` matters either way, because both paths give it to the design agent.

Notes for whoever runs `/design-sync` on this repo. Start here before a first sync or a re-sync. These lessons were first learned on another design system (SSX); this file says how each one applies here.

## Setup (as of 23 October 2026, before the first sync)

- **Whole package, one entry.** `entry` is `./dist/index.js`. Every public component is exported from `src/index.ts`, and the sync takes all of it. There is no `build-entry.mjs` (SSX needed one to cut a subset) and no `titleMap` (SSX used it to drop molecules). Every story title is `Atoms/<ExportName>`, so stories pair with exports by name.
- **`buildCmd`** runs `npm run build` (tokens, JS, types, styles, `dist/instacart.standalone.css`), then compiles `.design-sync/ds.source.css` to `ds.css` at the repo root. `ds.css` is a build output; keep it out of git.
- **The sync stylesheet (`ds.source.css`)** is the standalone stylesheet plus an `@source inline` safelist of on-scale layout classes. Our theme removes Tailwind's default scales, so a class that is not in the safelist and not used by a component compiles to nothing in Claude Design. It also scans the stories, so story-only classes exist in the preview cards. It does **not** import `fonts.css` (see Fonts).
- **Keep three lists in step:** the safelist in `ds.source.css`, the class tables in `conventions.md`, and the theme in `src/styles/theme.css`. `npm run check:rules` compiles every class the docs name with the real theme, and warns when an offered class is missing from the safelist.
- **Fonts: self-hosted.** DM Sans (standing in for Instacart Sans) comes from `@fontsource-variable/dm-sans`. `extraFonts` lists its `wght.css`, a plain `@font-face` file whose `url()`s point at the Latin and Latin-ext variable woff2 files in the same package; the sync copies those files into `fonts/`. A CSS `@import` of a font does not survive the upload, and a remote Google Fonts import would not either. If validate prints `[FONT_MISSING]`, this entry is missing or its path is wrong.
- **Story decorators do not need to run.** `.storybook/preview.tsx` imports no CSS (the sync's decorator bundler has no CSS loader). The light theme sits on `:root` and `base.css` paints the page, so previews render correctly without the decorator.
- **Story images: `import x from './_fixtures/x.jpg'`.** Never `new URL('./x.jpg', import.meta.url)`: previews compile with `import.meta.url` set to `https://ds-preview.invalid/`, so such images 404 and the compare step prints `[ASSETS_BLOCKED] … ds-preview.invalid`.
- **No card overrides yet.** Nothing here portals (no Select, no Dialog) and no story is very wide. If a later component needs one, add `"overrides": { "<Name>": { "cardMode": "single" } }` (portals) or `"column"` (wide stories) to `config.json`.
- **`conventions.md` is the README header** (`readmeHeader`). It is prepended to the uploaded README and read by the design agent before it builds. Every class, component and prop it names must exist: run `npm run check:rules` after every edit.
- **No `projectId` yet.** The first sync creates the Claude Design project. Pin its id in `config.json` as `projectId` straight away, so re-syncs update the same project.

## Gotchas carried over from SSX

- An SVG data URL inside CSS `url("…")` needs its `"` percent-encoded. `<img src>` is fine.
- The compare harness's local server has no `.svg` MIME type. A story SVG over Vite's 4 KB inline limit fails as `<img>` on the **reference** side only. Grade it on the preview and note it here.
- The compare step grades the first 6 stories per component. Stories after that are not verified.
- The sync verifies only what the stories show. A state with no story (invalid, disabled, read-only) has no verified reference.
- Dark mode is not verified by the compare loop (the reference is light). Check dark by hand in Claude Design.

## Re-sync steps

1. `npm run build:guide` if any component's TSDoc or props changed (this also re-zips the skill).
2. `npm run check:rules`. Fix every error before syncing.
3. `npm test` and `npm run build`.
4. Run `/design-sync` (authorise first with `/design-login`). Read the validate and compare logs, not just the exit code.
5. Open the project in Claude Design and look at a few components in light **and** dark.
6. When a component is added: export it from `src/index.ts`, give it `Atoms/<Name>` stories, add it to the component table in `conventions.md`, remove it from the "missing" lists (and from `KNOWN_GAPS` in `scripts/check-rule-names.mjs`), add its Need → Use row and group in `scripts/build-guide.mjs`, then steps 1 to 5.

## Log

- 2026-10-23: config, conventions and safelist written for Instacart. Not synced yet.
