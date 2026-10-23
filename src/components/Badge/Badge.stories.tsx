import type { Meta, StoryObj } from '@storybook/react-vite';
import { Check, Leaf, Package, Tag, Warning } from '@phosphor-icons/react';

import { Badge, type BadgeTone } from './Badge';

const TONES: Array<[BadgeTone, string]> = [
  ['neutral', '12 oz'],
  ['success', 'Delivered'],
  ['warning', 'Only 3 left'],
  ['danger', 'Out of stock'],
  ['info', 'New'],
  ['brand', 'Organic'],
  ['sale', 'Sale'],
];

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Passive status: a badge **reports** a fact and is never clickable. The word carries the meaning, not the colour. Icons are children.',
      },
    },
  },
  args: { children: 'Sale', tone: 'sale', size: 'md' },
  argTypes: {
    tone: { control: 'select', options: TONES.map(([t]) => t) },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {TONES.map(([tone, label]) => (
        <Badge key={tone} tone={tone}>
          {label}
        </Badge>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge size="sm" tone="sale">
        Sale
      </Badge>
      <Badge size="md" tone="sale">
        Sale
      </Badge>
      <Badge size="sm" tone="danger">
        Out of stock
      </Badge>
      <Badge size="md" tone="danger">
        Out of stock
      </Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone="success">
        <Check weight="bold" />
        Delivered
      </Badge>
      <Badge tone="brand">
        <Leaf weight="bold" />
        Organic
      </Badge>
      <Badge tone="warning">
        <Warning weight="bold" />
        Only 3 left
      </Badge>
      <Badge tone="danger">
        <Package weight="bold" />
        Out of stock
      </Badge>
      <Badge tone="sale">
        <Tag weight="bold" />
        No markups
      </Badge>
    </div>
  ),
};
