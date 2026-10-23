import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carrot, Clock, MapPin, ShoppingCart, Storefront } from '@phosphor-icons/react';

import { Icon } from './Icon';

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A sized, coloured wrapper around one Phosphor icon. Decorative by default (`aria-hidden`); give it a `label` when the icon means something on its own.',
      },
    },
  },
  args: { size: 'md', tone: 'inherit', children: <ShoppingCart /> },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: {
      control: 'select',
      options: ['inherit', 'default', 'strong', 'muted', 'brand', 'success', 'warning', 'danger'],
    },
    children: { control: false },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-end gap-6 text-content">
      <Icon size="sm">
        <ShoppingCart />
      </Icon>
      <Icon size="md">
        <ShoppingCart />
      </Icon>
      <Icon size="lg">
        <ShoppingCart />
      </Icon>
    </div>
  ),
};

export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-6">
      {(['default', 'strong', 'muted', 'brand', 'success', 'warning', 'danger'] as const).map((tone) => (
        <Icon key={tone} size="lg" tone={tone} label={tone}>
          <Carrot />
        </Icon>
      ))}
    </div>
  ),
};

/** Decorative: the text beside the icon already says what it means. */
export const BesideText: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 type-body text-content">
      <span className="inline-flex items-center gap-1 text-content-brand">
        <Icon size="sm">
          <Clock />
        </Icon>
        Delivery by 7:30am
      </span>
      <span className="inline-flex items-center gap-1">
        <Icon size="sm" tone="muted">
          <Storefront />
        </Icon>
        Pickup available
      </span>
    </div>
  ),
};

/** Standing alone, the icon needs a `label`. It becomes `role="img"`. */
export const Labelled: Story = {
  args: { label: 'Store location', size: 'lg', tone: 'strong', children: <MapPin /> },
};
