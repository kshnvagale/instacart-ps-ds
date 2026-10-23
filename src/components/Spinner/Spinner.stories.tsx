import type { Meta, StoryObj } from '@storybook/react-vite';

import { Spinner } from './Spinner';

const meta = {
  title: 'Atoms/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A turning arc for a wait you cannot measure, such as "Finding your shopper…". Put visible text beside it and pass the same words as `label` (the screen-reader text). For a busy button, use `<Button loading>` instead.',
      },
    },
  },
  args: { size: 'md', tone: 'brand', label: 'Loading' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: { control: 'inline-radio', options: ['brand', 'muted', 'current'] },
    label: { control: 'text' },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop, live. */
export const Playground: Story = {};

/** 16, 24 and 40px. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="sm" label="Loading (small)" />
      <Spinner size="md" label="Loading (medium)" />
      <Spinner size="lg" label="Loading (large)" />
    </div>
  ),
};

/** Brand green for a page-level wait, muted grey inside a list, and `current` to follow the text colour. */
export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner tone="brand" label="Loading (brand)" />
      <Spinner tone="muted" label="Loading (muted)" />
      <span className="text-content-strong">
        <Spinner tone="current" label="Loading (current colour)" />
      </span>
    </div>
  ),
};

/** The real use: a short visible message beside the arc, with the same words as the label. */
export const FindingYourShopper: Story = {
  name: 'Finding your shopper',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-3 font-sans text-content">
      <Spinner label="Finding your shopper" />
      <p className="type-body-lg">Finding your shopper…</p>
    </div>
  ),
};

/** The one wait in a panel: large, centred, with a line of text under it. */
export const InAPanel: Story = {
  name: 'In a panel',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-surface p-8 font-sans">
      <Spinner size="lg" label="Loading stores near you" />
      <p className="type-body text-content-muted">Loading stores near you…</p>
    </div>
  ),
};
