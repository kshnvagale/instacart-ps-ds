import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Switch } from './Switch';

const meta = {
  title: 'Atoms/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { size: 'md', 'aria-label': 'Substitution alerts' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The real use: an account setting saved the moment it is flipped. */
export const WithLabel: Story = {
  args: { 'aria-label': undefined },
  render: function Render(args) {
    const [on, setOn] = React.useState(true);
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <label htmlFor="substitution-alerts" className="type-label text-content">
            Substitution alerts
          </label>
          <p id="substitution-alerts-help" className="type-caption text-content-muted">
            Get a text when your shopper replaces an item.
          </p>
        </div>
        <Switch
          {...args}
          id="substitution-alerts"
          aria-describedby="substitution-alerts-help"
          checked={on}
          onCheckedChange={setOn}
        />
      </div>
    );
  },
};

export const Off: Story = { args: { defaultChecked: false } };

export const On: Story = { args: { defaultChecked: true } };

export const Sizes: Story = {
  args: { 'aria-label': undefined },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Switch {...args} id="size-sm" size="sm" defaultChecked />
        <label htmlFor="size-sm" className="type-label text-content">
          Order updates by text
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Switch {...args} id="size-md" size="md" defaultChecked />
        <label htmlFor="size-md" className="type-label text-content">
          Substitution alerts
        </label>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Switch id="disabled-off" disabled />
        <label htmlFor="disabled-off" className="type-label text-content-disabled">
          Substitution alerts
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="disabled-on" disabled defaultChecked />
        <label htmlFor="disabled-on" className="type-label text-content-disabled">
          Order updates by text
        </label>
      </div>
    </div>
  ),
};
