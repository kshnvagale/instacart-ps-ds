import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './Input';

const meta = {
  title: 'Atoms/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    size: 'md',
    placeholder: 'Enter promo code',
    'aria-label': 'Promo code',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** A field with its label and help text, the way it is used in a form. */
export const WithLabel: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label htmlFor="checkout-phone" className="type-label text-content">
        Phone number
      </label>
      <Input {...args} id="checkout-phone" type="tel" placeholder="(555) 555-0123" aria-label={undefined} aria-describedby="checkout-phone-help" />
      <p id="checkout-phone-help" className="type-caption text-content-muted">
        Your shopper texts you if something is out of stock.
      </p>
    </div>
  ),
};

/** `aria-invalid` sets the error style. The message is linked with `aria-describedby`. */
export const Invalid: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label htmlFor="checkout-promo" className="type-label text-content">
        Promo code
      </label>
      <Input {...args} id="checkout-promo" defaultValue="FRESH25" aria-label={undefined} aria-invalid aria-describedby="checkout-promo-error" />
      <p id="checkout-promo-error" className="type-caption text-danger-fg">
        This code has expired.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'FRESH25' },
};

/** Readable and copyable, but not editable. */
export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: '1 Ferry Building, San Francisco, CA', 'aria-label': 'Delivery address' },
};

/** The home page search: the `xl` pill. */
export const Search: Story = {
  args: {
    size: 'xl',
    type: 'search',
    placeholder: 'Search products, stores, and recipes',
    'aria-label': 'Search products, stores, and recipes',
  },
};

/** Every size, top to bottom: md, lg, xl. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Input {...args} size="md" placeholder="Search Sprouts Farmers Market" aria-label="Search md" />
      <Input {...args} size="lg" placeholder="Search Sprouts Farmers Market" aria-label="Search lg" />
      <Input {...args} size="xl" placeholder="Search products, stores, and recipes" aria-label="Search xl" />
    </div>
  ),
};
