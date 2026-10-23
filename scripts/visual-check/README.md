# Visual check (`npm run check:visual`)

The design checker (`check:design`) reads code. It cannot see a broken screen. In the SSX work, a canvas passed every check and still looked wrong. This tool closes that gap: it **draws each artboard with the real components and takes a screenshot**, in light and dark.

**Clean warnings are not a pass. Always open the screenshots and look.**

## What it does

1. Reads a canvas artboard (`.dc.html`), or a canvas folder (it follows `canvas.json` for the boards, their order and their sizes).
2. Converts the artboard with the checker's own converter (`scripts/check-design/lib/parse-dc.mjs`). Attributes become props exactly as the canvas does it:
   - only names with a hyphen change (`class-name` becomes `className`, `default-value` becomes `defaultValue`);
   - `class` on a component stays a prop named `class`. The component's own classes are lost and it draws unstyled. This is mistake B1, and you will see it in the screenshot.
   - `{{hole}}` values come from the artboard's `renderVals()`. A hole with no value shows as `{{name}}`.
3. Opens the artboard in a real browser (Chromium, through Playwright) with React, the design-system bundle and its stylesheet. Plain HTML stays HTML. Each `<x-import component-from-global-scope="Instacart.Button">` is the real `Button`.
4. Saves a screenshot per theme, and a contact sheet with every screenshot and warning.

## Run it

```sh
npm run build                        # the Instacart components in dist/
npm run check:visual -- path/to/canvas-folder
npm run check:visual -- path/to/Home.dc.html path/to/Cart.dc.html
```

Open `visual-check-output/index.html` to see every screenshot.

The first time, you may need the browser: `npx playwright install chromium`.

### Output

```
visual-check-output/
  index.html                 every canvas rendered so far
  <canvas>/index.html        one canvas
  <canvas>/<board>.light.png
  <canvas>/<board>.dark.png
  <canvas>/report.json       the warnings, as data
  <canvas>/_pages/           the pages the browser drew (for debugging)
```

The folder has its own `.gitignore`, so nothing in it goes into git.

## Which components and styles it loads

It picks the first of these that applies:

1. **Flags you pass.**
   - `--bundle <file.js>`: a ready bundle that sets `window.<Namespace>` (repeatable).
   - `--entry <file.js> --global <Namespace>`: an ES module entry. The tool bundles it into one script that sets `window.<Namespace>`. React always comes from the page, never a second copy.
   - `--css <file.css>`: a stylesheet (repeatable).
2. **The canvas's own copy.** A downloaded canvas keeps its design system under `ds/<namespace>/`. If the files the artboard's `<head>` names are there, the tool uses them.
3. **The Instacart build.** `dist/index.js` as `window.Instacart`, with `dist/instacart.standalone.css`. Once the sync stylesheet exists, pass it with `--css` (see below).

Use the **same stylesheet the canvas gets**. If you test with a fuller stylesheet than Claude Design has, layout classes will work here and fail there.

Other options: `--out <dir>`, `--themes light,dark`, `--width 1280` (used only when the canvas gives no size), `--no-signals`, `--strict` (exit with an error when there are warnings).

## Themes

The page gets `data-theme="light"` or `data-theme="dark"`. Artboards often pin `data-theme="light"` on their outer `<div>`. The tool switches those to the theme under test, so the dark shot really is dark, and notes it in the report.

## Warnings

These are hints that point you to a place to look. They do not replace looking.

| Warning | What it means |
|---|---|
| `lost-styling` | A component draws with no background, border, shadow or padding, but the same component drawn alone with the same props has them. Usually `class` where the canvas needs `class-name`. |
| `missing-component` | The artboard uses `NS.Something` that the bundle does not have. A red dashed box marks the spot. |
| `missing-namespace` | No bundle on the page sets `window.NS`. |
| `missing-hole` | `{{name}}` has no value in `renderVals()`. |
| `text-overflow` | Text is wider (or taller) than its box: it spills out or is cut off. |
| `page-overflow` | The page is wider than the artboard. |
| `low-contrast` | Text contrast below 4.5:1 (3:1 for large text), from the colours the browser computed. Text over images or gradients is skipped. |
| `page-error`, `render-error`, `convert-error` | Something failed while drawing. The screenshot may be empty. |

Notes (grey in the contact sheet, not counted): `theme-pinned`, `board-overflow` (the content is taller than the artboard), `missing-file` (often a font file), `setup`.

### Limits

- `lost-styling` draws each component alone to learn what it should look like. A part that only works inside its parent (`SelectTrigger` outside `Select`) cannot be drawn alone, so it is skipped. Look at the screenshot.
- Layout bugs, such as a header laid out in a row, have no warning. The screenshot shows them.
- The page uses React from this repo (19). The canvas supplies React 18. For these components that makes no visible difference.
- The artboard's own `<script>` behaviour (clicks, navigation) does not run. Only `renderVals()` runs, once.

## Checking it on the SSX examples

`reference/canvas-examples/` holds three real SSX canvases. Two of them looked broken in Claude Design. The visual check shows the same breakage. You need the SSX repo at `~/Documents/Ai/Scaler/SSX DS/react` (the tool only reads it).

```sh
SSX=~/Documents/Ai/Scaler/SSX\ DS/react

# New sync (namespace SsxUi): the sync bundle and stylesheet.
npm run check:visual -- reference/canvas-examples/ssx-new-no-skill \
  --bundle "$SSX/ds-bundle/_ds_bundle.js" --css "$SSX/ds-bundle/styles.css"
npm run check:visual -- reference/canvas-examples/ssx-new-with-skill \
  --bundle "$SSX/ds-bundle/_ds_bundle.js" --css "$SSX/ds-bundle/styles.css"

# Old install (namespace SSX, with Card and the other molecules): bundle the full package.
npm run check:visual -- reference/canvas-examples/ssx-old-install-no-skill \
  --entry "$SSX/dist/index.js" --global SSX --css "$SSX/ds-bundle/styles.css"
```

What you should see:

- **ssx-new-no-skill / Main**: the email field and the campus select have no border or background, and the switches are invisible. `lost-styling` names `SsxUi.Input` and `SsxUi.Switch`, each given `class=`.
- **ssx-new-no-skill / Classroom**: the chat field is unstyled (`lost-styling` on `SsxUi.Input`).
- **ssx-old-install-no-skill / Home**: the Card header's eyebrow, title and meta sit in one row, with no padding. No warning: only the screenshot shows it.
- **ssx-new-with-skill**: looks right.

The old install was made with an older copy of the package. Today's package is the closest we have, so small differences are possible.
