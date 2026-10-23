# Instacart: how to build with it

`instacart-ps-ds` is an unofficial Instacart design system, made for teaching. It has one brand (Instacart) and two themes, light and dark. This sync holds the **foundations** (tokens and utility classes) and **15 components** (14 atoms and `QuantityStepper`). There are no other molecules or organisms yet: no card, no product tile, no tabs. Compose them from the atoms and the classes below. Do not invent new components.

In a Design canvas the components are on `window.Instacart`. In code they are imported from `instacart-ps-ds`. They are the same components, so what you build maps 1:1 to shippable code.

## Light and dark are an attribute, not a prop or a provider

There is no theme provider and no `theme` prop. Every token is a CSS custom property, and one attribute on `<html>` (or on any wrapper) picks the values:

```html
<html data-theme="light">   <!-- or "dark" -->
```

- With no `data-theme`, the OS preference decides.
- To show both themes side by side, put `data-theme` on each wrapper. The nearest one wins.
- Components never need `dark:`. The colour classes below already change with the theme. Use `dark:` only for your own one-off markup, such as an image swap.

## Mounting components on a canvas

A component is an `x-import` tag. Plain HTML (`div`, `section`, `ul`, `img`) is for layout only.

```html
<x-import component-from-global-scope="Instacart.Button" variant="primary" size="lg" class-name="w-full">Add to cart</x-import>
```

**The rules that break designs most often:**

1. **On an `x-import`, write `class-name`, never `class`.** A plain `class` on an `x-import` is passed through unchanged. It overwrites the component's own classes, and the component renders unstyled. Plain HTML elements keep `class` as usual.
2. **Write multi-word props in kebab-case, with a hyphen between the words.** The canvas turns each hyphenated name into camelCase: `default-value` becomes `defaultValue`, `html-for` becomes `htmlFor`, `auto-complete` becomes `autoComplete`, `read-only` becomes `readOnly`, `tab-index` becomes `tabIndex`, `was-amount` becomes `wasAmount`, `on-checked-change` becomes `onCheckedChange`. A name with no hyphen is passed as it is, so lowercase `autocomplete`, `tabindex`, `readonly`, `defaultvalue` or `htmlfor` are **wrong**: React does not know them, and the prop is lost.
3. **`aria-*` and `data-*` stay as they are:** `aria-label`, `aria-invalid`, `aria-describedby`.
4. **Numbers, booleans, objects and handlers go in `{{ }}` holes** from the artboard's `renderVals()`: `amount="{{lemonPrice}}"`, `loading="{{yes}}"`, `unit-price="{{lemonUnit}}"`. A plain `amount="3.99"` is a string, not a number.
5. **`style` on an `x-import` only places and sizes the slot.** Never use it for colour, spacing or type.
6. **No raw hex, rgb or px values, no arbitrary classes (`p-[13px]`, `bg-[#0AAD0A]`), and no inline styles for colour, spacing or type** anywhere, on components or on layout. Use the classes below.

A product row, as canvas source:

```html
<div class="flex items-center gap-4 border-b border-border py-4">
  <img src="{{lemonPhoto}}" alt="" class="size-16 rounded-md object-cover">
  <div class="flex flex-1 flex-col gap-1">
    <x-import component-from-global-scope="Instacart.Heading" as="h3" variant="title">Organic Lemons</x-import>
    <x-import component-from-global-scope="Instacart.Text" variant="body-sm" tone="muted">2 lb bag</x-import>
    <x-import component-from-global-scope="Instacart.Price" amount="{{lemonPrice}}" was-amount="{{lemonWas}}" tone="sale" size="sm"></x-import>
  </div>
  <x-import component-from-global-scope="Instacart.Badge" tone="sale">Sale</x-import>
  <x-import component-from-global-scope="Instacart.IconButton" aria-label="Add Organic Lemons to cart" size="sm">
    <x-import component-from-global-scope="Instacart.PlusIcon"></x-import>
  </x-import>
</div>
```

A labelled field. The label is a `Text` with `as="label"`; the error is linked with `aria-describedby`:

```html
<div class="flex flex-col gap-2">
  <x-import component-from-global-scope="Instacart.Text" as="label" variant="label" html-for="email">Email</x-import>
  <x-import component-from-global-scope="Instacart.Input" id="email" type="email" auto-complete="email" aria-invalid="true" aria-describedby="email-error"></x-import>
  <x-import component-from-global-scope="Instacart.Text" id="email-error" variant="body-sm" tone="danger">Enter an email address, such as name@example.com</x-import>
</div>
```

## Using components

- Style a component with its own props: `variant`, `size`, `tone`. Use `class-name` (`className` in code) **only for layout**: width, margin, flex or grid placement. Never use it for colour, type, radius or padding.
- **Icons are children, never props.** Put one icon from the icon set (below) inside `Instacart.Icon`, or straight inside a Button, IconButton or Badge, which size it. Do not set a size or colour on the icon. Never draw an `<svg>` by hand, and never use emoji as icons.
- A link that looks like a button is `Button` with `as-child="{{yes}}"` around an `<a href>`.
- For text, prefer `Heading` and `Text` over raw elements. They carry the type roles and colour tones.
- `Heading` needs `as` (`h1` to `h6`) from the page outline. `variant` sets the look.
- Every price is `Price`, never a `Text` with "$3.99" in it.
- Labels for `Input`, `Checkbox` and `Switch` are separate: a `Text as="label"` (or `<label for>`). There is no label prop.
- Show an error with `aria-invalid`, never with a class.

## The components

| Component | One line |
|---|---|
| `Button` | An action: "Add to cart", "Checkout". Variants `primary`, `secondary`, `tertiary`, `danger`, `neutral`. At most one `primary` per view. |
| `IconButton` | An icon-only action, such as "+" on a product. `aria-label` is required. |
| `Link` | Navigation only. Never for an action that writes data. |
| `Heading` | A real h1 to h6 title. `as` is required. |
| `Text` | Body copy, labels and fine print. |
| `Price` | Every money amount: current, "was" and per-unit prices. |
| `Badge` | A passive fact: "Sale", "Out of stock", "Organic". Never clickable. |
| `Input` | A single-line text field: email, address, promo code, search. |
| `Checkbox` | A yes/no choice that applies when the form is submitted ("Leave at door"). |
| `Switch` | An on/off setting that applies instantly, with no save button ("Substitution alerts"). |
| `QuantityStepper` | The "− 1 +" pill for an item quantity in the cart or on a product tile. `label` is required ("Quantity of Organic Lemons"). |
| `Avatar` | A person: the shopper, a customer, the signed-in account. |
| `Icon` | A sized, coloured wrapper around one icon from the icon set. |
| `Logo` | The Instacart wordmark or carrot mark. |
| `Spinner` | A wait you cannot measure ("Finding your shopper"). |

The full rules for each one (when to use it, when not) are in the design skill's component guide and in each component's API page.

## Icons

The icons are real components of this system, from Phosphor (Regular weight). Only these exist on a canvas: each one is `Instacart.` plus its name, such as `Instacart.ShoppingCartIcon`. Use them, and never draw an `<svg>` by hand. If you need an icon that is not here, say so; a developer adds it to `src/icons/index.ts`.

`ArrowLeftIcon`, `ArrowRightIcon`, `ArrowSquareOutIcon`, `BasketIcon`, `BellIcon`, `CaretDownIcon`, `CaretLeftIcon`, `CaretRightIcon`, `CaretUpIcon`, `CarrotIcon`, `CheckCircleIcon`, `CheckIcon`, `ClockIcon`, `FunnelIcon`, `GiftIcon`, `HeartIcon`, `HouseIcon`, `InfoIcon`, `LeafIcon`, `ListIcon`, `MagnifyingGlassIcon`, `MapPinIcon`, `MinusIcon`, `OrangeIcon`, `PackageIcon`, `PercentIcon`, `PlusIcon`, `ReceiptIcon`, `ShoppingBagIcon`, `ShoppingCartIcon`, `SlidersHorizontalIcon`, `SlidersIcon`, `StarIcon`, `StorefrontIcon`, `TagIcon`, `TrashIcon`, `TruckIcon`, `UserIcon`, `WarningCircleIcon`, `WarningIcon`, `XIcon`

An icon is a nested `x-import` inside `Icon` (or inside a Button, IconButton or Badge):

```html
<x-import component-from-global-scope="Instacart.Icon" size="md"><x-import component-from-global-scope="Instacart.ShoppingCartIcon"></x-import></x-import>
<x-import component-from-global-scope="Instacart.IconButton" aria-label="Remove Organic Lemons" size="sm">
  <x-import component-from-global-scope="Instacart.TrashIcon"></x-import>
</x-import>
```

Give an icon no props. The wrapper sets its size and colour (`size`, `tone` on `Icon`).

## When a part is missing

1. **Compose it from atoms and the classes below.** A product card is a `div` with `bg-surface border border-border rounded-lg p-4`, holding an `img`, a `Heading`, a `Price`, a `Badge` and a `Button`.
2. **Name what it stands for** in a comment, such as `<!-- ProductCard (composed) -->`, so developers can swap in the real one later.
3. **Never hand-build a control.** No styled `<button>`, `<input>`, `<select>` or `<a>`. A raw element is fine only where no atom exists: layout `div`s, lists, tables, images.
4. **Quantity:** always use `QuantityStepper`. Never an `Input` with `type="number"`, a raw `<input>`, or two IconButtons around a count.
5. Also missing: `Card`, `ProductCard`, `Tabs`, a radio group, a select, a dialog. Compose what you can. For a choice of one option out of several, do not fake it with Checkboxes: say that the part is missing.

## The vocabulary is closed

Tailwind's default scales are **removed**. An off-scale class such as `p-7`, `max-w-md`, `text-lg`, `bg-green-500` or `shadow-lg` silently produces no CSS. Use only the names in these tables. Layout classes with no scale work as usual: `flex`, `grid`, `grid-cols-1` to `grid-cols-12`, `col-span-2`, `items-center`, `justify-between`, `w-full`, `mx-auto`, `relative`, `absolute`, `overflow-hidden`, `truncate`, `text-center`, `sr-only`.

### Spacing steps

The same steps work for padding (p, px, py, pt, pr, pb, pl), margin (m, mx, my, mt, mr, mb, ml), gap, gap-x, gap-y, space-x and space-y: `p-4`, `mt-2`, `gap-x-3`, `space-y-6`.

There is no 7, 9, 11, 14, 15 or 20.

| Class | Size | Typical use |
|---|---|---|
| `gap-0` | 0 | Nothing between |
| `gap-px` | 1px | A hairline |
| `gap-0.5` | 2px | Tight stacks inside a price |
| `gap-1` | 4px | A title and its caption |
| `gap-2` | 8px | An icon and its label, a label and its field |
| `gap-3` | 12px | Items in a row |
| `gap-4` | 16px | Fields in a form, product tiles in a grid |
| `gap-5` | 20px | A roomy row |
| `gap-6` | 24px | Groups inside a panel, card padding |
| `gap-8` | 32px | Sections of a page |
| `gap-10` | 40px | Large sections |
| `gap-12` | 48px | Page bands |
| `gap-16` | 64px | A hero band |

### Everything else

| Need | Use | Not |
|---|---|---|
| Text style | `type-display` `type-h1` `type-h2` `type-h3` `type-title` `type-body-lg` `type-body` `type-body-sm` `type-caption` `type-label` `type-label-lg` | `text-2xl` `text-sm` `leading-tight` |
| Font and weight | `font-sans` `font-regular` `font-medium` `font-semibold` `font-bold` | `font-light` `font-normal` |
| Control heights | `h-control-sm` (36px) `h-control-md` (40px) `h-control-lg` (48px) `h-control-xl` (56px) | `h-9` `h-11` |
| Icon sizes | `size-icon-sm` (16px) `size-icon-md` (20px) `size-icon-lg` (24px) | `size-7` |
| Width | `w-full` `w-auto` `w-fit` `w-1/2` `w-1/3` `w-2/3` `max-w-full` `min-w-0` | `max-w-md` `max-w-lg` `w-96` |
| Page and card backgrounds | `bg-surface` `bg-surface-subtle` `bg-surface-raised` `bg-surface-hover` `bg-surface-active` `bg-surface-inverse` | `bg-white` `bg-gray-50` |
| Brand backgrounds | `bg-surface-brand` (Kale, for hero and promo bands) `bg-surface-brand-subtle` (Cashew in light) | `bg-green-500` `bg-emerald-900` |
| Status backgrounds | `bg-success` `bg-warning` `bg-danger` `bg-info` | `bg-red-100` `bg-yellow-50` |
| Text colour | `text-content` `text-content-strong` `text-content-muted` `text-content-disabled` `text-content-inverse` `text-content-brand` `text-content-link` `text-content-on-brand` | `text-gray-600` `text-black` |
| Status text | `text-success-fg` `text-warning-fg` `text-danger-fg` `text-info-fg` | `text-red-600` |
| Borders | `border` `border-t` `border-b` `border-l` `border-r` `border-x` `border-y` `divide-y` `divide-x` | `border-hair` `border-thick` |
| Border colour | `border-border` `border-border-strong` `border-border-brand` `divide-border` | `border-gray-200` |
| Radius | `rounded-none` `rounded-sm` (4px) `rounded-md` (8px) `rounded-lg` (12px) `rounded-xl` (24px) `rounded-full` | `rounded-2xl` `rounded-3xl` |
| Elevation | `shadow-raised` `shadow-popover` `shadow-overlay` | `shadow-md` `shadow-lg` |
| Stacking | `z-base` `z-raised` `z-sticky` `z-overlay` `z-popover` | `z-modal` `z-dropdown` |
| Aspect ratio | `aspect-square` | `aspect-video` |
| Breakpoints (min-width) | `sm:` (640px) `md:` (768px) `lg:` (1024px) `xl:` (1280px) | `2xl:` |

The button, badge and logo colours (`bg-action-primary`, `bg-badge-sale`, `fill-logo-kale`) belong to their components. Do not use them on your own markup; use the component.

## Rules of thumb

- At most one `primary` Button per view.
- `type-caption` (12px) is the smallest text. Never go below it.
- The sale yellow (`Badge tone="sale"`, `Price tone="sale"`) is for deals only. Status colours (`success`, `warning`, `danger`, `info`) are for status only.
- Write labels that say what happens: "Add to cart", "Place order", not "OK", "Submit" or "Continue".
- Check every screen in light **and** dark. A defect that only appears in dark mode has shipped before.
