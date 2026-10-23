import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRightIcon, HeartIcon, PlusIcon, ShoppingCartIcon, TrashIcon, XIcon } from '@phosphor-icons/react';

import { Button, type ButtonSize, type ButtonVariant } from './Button';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'danger', 'neutral'];
const TEXT_SIZES: ButtonSize[] = ['sm', 'md', 'lg', 'xl'];
const ICON_SIZES: ButtonSize[] = ['icon-sm', 'icon-md', 'icon-lg'];

const meta = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'A pill-shaped button that **does** something. The variant is the meaning:',
          '`primary` is the one main action on the view ("Add to cart", "Checkout"; at most one per view),',
          '`secondary` the grey alternative ("Show all"), `tertiary` the outline ("Log in"),',
          '`danger` removes or cancels, `neutral` a dark action that must not read as green.',
          '',
          'Icons are **children**. A square button is a `size` (`icon-sm` / `icon-md` / `icon-lg`), but prefer `<IconButton>`, which requires an `aria-label`.',
          'To go somewhere, use `<Link>`, or `<Button asChild><a href>…</a></Button>` for a call to action.',
        ].join('\n'),
      },
    },
  },
  args: { children: 'Add to cart', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: [...TEXT_SIZES, ...ICON_SIZES] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    asChild: { control: false },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop, live. */
export const Playground: Story = {};

/** The five meanings, side by side. Check this one in light and dark. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Add to cart</Button>
      <Button variant="secondary">Show all</Button>
      <Button variant="tertiary">Log in</Button>
      <Button variant="danger">Remove</Button>
      <Button variant="neutral">Browse Sprouts Farmers Market</Button>
    </div>
  ),
};

/** 36 / 40 / 48 / 56px, every one a full pill. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-4">
          {TEXT_SIZES.map((size) => (
            <Button key={size} variant={variant} size={size}>
              {size === 'sm' ? 'Add' : 'Add to cart'}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Icons are children, in the order you want them. The button sizes them. */
export const WithIcons: Story = {
  name: 'With icons',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button>
        <PlusIcon />
        Add to cart
      </Button>
      <Button variant="secondary">
        View more
        <ArrowRightIcon />
      </Button>
      <Button variant="tertiary">
        <HeartIcon />
        Save for later
      </Button>
      <Button variant="danger">
        <TrashIcon />
        Remove
      </Button>
      <Button size="xl">
        <ShoppingCartIcon />
        Checkout
      </Button>
    </div>
  ),
};

/**
 * Square sizes. They need an `aria-label`: an icon is not a name. Prefer
 * `<IconButton>`, whose type makes the label required.
 */
export const IconOnly: Story = {
  name: 'Icon only',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {ICON_SIZES.map((size) => (
        <Button key={size} size={size} aria-label="Add 1 lemon to cart">
          <PlusIcon />
        </Button>
      ))}
      <Button size="icon-md" variant="secondary" aria-label="Close">
        <XIcon />
      </Button>
    </div>
  ),
};

/**
 * `loading` shows a Spinner in place of any icon, sets `aria-busy`, and
 * ignores clicks. The label, the width and keyboard focus stay.
 */
export const Loading: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant} loading>
            Add to cart
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {TEXT_SIZES.map((size) => (
          <Button key={size} size={size} loading>
            <PlusIcon />
            Add to cart
          </Button>
        ))}
        {ICON_SIZES.map((size) => (
          <Button key={size} size={size} loading aria-label="Adding to cart">
            <PlusIcon />
          </Button>
        ))}
      </div>
    </div>
  ),
};

/** Disabled is a grey fill in every variant, not a faded copy. */
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant} disabled>
          Checkout
        </Button>
      ))}
    </div>
  ),
};

/** A call to action that navigates: `asChild` renders the link with the button's look. */
export const AsLink: Story = {
  name: 'As a link',
  parameters: { controls: { disable: true } },
  render: () => (
    <Button asChild size="lg">
      <a href="#start-shopping">
        Start shopping
        <ArrowRightIcon />
      </a>
    </Button>
  ),
};

/** Full width is `className="w-full"`: layout belongs to the parent. The product-page footer. */
export const FullWidth: Story = {
  name: 'Full width',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-full flex-col gap-3">
      <Button size="xl" className="w-full">
        Add to cart
      </Button>
      <Button size="xl" variant="secondary" className="w-full">
        Browse Sprouts Farmers Market
      </Button>
    </div>
  ),
};
