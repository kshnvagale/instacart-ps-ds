import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from './Text';

const meta = {
  title: 'Atoms/Text',
  component: Text,
  tags: ['autodocs'],
  args: { children: 'Delivery by 7:30am', variant: 'body', tone: 'default', as: 'p' },
  argTypes: {
    variant: { control: 'select', options: ['body-lg', 'body', 'body-sm', 'caption', 'label', 'label-lg'] },
    tone: { control: 'select', options: ['default', 'strong', 'muted', 'brand', 'danger', 'inverse'] },
    as: { control: 'inline-radio', options: ['p', 'span', 'div', 'label'] },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Text variant="body-lg">body-lg: Order groceries for delivery or pickup today</Text>
      <Text variant="body">body: Available at 35 stores from $0.39</Text>
      <Text variant="body-sm">body-sm: Many in stock</Text>
      <Text variant="caption">caption: *Service and other fees apply. 3 orders in 14 days. Excludes restaurants.</Text>
      <Text variant="label">label: Pickup available</Text>
      <Text variant="label-lg">label-lg: Delivery by 7:30am</Text>
    </div>
  ),
};

export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Text tone="default">default: Delivery by 7:30am</Text>
      <Text tone="strong">strong: $0 delivery fees on your first 3 orders</Text>
      <Text tone="muted">muted: Offers subject to terms and eligibility</Text>
      <Text tone="brand">brand: Pickup available</Text>
      <Text tone="danger">danger: This item is out of stock</Text>
      <div className="rounded-md bg-surface-inverse p-3">
        <Text tone="inverse">inverse: on an inverse surface</Text>
      </div>
    </div>
  ),
};

export const AsLabel: Story = {
  args: { as: 'label', variant: 'label', htmlFor: 'delivery-notes', children: 'Delivery instructions' },
};

export const AsChild: Story = {
  render: () => (
    <Text asChild variant="caption" tone="muted">
      <small>*Service and other fees apply.</small>
    </Text>
  ),
};
