/// <reference types="vite/client" />
import type { Meta, StoryObj } from '@storybook/react-vite';
import { User } from '@phosphor-icons/react';

import { Icon } from '../Icon';
import { Avatar } from './Avatar';

import shopper from './_fixtures/shopper.png';
import banana from './_fixtures/banana.jpg';

const meta = {
  title: 'Atoms/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A round picture of a shopper or customer, with their initials when there is no photo. One image with the person\'s name; pass `alt=""` when the name is already shown beside it.',
      },
    },
  },
  args: { name: 'Maria Lopez', size: 'md', tone: 'neutral' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
    tone: { control: 'inline-radio', options: ['neutral', 'brand'] },
    children: { control: false },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The shopper's photo. Brand tone so the initials match while it loads. */
export const Photo: Story = {
  args: { src: shopper, name: 'Maria Lopez', alt: 'Maria Lopez, your shopper', tone: 'brand', size: 'lg' },
};

/** No photo: the initials come from the name. */
export const Initials: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="Maria Lopez" />
      <Avatar name="Sam Patel" />
      <Avatar name="Maria de la Cruz" />
      <Avatar name="Jo" />
    </div>
  ),
};

/** `brand` (Kale) is the Instacart shopper; `neutral` is a customer. */
export const ShopperAndCustomer: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="Maria Lopez" alt="Maria Lopez, shopper" tone="brand" size="lg" />
      <Avatar name="Sam Patel" alt="Sam Patel, customer" tone="neutral" size="lg" />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-end gap-4">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Avatar key={size} size={size} name="Maria Lopez" />
      ))}
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Avatar key={`photo-${size}`} size={size} src={shopper} name="Maria Lopez" tone="brand" />
      ))}
    </div>
  ),
};

/** A customer's own profile picture can be anything. Any shape is centre-cropped to the circle. */
export const AnyPicture: Story = {
  args: { src: banana, name: 'Sam Patel', size: 'xl' },
};

/**
 * A photo that fails to load falls back to the initials. (An empty data URL
 * fails at once, with no network request.)
 */
export const BrokenPhoto: Story = {
  args: { src: 'data:image/png;base64,', name: 'Sam Patel', size: 'lg' },
};

/** No name yet: pass an Icon as the fallback, and an `alt` so it still has a name. */
export const IconFallback: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Avatar alt="Guest" size="lg">
      <Icon size="md">
        <User />
      </Icon>
    </Avatar>
  ),
};

/** The name is written beside it, so the avatar is decorative (`alt=""`). */
export const InARow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-3 type-body text-content">
      <Avatar src={shopper} name="Maria Lopez" alt="" tone="brand" size="lg" />
      <div className="flex flex-col">
        <span className="type-title text-content-strong">Maria Lopez is shopping for you</span>
        <span className="text-content-muted">Delivery by 7:30am</span>
      </div>
    </div>
  ),
};
