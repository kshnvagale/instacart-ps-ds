import type { Meta, StoryObj } from '@storybook/react-vite';

import { Heading } from './Heading';

const meta = {
  title: 'Atoms/Heading',
  component: Heading,
  tags: ['autodocs'],
  args: { as: 'h2', children: 'Often Bought With', tone: 'strong' },
  argTypes: {
    as: { control: 'select', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
    variant: { control: 'select', options: [undefined, 'display', 'h1', 'h2', 'h3', 'title'] },
    tone: { control: 'select', options: ['strong', 'default', 'brand', 'inverse'] },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Heading as="h1" variant="display">
        Order groceries for delivery or pickup today
      </Heading>
      <Heading as="h1">h1: Fresh produce</Heading>
      <Heading as="h2">h2: Often Bought With</Heading>
      <Heading as="h3">h3: Items to add next</Heading>
      <Heading as="h4">h4 (title): Organic Bananas</Heading>
    </div>
  ),
};

/** The level comes from the page outline; the look is chosen apart from it. */
export const LevelApartFromLook: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Heading as="h2" variant="title">
        An h2 that looks like a card title
      </Heading>
      <Heading as="h3" variant="h1">
        An h3 that looks like an h1
      </Heading>
    </div>
  ),
};

export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Heading as="h3" tone="strong">strong (default)</Heading>
      <Heading as="h3" tone="default">default</Heading>
      <Heading as="h3" tone="brand">brand</Heading>
      <div className="rounded-md bg-surface-inverse p-3">
        <Heading as="h3" tone="inverse">inverse</Heading>
      </div>
    </div>
  ),
};
