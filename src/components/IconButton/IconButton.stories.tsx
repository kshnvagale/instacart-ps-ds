import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeartIcon, MinusIcon, PlusIcon, ShoppingCartIcon, TrashIcon, XIcon } from '@phosphor-icons/react';

import type { ButtonVariant } from '../Button';
import { IconButton } from './IconButton';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'danger', 'neutral'];

const meta = {
  title: 'Atoms/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A round, square button with only an icon. `aria-label` is **required by the type**: name the action ("Add 1 lemon to cart", "Close"), not the picture. Variants, `loading`, `asChild` and disabled are the same as Button.',
      },
    },
  },
  args: { 'aria-label': 'Add 1 lemon to cart', variant: 'primary', size: 'md', children: <PlusIcon /> },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: false },
    asChild: { control: false },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop, live. */
export const Playground: Story = {};

/** The five variants, each with an action that fits it. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <IconButton variant="primary" aria-label="Add 1 lemon to cart">
        <PlusIcon />
      </IconButton>
      <IconButton variant="secondary" aria-label="Open cart">
        <ShoppingCartIcon />
      </IconButton>
      <IconButton variant="tertiary" aria-label="Save for later">
        <HeartIcon />
      </IconButton>
      <IconButton variant="danger" aria-label="Remove from cart">
        <TrashIcon />
      </IconButton>
      <IconButton variant="neutral" aria-label="Close">
        <XIcon />
      </IconButton>
    </div>
  ),
};

/** 36 / 40 / 48px, with 16 / 20 / 24px icons. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <IconButton size="sm" aria-label="Add 1 lemon to cart (small)">
        <PlusIcon />
      </IconButton>
      <IconButton size="md" aria-label="Add 1 lemon to cart (medium)">
        <PlusIcon />
      </IconButton>
      <IconButton size="lg" aria-label="Add 1 lemon to cart (large)">
        <PlusIcon />
      </IconButton>
    </div>
  ),
};

/** The Spinner takes the icon's place; the button keeps its size and focus. */
export const Loading: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {VARIANTS.map((variant) => (
        <IconButton key={variant} variant={variant} loading aria-label={`Adding to cart (${variant})`}>
          <PlusIcon />
        </IconButton>
      ))}
    </div>
  ),
};

/** Disabled is a grey fill. */
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <IconButton disabled aria-label="Remove 1 lemon">
        <MinusIcon />
      </IconButton>
      <IconButton disabled variant="secondary" aria-label="Add 1 lemon to cart">
        <PlusIcon />
      </IconButton>
    </div>
  ),
};
