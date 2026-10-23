import type { Meta, StoryObj } from '@storybook/react-vite';

import { Logo } from './Logo';

const meta = {
  title: 'Atoms/Logo',
  component: Logo,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The Instacart wordmark or carrot mark, from the official logo kit. Pick the `tone` by the background: `color` on light, `cashew` on Kale or dark, `white` on photos. Never smaller than 20px tall.',
      },
    },
  },
  // The full-colour logo belongs on a light background, so every story sits on
  // the light surface, even when Storybook is in dark mode.
  decorators: [
    (Story) => (
      <div data-theme="light" className="bg-surface p-6">
        <Story />
      </div>
    ),
  ],
  args: { variant: 'full', tone: 'color', size: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['full', 'mark'] },
    tone: { control: 'inline-radio', options: ['color', 'cashew', 'white'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `cashew` and `white` are shown on Kale, the background they are made for. */
export const Playground: Story = {
  render: (args) => (
    <div className={args.tone === 'color' || !args.tone ? 'p-4' : 'rounded-lg bg-surface-brand p-4'}>
      <Logo {...args} />
    </div>
  ),
};

/** The primary logo: Kale text with the colour carrot, on a light background. */
export const FullColor: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <div className="rounded-lg bg-surface p-6">
        <Logo />
      </div>
      <div className="rounded-lg bg-surface-brand-subtle p-6">
        <Logo />
      </div>
    </div>
  ),
};

/** Cashew text, for Kale and other dark backgrounds. */
export const Cashew: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="rounded-lg bg-surface-brand p-6">
      <Logo tone="cashew" />
    </div>
  ),
};

/** All white, for photos or a colour where the full-colour logo is not approved. */
export const White: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="rounded-lg bg-surface-brand p-6">
      <Logo tone="white" />
    </div>
  ),
};

/** The carrot on its own, for small square spaces. */
export const Mark: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-6">
      <div className="rounded-lg bg-surface p-4">
        <Logo variant="mark" size="lg" />
      </div>
      <div className="rounded-lg bg-surface-brand p-4">
        <Logo variant="mark" size="lg" tone="white" />
      </div>
    </div>
  ),
};

/** 20px is the brand minimum, so `sm` is the smallest size. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Logo size="sm" />
      <Logo size="md" />
      <Logo size="lg" />
      <div className="flex items-end gap-4">
        <Logo variant="mark" size="sm" />
        <Logo variant="mark" size="md" />
        <Logo variant="mark" size="lg" />
      </div>
    </div>
  ),
};
