# Internal run and dry run (Phase 12)

**Facilitators only.**

Two steps:

1. **Internal run.** Two people run the whole attendee flow end to end, each on a **fresh machine** (or a fresh user account) with a **fresh Claude account** that does not own anything in the workshop. Record the times.
2. Fix whatever broke. Then run the **dry run** with the group, using `FACILITATOR.md`.

## Internal run checklist

Each person fills in their own copy. "Time" is minutes taken for that step. The "Target" is the time the session allows (from the running order); "before" means it happens before the session.

Tester: `________` · Machine / OS: `________` · Date: `________` · Repo commit: `________`

| # | Step | What to verify | Target | Time | Pass? | Notes |
|---|---|---|---|---|---|---|
| 1 | Prerequisites | `node -v` is 20+; `claude` starts and is logged in | before | | | |
| 2 | Clone and install | `git clone https://github.com/kshnvagale/instacart-ps-ds.git`, `npm install` with no errors | before | | | |
| 3 | Storybook | `npm run storybook` opens; every component and the icons show, in light and dark | before | | | |
| 4 | Sync from GitHub | New design system → Sync from GitHub → `kshnvagale/instacart-ps-ds` finishes | 7 | | | |
| 5 | Import report | It lists all 15 components with live previews, the light and dark colour tokens (about 174), type styles, DM Sans, logos, and guides from `brand/brand.md` and `conventions.md` | in 4 | | | |
| 6 | Same component | Button and QuantityStepper in Claude Design match Storybook (variants, states, font, colour), in light and dark | in 4 | | | |
| 7 | Shared project fallback | A non-owner can open the shared project, copy it, and start a design that can use `Instacart.Button` | before | | | |
| 8 | Add the skill | Upload `skills/instacart-design.zip` in Claude **Settings → Capabilities → Skills**; it shows as on. Check the menu names match the handout. Try the paste fallback too | 5 | | | |
| 9 | Design the brief | Paste the brief from the handout; a full first draft appears | 35 | | | |
| 10 | Uses the system | Quantity controls use QuantityStepper, prices use Price, icons are `*Icon` components | in 9 | | | |
| 11 | Save first draft | Duplicating the canvas works; the copy keeps its link | 1 | | | |
| 12 | `/check-design <link>` | Downloads the canvas and reports | 3 | | | |
| 13 | Jev with the shared key | With `TYPESAFE_API_KEY` set, Jev runs and its warnings make sense | 2 | | | |
| 14 | Without a key | With no key, the strict checks still run and the report says Jev was skipped | 1 | | | |
| 15 | `npm run check:design <file>` | Runs on a downloaded canvas folder and on a `.dc.html` | 2 | | | |
| 16 | Fix and re-check | Fixing in the canvas and re-running reaches zero errors | 5 | | | |
| 17 | Look | Switching the canvas to dark works; `npm run check:visual <canvas>` makes light and dark screenshots | 2 | | | |
| 18 | Handoff app | `examples/handoff-app`: `npm install`, `npm run dev`, `npm run build` pass; add, quantity, out of stock, empty cart, the Checkbox, the Switch and the dark theme all work | facilitator | | | |
| 19 | Fallbacks | Every recording and saved output opens offline | before | | | |
| | **Total hands-on time** | Steps 4-17 fit in about 60 minutes | 60 | | | |

## Dry-run feedback template

Copy one per participant.

```
Name / role:
Date:
Did you use your own machine? Fresh account?

1. Setup
   - Time from "start" to ready to design (minutes):
   - What blocked you, if anything:

2. Clarity (1 = lost, 5 = clear)
   - Slides 04-12 (basics, missing context, governance):   [ ]
   - Sync from GitHub and the import report (slide 13):    [ ]
   - The skill and why it matters (slides 16-17):          [ ]
   - The paired run, with and without the skill (18-20):   [ ]
   - The brief and "done" (slides 14, 21):                 [ ]
   - Check and look (slide 22):                            [ ]
   - Missing parts and handoff (slides 23-24):             [ ]

3. Pace
   - Too fast / about right / too slow, and where:
   - Did you finish the core screen in the time? Y / N
   - Which step took longest:

4. The lesson
   - In one sentence, what did you learn?
   - Do you believe your system stayed intact in your design? Why?

5. The check
   - Was any finding confusing or wrong? Paste it:
   - Any Jev warning you disagreed with:

6. One thing to cut, one thing to keep, one thing to add:

7. Anything else:
```

## Jev shared key

The workshop uses **one shared TypeSafe (Jev) key**, separate from any personal key.

| Item | Decision |
|---|---|
| Number of keys | One, shared by all attendees |
| Spend cap | Set on the key before it is issued. Size it from the calibration cost (about 1.2-2k input tokens per screen) × attendees × about 5 checks each, plus a margin. Cap: `________` |
| Issued | On the day, at slide 21 or 22, on the screen or in the chat. Never in the repo, the handout file, or a canvas |
| How attendees use it | `export TYPESAFE_API_KEY=<key>` before starting Claude Code |
| Without it | Strict checks still run. Jev can be demoed centrally from the facilitator's machine |
| Revoked | Right after the session ends |
| Owner (issues, monitors, revokes) | **TBD** |

Checklist:

- [ ] Owner named.
- [ ] Key created, cap set, tested with `/check-design <link>` on a demo canvas, with Jev running (step 13 above).
- [ ] Key never committed; `git log -p | grep -i typesafe` shows nothing.
- [ ] Spend checked at the break and after the session.
- [ ] Key revoked after the session. Date: `________`
