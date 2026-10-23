import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { QuantityStepper } from './QuantityStepper';

const meta = {
  title: 'Atoms/QuantityStepper',
  component: QuantityStepper,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The "− 1 +" pill that sets how many of an item are in the cart. `label` is **required**: name the item ("Quantity of Organic Lemons"). Never use an `Input type="number"` for a quantity.',
      },
    },
  },
  args: { label: 'Quantity of Organic Lemons', defaultValue: 1, min: 0, step: 1, size: 'md', disabled: false },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
  },
} satisfies Meta<typeof QuantityStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop, live. */
export const Playground: Story = {};

/** The parent owns the count: a cart row. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [count, setCount] = React.useState(2);
    return (
      <div className="flex items-center gap-4">
        <QuantityStepper label="Quantity of Bananas" value={count} onValueChange={setCount} min={1} max={12} />
        <span className="type-body text-content">{count} in cart</span>
      </div>
    );
  },
};

/** `sm` on a product tile, `md` (default) in the cart. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <QuantityStepper label="Quantity of Organic Lemons (small)" size="sm" defaultValue={1} />
      <QuantityStepper label="Quantity of Organic Lemons (medium)" size="md" defaultValue={1} />
    </div>
  ),
};

/** At `min` the − button is disabled. */
export const AtMinimum: Story = {
  args: { label: 'Quantity of Avocados', defaultValue: 1, min: 1 },
};

/** At `max` (the store's limit) the + button is disabled. */
export const AtMaximum: Story = {
  args: { label: 'Quantity of Whole Milk', defaultValue: 6, max: 6 },
};

/** The whole control is off. */
export const Disabled: Story = {
  args: { label: 'Quantity of Sourdough Bread', defaultValue: 2, disabled: true },
};
