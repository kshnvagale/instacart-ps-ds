---
name: instacart-design
description: Build UI with the Instacart design system (instacart-ps-ds, light and dark). Use for any grocery screen, flow, form or component layout made with Instacart atoms, in Claude Design or in code, and when reviewing a design for Instacart adherence. Picks the right atom for each need, composes missing parts from the closed class vocabulary, and checks the result before handoff.
---

# Instacart design

You build with the real components of `instacart-ps-ds`. In Claude Design they are on `window.Instacart`. In code they are imported from `instacart-ps-ds`. They are the same components, so what you build maps 1:1 to shippable code. Keep it that way.

## 1. Set the frame first

- Put `data-theme="light"` (or `"dark"`) on `<html>`. This attribute picks every colour token. With no `data-theme`, the OS preference decides.
- There is no provider to wrap the page in, and no `theme` prop.

## 2. Pick atoms, then say which

Read `guidelines/components.md`. Start from its **Need → Use** table, then read the entry for each atom you use. Before building, name the atoms you chose.

When no atom fits:

1. **Compose atoms.** A form field is a `Text as="label"` with `htmlFor`, then the control, then a `Text` for help or the error, linked with `aria-describedby`.
2. **Name what the composition stands for** in a comment, such as `<!-- ProductCard (composed) -->`, so developers can swap in the real part later.
3. **Never hand-build a control.** No styled `<button>`, `<input>`, `<select>` or `<a>`. A raw element is fine only where no atom exists: layout `div`s, lists, tables, images.
4. **Quantity is always `QuantityStepper`.** Never an `Input` with `type="number"`, and never two `IconButton`s around a `Text`. Give it a `label` that names the item ("Quantity of Organic Lemons").

## 3. Write canvas tags correctly

- A component is `<x-import component-from-global-scope="Instacart.Button" variant="primary">Add to cart</x-import>`.
- **Write `class-name`, never `class`, on an `x-import`.** A plain `class` there overwrites the component's own classes, and it renders unstyled. Plain HTML elements keep `class`.
- **Multi-word props are kebab-case:** `default-value`, `html-for`, `auto-complete`, `read-only`, `was-amount`, `on-checked-change`. Lowercase `autocomplete`, `tabindex` or `readonly` are wrong: the prop is lost. `aria-*` and `data-*` stay as they are (`aria-label`).
- Numbers, booleans, objects and handlers go in `{{ }}` holes from `renderVals()`: `amount="{{lemonPrice}}"`, `loading="{{adding}}"`.
- `style` on an `x-import` only places and sizes the slot.

## 4. Style with the closed vocabulary

The README's class tables are the whole vocabulary. Tailwind's default scales are removed, so `p-7`, `max-w-md`, `text-lg`, `bg-green-500` and `shadow-lg` silently produce nothing.

- Style components with their own props (`variant`, `size`, `tone`). Use `class-name` (`className` in code) for layout only: width, margin, flex or grid placement.
- Type is set with roles (`type-h2`, `type-body-sm`) or with `Heading` and `Text`, never with raw size and line height.
- Never write raw hex, px, arbitrary `[...]` values, or an inline `style` for colour, spacing or type.
- Icons are children: one exported `*Icon` component (`ShoppingCartIcon`, `PlusIcon`; the list is in the README) inside `Icon`, `Button`, `IconButton` or `Badge`. Use only the exported `*Icon` components; never draw SVGs, never icon props, never emoji.
- Every money amount is `Price`, never a `Text` with "$3.99" in it.

## 5. Check before handing off

In the repo, `npm run check:design -- <file> --jev` checks all of this: errors for facts, and Jev warnings for usage. For a Claude Design canvas, run `/check-design <canvas link>` in Claude Code. Elsewhere, go through this list by hand.

- [ ] `data-theme` is on `<html>`.
- [ ] Every control is an Instacart atom, and every composition is named.
- [ ] Every `x-import` uses `class-name`, never `class`, and kebab-case multi-word props.
- [ ] Every class is in the README tables, with no arbitrary values, hex or inline colour, spacing or type.
- [ ] Every prop value exists in the component's types: variant, size and tone names are exact.
- [ ] Icon-only controls have an `aria-label`. Field labels use `htmlFor`. Errors use `aria-invalid`, not colour alone.
- [ ] There is at most one `primary` Button per view.
- [ ] Settings that apply instantly are a `Switch`; choices applied by a submit button are a `Checkbox`.
- [ ] Labels say what happens ("Add to cart", "Place order"), not "OK" or "Submit".
- [ ] It reads correctly in light and in dark. A defect that only appears in dark mode has shipped before.
