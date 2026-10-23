import type { Meta, StoryObj } from '@storybook/react-vite';

import { Checkbox } from './Checkbox';

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { 'aria-label': 'Leave at door' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The real use: an opt-in on checkout, applied when the order is placed. */
export const WithLabel: Story = {
  args: { 'aria-label': undefined },
  render: (args) => (
    <div className="flex items-start gap-3">
      <Checkbox {...args} id="leave-at-door" name="leaveAtDoor" aria-describedby="leave-at-door-help" />
      <div className="flex flex-col gap-0.5">
        <label htmlFor="leave-at-door" className="type-label text-content">
          Leave at door
        </label>
        <p id="leave-at-door-help" className="type-caption text-content-muted">
          Your shopper sends a photo when your order is dropped off.
        </p>
      </div>
    </div>
  ),
};

export const Unchecked: Story = { args: { defaultChecked: false } };

export const Checked: Story = { args: { defaultChecked: true } };

/** A "select all" box when only some items are picked. */
export const Indeterminate: Story = {
  args: { 'aria-label': undefined, defaultChecked: 'indeterminate' },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Checkbox {...args} id="select-all" />
      <label htmlFor="select-all" className="type-label text-content">
        Select all items (2 of 5)
      </label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Checkbox id="disabled-off" disabled />
        <label htmlFor="disabled-off" className="type-label text-content-disabled">
          Leave at door
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="disabled-on" disabled defaultChecked />
        <label htmlFor="disabled-on" className="type-label text-content-disabled">
          Save this address
        </label>
      </div>
    </div>
  ),
};

/** A required box left unticked. `aria-invalid` sets the style. */
export const Invalid: Story = {
  args: { 'aria-label': undefined },
  render: (args) => (
    <div className="flex items-start gap-3">
      <Checkbox {...args} id="age-check" required aria-invalid aria-describedby="age-check-error" />
      <div className="flex flex-col gap-0.5">
        <label htmlFor="age-check" className="type-label text-content">
          I am 21 or older
        </label>
        <p id="age-check-error" className="type-caption text-danger-fg">
          Confirm your age to buy alcohol.
        </p>
      </div>
    </div>
  ),
};
