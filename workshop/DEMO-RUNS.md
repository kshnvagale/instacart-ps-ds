# Demo runs: how to make the paired canvases

**Facilitators only.** Make these before the event. Slides 15 and 18-20 show them, and they are the fallback if live generation stalls.

The paired run is the core demo of the workshop's lesson: you can design in Claude Design and the design system stays intact. It shows what the skill changes, and what the checks still catch.

## What you make

| # | Output | Set-up | Save as |
|---|---|---|---|
| 1 | **Baseline first draft** | Imported system only (skill off) | `baseline-first` |
| 2 | **Governed first draft** | Imported system + `instacart-design` skill | `governed-first` |
| 3 | **Governed repaired** | Output 2, after the check-and-fix loop | `governed-repaired` |

Keep all three. The comparison needs what Claude actually produced, so **never repair outputs 1 or 2 in place**. Duplicate output 2 first, then repair the copy.

## Write the checklist first

Fill in the **Requirement** column of the assessment table below **before** generating either version. Decide the scope of each line and how you will inspect it. Don't change it after you have seen an output.

## Keep the comparison fair

- Same system version: the same `main` commit, imported with Sync from GitHub into the same Claude Design design system. Record the commit hash.
- Same model and settings, where you can control them.
- Same brief (copy it from the handout, word for word), same data, same viewport (1280 wide, light theme).
- **A fresh session for each run.** No earlier chat, no memory of the other run.
- Assess **both first drafts before** giving any repair feedback. Show the repair loop separately.
- Record what happens, including the baseline getting things right. Don't force the baseline to fail. If it is clean, use a file with deliberate errors to demo the checker.
- This tests the skill and the checks as a package. It cannot tell you how much each file contributed. One paired run illustrates the workflow; it is not a numerical claim.

## Steps

### 0. Prepare (once)

1. In a fresh clone of the repo: `npm install` and `npm run build`. Record the commit: `git rev-parse --short HEAD` → `________`.
2. Make sure the public repo has the same commit. In Claude: new design system → **Sync from GitHub** → `kshnvagale/instacart-ps-ds`. Save a screenshot of the import report.
3. Write the checklist (the table below).

### 1. Baseline (imported system, skill off)

1. Open a **new** design with the imported system. Make sure the `instacart-design` skill is **off** in Claude settings.
   - Note: the import also writes guides from `brand/brand.md` and `.design-sync/conventions.md`. They are part of the imported system, so the baseline has them. Record that: the comparison is "skill off" vs "skill on".
2. Paste the brief. Send it once. Don't steer.
3. When it finishes, **duplicate the canvas** and name the copy `baseline-first`. Save its link and a screenshot.
4. Run `/check-design <baseline-first link>` (with `--jev` if you have a key). Save the report as `baseline-first.report.txt`.
5. Fill in the baseline column below. Don't fix anything.

### 2. Governed (imported system + skill)

1. Open a **new** design with the same imported system. Turn the `instacart-design` skill **on**.
2. Paste the same brief. Send it once. Don't steer.
3. Duplicate the result as `governed-first`. Save link, screenshot, and `/check-design` report (`governed-first.report.txt`).
4. Fill in the governed column below.

### 3. Repair loop (on a copy of governed-first)

1. Duplicate `governed-first` as `governed-repaired`.
2. In Claude Code: `/check-design <governed-repaired link>`. Fix each finding in the canvas (ask Claude Design, or edit). Run again. Repeat until **zero errors**.
3. Review the Jev warnings by hand. Fix or record why not.
4. Look at it in light **and** dark (`npm run check:visual` helps). Screenshot both. Record what you see.
5. Save the final report as `governed-repaired.report.txt`. Record how many rounds it took: `____`.

### 4. File everything

Keep in one folder (outside the public repo): the three canvas links, screenshots (light and dark), the three reports, the import report screenshot, the commit hash, and the filled table. Note the date and the model.

## Assessment checklist

Count hand-made substitutes too: looking only at imported components hides drift. Keep missing UI in the results (mark it "missing", don't drop the row).

**Exclusions** (state them): ordinary layout wrappers (`<div>` with layout classes) are not counted as hand-built components. Other exclusions: `________`.

Mark each cell: ✓ meets it, ✗ fails it, **M** missing, **S** hand-made substitute. Add a short note.

| # | Area | Requirement (write before generating) | How to inspect | Baseline first | Governed first | Governed repaired |
|---|---|---|---|---|---|---|
| 1 | Component use | Store header uses Logo, Input for search, Price for the delivery fee | Read the `x-import` tags | | | |
| 2 | Component use | Product tiles composed from Price, Badge, Text and Button (no ProductCard exists) | `x-import` tags; any raw `<button>`, `<span>` price | | | |
| 3 | Component use | Every money amount uses Price (tiles, deals, cart lines, fees, total) | Search the source for `$`; count Price vs Text | | | |
| 4 | Component use | Add is a Button with an approved variant (primary) | The tag and its `variant` | | | |
| 5 | Component use | Quantity controls use QuantityStepper | Tag; any raw `<input type="number">` or plain buttons | | | |
| 6 | Component use | "Sale" is a Badge with `tone="sale"`; old price via Price's "was" amount | Tags and props | | | |
| 7 | Component use | "Leave at door" is a Checkbox | Tag | | | |
| 8 | Component use | "Substitution alerts" is a Switch (applies instantly) | Tag | | | |
| 9 | Component use | Icons are the system's `*Icon` components, as children | Tags; any inline `<svg>` | | | |
| 10 | Styling | Only classes that exist in the system | `check:design` `dead-class` | | | |
| 11 | Styling | No raw colours or arbitrary values | `raw-color`, `arbitrary-value` | | | |
| 12 | Styling | No inline styles or inline layout | `inline-style`, `inline-layout` | | | |
| 13 | API use | `class-name`, never `class`, on `x-import` tags | `component-class` | | | |
| 14 | API use | Valid props and variants, hyphenated (`auto-complete`, not `autocomplete`) | `prop-type` | | | |
| 15 | Behaviour | Add turns into a quantity control after adding | Click it in the canvas | | | |
| 16 | Behaviour | The out-of-stock product is shown, and can't enter the cart | Look; try to add it | | | |
| 17 | Behaviour | The empty-cart state is shown | Look | | | |
| 18 | Behaviour | Subtotal, service fee, delivery fee and total shown; checkout button present | Look | | | |
| 19 | Labels | No vague labels ("OK", "Continue", "Submit") | Jev `vague-label`; read the buttons | | | |
| 20 | Missing parts | Missing parts are composed from approved atoms, or flagged as a library request | Read the source | | | |
| 21 | Visual | Looks right in **light** (no unstyled components, no cramped or broken layout) | Screenshot; your eyes | | | |
| 22 | Visual | Looks right in **dark** | Screenshot; your eyes | | | |
| | **Totals** | ✓ / ✗ / M / S | | | | |
| | **Check result** | errors / warnings | `/check-design` report | | | |

**Handoff bar** (output 3 only): zero blocking `check:design` errors, plus a human review of behaviour (rows 15-18) and of every advisory (Jev) warning.

If you ever publish a percentage, define its denominator, and keep the code, screenshots and reports. Component coverage, rule adherence and visual similarity measure different things.

## Notes

| Run | Date | Model | Commit | Skill on? | Rounds to repair | Notes |
|---|---|---|---|---|---|---|
| Baseline | | | | No | n/a | |
| Governed | | | | Yes | | |
