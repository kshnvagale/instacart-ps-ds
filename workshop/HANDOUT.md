# Your design system in Claude: attendee handout

Practice Shift workshop, with Kishan Vagale. The grocery system you use today, `instacart-ps-ds`, is an **unofficial Instacart teaching system, for teaching only**. It is not made or approved by Instacart.

**What you learn today:** you can design outside Figma, in Claude Design, and your design system stays intact.

## The flow

**Import** the system → **Teach** Claude the rules → **Design** a screen → **Check** it → **Look** at it in light and dark → **Hand off** to developers.

## Before you start (setup)

You need:

1. **A Claude account** with Claude Design.
2. **Node 20 or newer.** Check with `node -v`.
3. **Claude Code, logged in.** Run `claude` in a terminal. If it asks you to log in, do it now.
4. **The repo** (for the check step):
   ```bash
   git clone https://github.com/kshnvagale/instacart-ps-ds.git
   cd instacart-ps-ds
   npm install
   ```

## Step 1: Import the system (Sync from GitHub)

1. In Claude, create a **new design system**.
2. Choose **Sync from GitHub**, and enter `kshnvagale/instacart-ps-ds`.
3. Wait for the import to finish, then read its report. You should see the components with live previews, the colour tokens (light and dark), the type styles, the DM Sans fonts, the logos, and guides written from the brand file and the style reference.
4. Open one component, for example Button or QuantityStepper, and compare it with Storybook (`npm run storybook`).

**If the import fails:** use the shared Claude Design project instead: `<shared project link>`. If you can only view it, make your own copy first (**Copy** or **Duplicate**).

## Step 2: Add the `instacart-design` skill

The skill tells Claude which component to pick for each job and what to do when a part is missing.

In Claude, open **Settings → Capabilities → Skills**, choose **Upload skill**, pick `skills/instacart-design.zip` from the repo, and make sure the skill is turned **on**.

**If you can't upload a skill** (the option is missing, or your organisation blocks it): open `skills/instacart-design/SKILL.md` and `skills/instacart-design/guidelines/components.md` from the repo. At the start of your design chat, paste both and write: "Follow these rules for every screen in this chat."

## Step 3: Design

Start a new design that uses the imported system. Paste this brief:

> Design a desktop grocery browsing screen (1280 wide, light theme) for the Instacart web app, using only the supplied design system's components and classes.
>
> - A store header with the store logo, the delivery fee, and a search field.
> - A "Shop your favourites" row of product tiles: name, price, price per unit, and an Add button that turns into a quantity control once added. One product is out of stock.
> - A "Deals" row where some items are on sale, with a sale badge and the old price.
> - A cart summary: items with quantity controls and line prices, a "Leave at door" option, substitution alerts that turn on or off instantly, the subtotal, service fee, delivery fee and total, and a checkout button. Also show the empty-cart state.
>
> Use realistic copy. Use placeholders like [Store name] where you don't know a fact.

Product pictures you may use: `workshop/assets/products/` (generated, free to use). Sample product data: `workshop/assets/products.json`.

**Save your first version before any repairs** (duplicate the canvas, or save its link).

**Stretch goal**, once the core screen works: a second screen (an aisle with filters, or checkout).

## Step 4: Check

Run these in Claude Code, inside the cloned repo.

| Command | What it does |
|---|---|
| `/check-design <canvas link>` | Downloads your Claude Design canvas and checks it against the system. Paste the canvas's link. |
| `npm run check:design <file>` | Runs the same checker on a file on your computer (`.dc.html`, `.html`, `.tsx`, or a downloaded canvas folder). |
| `npm run check:visual <canvas>` | Renders each artboard to a screenshot, in light and dark. |
| `npm run storybook` | Opens Storybook at `http://localhost:6006`: every component, with its variants and states. |

The checker gives two kinds of feedback:

- **Errors** (strict rules): fix them. Examples: a class that does not exist in the system, a raw colour, a hand-built control, a wrong prop.
- **Jev warnings**: questions that need your judgment, such as a vague button label. Jev runs only if the facilitator gives you a key. Without it, the strict rules still run. With a key, set it before you start Claude Code: `export TYPESAFE_API_KEY=<key>`. Never paste the key into a canvas or a commit.

Fix what it finds in the canvas, and run it again.

## Step 5: Look

Clean checks are not the end. Look at the screen yourself, then switch it to **dark** and look again.

## What "done" means

- Every part of the brief is on screen.
- The out-of-stock product and the empty cart are shown.
- The screen uses the system's components, not hand-built ones. A missing part is composed from atoms, or flagged.
- You saved your first version before repairs.
- `/check-design` shows no errors, and you looked at it in light and dark.

Tried a run without the skill first? That's fine. Save that version as well, so you can compare.

## If something stalls

| Problem | What to do |
|---|---|
| Sync from GitHub fails or is slow | Use the shared project link above. |
| Claude Design is slow or stops generating | Wait a minute, then ask it to "continue". Still stuck: start a new chat and paste the brief again. |
| The skill won't upload | Use the paste fallback above. |
| `/check-design` can't read your canvas | Check that you pasted the canvas link (a `claude.ai/...` artifact link). Or download the canvas and run `npm run check:design <folder>`. |
| `npm install` fails | Check `node -v` (20 or newer), then run it again. Still failing: pair with a neighbour for the check step. |
| Anything else | Raise a hand. The facilitators have recordings and saved outputs of every step. |
