import type { Meta, StoryObj } from '@storybook/react-vite';

import { Price } from './Price';

const meta = {
  title: 'Atoms/Price',
  component: Price,
  tags: ['autodocs'],
  args: { amount: 3.99, size: 'md', tone: 'default', currency: 'USD', locale: 'en-US' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: { control: 'inline-radio', options: ['default', 'sale'] },
  },
} satisfies Meta<typeof Price>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const OnSale: Story = {
  args: { amount: 2.99, wasAmount: 3.99, tone: 'sale' },
};

export const WithUnitPrice: Story = {
  args: { amount: 4.99, unitPrice: { amount: 0.42, unit: 'oz' } },
};

export const SaleWithUnitPrice: Story = {
  args: { amount: 5.49, wasAmount: 6.99, tone: 'sale', unitPrice: { amount: 0.34, unit: 'oz' } },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Price size="sm" amount={0.39} unitPrice={{ amount: 0.39, unit: 'each' }} />
      <Price size="md" amount={2.99} wasAmount={3.99} tone="sale" />
      <Price size="lg" amount={4.99} unitPrice={{ amount: 0.42, unit: 'oz' }} />
    </div>
  ),
};

export const OtherCurrency: Story = {
  args: { amount: 4.79, currency: 'CAD', locale: 'en-CA', unitPrice: { amount: 1.06, unit: 'lb' } },
};
