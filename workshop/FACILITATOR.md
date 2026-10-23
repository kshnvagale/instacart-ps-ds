# Facilitator script

**Facilitators only.** Built from `docs/workshop-content-outline.md` (the running order and slide notes). If that changes, update this file. The outline, and the SSX example canvases in `reference/canvas-examples/`, live in the private builder copy of the repo, not the public one.

**The lesson:** you can design outside Figma, in Claude Design, and your design system stays intact. The repo is the complete, correct system. There are no planted issues and no "build the missing part" exercise.

Session: 2 hours, including a 5-minute break. Keep 20 to 30 extra minutes for questions if the slot allows. About 60 minutes are hands-on. Attendees first touch the system at minute 22 (the import).

## Before the session (the day before and one hour before)

- [ ] The public repo https://github.com/kshnvagale/instacart-ps-ds is up to date (a clean `main` snapshot, without `docs/` and `reference/`).
- [ ] Sync from GitHub tested on a fresh account today. Screenshot of the import report saved.
- [ ] Shared, pre-synced Claude Design project ready as the fallback. Its link works for a non-owner account.
- [ ] Demo canvases saved and linked in your notes: **baseline first draft**, **governed first draft**, **governed repaired** (see `DEMO-RUNS.md`).
- [ ] Handoff recording and the running app (`examples/handoff-app`, `npm run dev`) ready.
- [ ] `skills/instacart-design.zip` is in the repo, and the upload step works on a fresh account.
- [ ] Jev shared key issued, capped and tested (see `DRY-RUN.md`, "Jev shared key"). Your own key is only in `~/.config/typesafe.env`. Never show it on screen.
- [ ] Handout link on the starter slide. The design brief (slide 14) is in the handout too.
- [ ] Terminal font large, notifications off, a fresh Claude Code session in a fresh clone of the repo.
- [ ] A file with deliberate checker errors (for example a copy of the baseline with a few hand edits), plus a known-clean file, for slide 22.

## Timing at a glance

| Clock | Minutes | Segment | Slides | Cue if late |
|---|---|---|---|---|
| 0:00 | 0-5 | Introduction and the screen we will build | 01-03 | Skip the career sequence |
| 0:05 | 5-10 | Design system basics | 04-08 | Experienced room: cut to 2 minutes, give the time to slide 21 |
| 0:10 | 10-17 | Missing context, governance, starting point | 09-12 | Show slide 10's screenshot only |
| 0:17 | 17-29 | **Import:** Sync from GitHub (live, then hands-on) | 13 | Everyone uses the shared project; skip their own import |
| 0:29 | 29-35 | The brief and the run without the skill | 14-15 | Use the saved baseline |
| 0:35 | 35-45 | **Teach:** styles and the skill (hands-on: add the skill) | 16-17 | Shorten slide 17's quiz to two tasks |
| 0:45 | 45-55 | Run with the skill, side by side, what checks prove | 18-20 | Use the saved governed drafts |
| 0:55 | 55-60 | Break | hold slide | Do not shorten it |
| 1:00 | 60-95 | **Design:** attendees design their screen | 21 | Hard stop at 1:35, whatever the state |
| 1:35 | 95-107 | **Check and look** | 22 | Run the check on one volunteer's canvas on the main screen |
| 1:47 | 107-112 | When a part is missing | 23 | Show one composed tile and one hand-made control only |
| 1:52 | 112-117 | **Hand off:** developer review | 24 | Play the handoff recording |
| 1:57 | 117-120 | Apply the workflow at work | 25 | Never cut this |

---

## Part 1: Introduction (0-5)

### 01. Your design system in Claude (0:00, 1 min)
- **Say:** "Today you'll design a grocery screen outside Figma, in Claude Design, with the real components. Then you'll check it and hand it to a developer. The design system stays intact the whole way."

### 02. Kishan Vagale (0:01, 1 min)
- **Say:** experience-based intro: 11+ years across Ola, redBus and Scaler; design leader and builder. Mention the publishing platform (reusable landing pages, AI-assisted workflows). Confirm the current job title before the event.

### 03. A screen developers can review (0:02, 3 min)
- **Show:** the finished grocery screen, then its source (component tags) and a short check report beside it.
- **Say:** "No Figma file in between, and nothing redrawn. The screen is made of the real components."
- **Say:** "The system is an unofficial Instacart teaching system, for teaching only. It is not made or approved by Instacart."

## Part 2: Design system basics (5-10)

Keep it quick; this room knows it.

### 04. What makes a design system (0:05, 1 min)
- **Show:** the Add button on several product tiles.
- **Say:** "Same component, same look and behaviour. The library supplies parts, docs explain use, a change process keeps it alive."

### 05. The layers in one screen (0:06, 1 min)
- **Show:** the screen split into foundations, atoms (Button, Price, QuantityStepper), a molecule (the product tile), an organism (the store header), template and page.

### 06. Tokens name the decisions (0:07, 1 min)
- **Show:** `#108910` (`color.green.9`) → `action.primary.bg` (`bg-action-primary`) → Button. Switch theme: the same token becomes `#0AAD0A`.

### 07. The states behind a component (0:08, 1 min)
- **Click:** in Storybook (`npm run storybook`), Button: default, hover, keyboard focus (Tab), disabled, loading. Then QuantityStepper at its minimum and maximum.

### 08. Source, Storybook and Claude Design (0:09, 1 min)
- **Show:** the same Button in the repo, in Storybook, and in Claude Design.
- **Say:** "Claude Design uses the compiled code, so it is the same Button. When the repo changes, sync again."

## Part 3: Missing context and governance (10-17)

### 09. What the agent cannot infer (0:10, 2 min)
- **Say:** "Claude knows common UI patterns. It does not know where our Button lives, which sizes it has, or what our spacing names mean."

### 10. The button looks right (0:12, 2 min)
- **Show:** two Add buttons: one imports Button, one is hand-made HTML. Ask: "What can a screenshot tell you?"
- **Show the real SSX failure** (`reference/canvas-examples/ssx-new-no-skill/`): the screenshot first (unstyled inputs), then the source: `class="…"` instead of `class-name="…"`. One word.
- **Say:** "Every run without the skill made this mistake. The run with the skill didn't."

### 11. Governance in this workshop (0:14, 2 min)
- **Ask** the four questions on the slide. **Answer:** the imported system, the style reference (`.design-sync/conventions.md`), the usage skill (`instacart-design`), the checker (`check:design` + Jev).

### 12. Your starting point at work (0:16, 1 min)
- **Say:** "At work, ask engineering for the component repo and the version in use. If it is on GitHub, you can sync it the way we are about to."

## Part 4: Import (17-29)

### 13. Sync from GitHub (0:17, 12 min)
- **Click (5 min):** in Claude: new design system → **Sync from GitHub** → `kshnvagale/instacart-ps-ds`.
- **Read the import report** aloud: the components (compiled, with live previews), about 174 colour tokens for light and dark, the type styles, the DM Sans fonts, the logos, and the guides from `brand/brand.md` and `.design-sync/conventions.md`.
- **Compare:** put Button (or QuantityStepper) beside its Storybook version. Variants, states, font, colour. Switch both to dark. Ask: "Is this the same component?"
- **Hands-on (7 min):** everyone runs the import. Walk the room.
- **Fallback:** anyone whose import fails or is slow uses the shared project link. If many fail, everyone uses the shared project.
- **If asked about `/design-sync`:** "It is a second way to import from Claude Code, with more checks. Optional; see `.design-sync/NOTES.md`."

## Part 5: Brief and baseline (29-35)

### 14. The grocery brief (0:29, 2 min)
- **Show:** the brief (same as the handout). Leave it up long enough to read.
- **Private notes:** the table on the outline's slide 14 says which line needs which part. Useful when you inspect outputs.

### 15. Run without the skill (0:31, 4 min)
- **Click:** a fresh design with the imported system, skill **off**. Paste the brief. Send it once.
- **Fallback:** if generation is slow, open the saved **baseline first draft**. Say so.
- **Ask:** "Where did Claude reuse the system? Where did it drift?" Save this version before any fix.
- If the baseline is clean, say so honestly. Don't force it to fail.

## Part 6: Teach (35-45)

### 16. Available styles (0:35, 3 min)
- **Show:** an excerpt from `.design-sync/conventions.md`, and the guide the import made from it. Pair `p-7` and `bg-green-500` (compile to nothing) with `p-6` and `bg-action-primary` (work).

### 17. The usage skill (0:38, 7 min)
- **Ask (2 min):** which component fits: add an item (Button) vs go to a page (Link); a form choice (Checkbox) vs an instant setting (Switch); a fact like "Sale" (Badge) vs an action (Button); an amount (Price) vs other copy (Text); how many (QuantityStepper) vs a number input.
- **Click:** open `skills/instacart-design/` and its guide.
- **Hands-on (5 min):** everyone uploads `skills/instacart-design.zip` (Settings → Capabilities → Skills) and turns it on. Paste fallback is in the handout.

## Part 7: The paired run (45-55)

### 18. Run with the skill (0:45, 3 min)
- **Click:** a fresh design, same system, skill **on**. Paste the same brief.
- **Save the first output** before any repair. Then in Claude Code: `/check-design <canvas link>`.
- **Fallback:** the saved **governed first draft** and **governed repaired** canvases.

### 19. The screen and its source (0:48, 4 min)
- **Show:** baseline | governed first draft | governed repaired, same viewport. Inspect the same Add button or quantity control in each: imports, styling, props, labels, behaviour.
- **Say:** "This is what 'the system stays intact' looks like in the source."

### 20. What the checks prove (0:52, 3 min)
- **Show:** the real report: passed, failed, needs review.
- **Show:** the SSX canvas with zero errors and a broken layout (`reference/canvas-examples/ssx-old-install-no-skill/`), then `npm run check:visual` rendering a screen in light and dark.
- **Say:** "The checker reads code, not pixels. Clean checks are not a pass."

## Break (55-60)

Hold slide with the handout link. Help anyone whose import or skill upload failed.

## Part 8: Attendees design (60-95)

### 21. Your turn (1:00, 35 min)
- **Show and keep visible:** the brief, the repo name, the shared project link, and "done".
- **Say:** "Save your first version before any repair."
- **Pause the ASCII background.** Show a timer.
- **Walk the room.** If someone has a hand-built control or prices as plain Text, ask: "Which component in the system does this job?" Don't fix it for them.
- **Timing cues:** at 1:12 "you should have the header and one row"; at 1:24 "start the cart and the empty state"; at 1:32 "save your first version now". Reveal stretch goals (a second screen, keyboard focus order) only when someone has the core screen.
- **Stalls:** pair up, or use the saved governed first draft as a starting canvas. Say when you use a fallback.

## Part 9: Check and look (95-107)

### 22. Check and look (1:35, 12 min)
- **Click:** in Claude Code, in the cloned repo: `/check-design <canvas link>`. Open a finding, inspect the source, fix it in the canvas, run again.
- **Explain:** strict rules (errors, must fix) vs Jev warnings (judgment). Show the known-clean file and the file with deliberate errors.
- **Findings you may see** (ordinary drift):

| Finding | Rule |
|---|---|
| `class` on a component | `component-class` |
| `autocomplete` (lowercase prop) | `prop-type` |
| Off-scale classes such as `p-7` | `dead-class` |
| Inline styles from hand edits | `inline-style`, `inline-layout` |
| Hand-built quantity control | `raw-element`, Jev `quantity-raw-input` |
| Price written as plain Text | Jev `price-as-text` |
| Substitution alerts as a Checkbox | Jev `checkbox-instant` |
| "OK", "Continue", "Submit" | Jev `vague-label` |

- **Then (Look):** "Everyone, switch your canvas to dark mode and look again." (Ask Claude Design to set `data-theme="dark"` on the screen, or use the canvas's theme control.)
- **Fallback:** run the check on the saved governed first draft on the main screen.

## Part 10: Missing parts and handoff (107-117)

### 23. When a part is missing: compose, don't hand-build (1:47, 5 min)
- **Show:** a product tile from the room composed from Price, Badge, Text, Button and QuantityStepper. Then a hand-made control the checker flagged.
- **Say:** "No system has every part. Compose from atoms. If a real control is missing, flag it as a library request. Don't invent one."
- **Say:** "QuantityStepper shows how a shared pattern joins the library: added once, with stories, tests and a skill entry. After a re-sync, every design can use it."

### 24. Developer review (1:52, 5 min)
- **Show:** each `x-import` tag maps one to one to a package import. Then `examples/handoff-app`: the imports, `npm run build` (type check passes), and the cart: add, quantity, the out-of-stock tile, the empty cart, "Leave at door", "Substitution alerts", dark theme.
- **Say:** "Review notes include the system version, the check results and any flagged missing parts. Developers still own product logic and integration."
- **Fallback:** the handoff recording.

## Part 11: At work (117-120)

### 25. One screen at work (1:57, 3 min)
- **Show:** Import / Teach / Design / Check / Look / Hand off.
- **Ask:** "Pick one screen at work. What system access do you need first?"
- **Leave up:** the repo and take-home links.
- **After the session:** revoke the shared Jev key (`DRY-RUN.md`).

## Fallbacks at a glance

| If this fails | Use |
|---|---|
| Sync from GitHub (slide 13) | The shared, pre-synced project; the import report screenshot |
| Live generation (slides 15, 18) | Saved baseline / governed first draft / governed repaired canvases |
| Skill upload (slide 17) | The paste fallback in the handout |
| `/check-design` | Saved check reports for each demo canvas; or `npm run check:design` on a downloaded canvas folder |
| Jev (no key, or the key's cap is hit) | Run strict checks only; show the saved Jev report |
| The handoff (slide 24) | The handoff recording; the app runs offline once built |
| Attendee login | Pair up; follow on the main screen. Tell them when you use a fallback. |
