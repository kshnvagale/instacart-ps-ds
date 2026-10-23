import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowSquareOutIcon, CaretRightIcon } from '@phosphor-icons/react';

import { Link } from './Link';

const meta = {
  title: 'Atoms/Link',
  component: Link,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Text that **goes somewhere**. Navigation only: never use a Link for an action that writes data',
          '(add to cart, place an order, delete, sign out). Use `<Button>` for those.',
          '',
          'It takes the font of the text around it. `asChild` renders your router link; `external` opens a new tab and says so to screen readers.',
        ].join('\n'),
      },
    },
  },
  args: { href: '#store', children: 'Sprouts Farmers Market', variant: 'default', underline: 'always' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'subtle', 'inverse'] },
    underline: { control: 'inline-radio', options: ['always', 'hover'] },
    external: { control: 'boolean' },
    asChild: { control: false },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop, live. */
export const Playground: Story = {};

/** Green, the surrounding colour, and inverse on a dark surface. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 font-sans type-body">
      <p className="text-content">
        Available at 35 stores from $0.39. <Link href="#stores">See all stores</Link>
      </p>
      <p className="type-caption text-content-muted">
        Offers subject to terms and eligibility.{' '}
        <Link variant="subtle" href="#terms">
          Terms apply
        </Link>
      </p>
      <p className="rounded-lg bg-surface-inverse p-4 text-content-inverse">
        $0 delivery fees on your first 3 orders.{' '}
        <Link variant="inverse" href="#offer">
          See details
        </Link>
      </p>
    </div>
  ),
};

/** `hover` hides the underline until hover or focus. Only where it is obvious that the text is a link. */
export const UnderlineOnHover: Story = {
  name: 'Underline on hover',
  parameters: { controls: { disable: true } },
  render: () => (
    <ul className="m-0 flex list-none flex-col gap-2 p-0 font-sans type-body">
      <li>
        <Link underline="hover" href="#produce">
          Fresh produce
        </Link>
      </li>
      <li>
        <Link underline="hover" href="#dairy">
          Dairy &amp; eggs
        </Link>
      </li>
      <li>
        <Link underline="hover" href="#aisle">
          View more
          <CaretRightIcon />
        </Link>
      </li>
    </ul>
  ),
};

/** Leaves Instacart: a new tab, `rel="noopener noreferrer"`, and a hint for screen readers. Add the icon yourself. */
export const External: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <p className="font-sans type-body text-content">
      Read the{' '}
      <Link external href="https://docs.instacart.com/">
        Instacart developer docs <ArrowSquareOutIcon />
      </Link>
    </p>
  ),
};

/** `asChild` passes the link's look and behaviour to your router's link component. */
export const AsChild: Story = {
  name: 'As child (router link)',
  parameters: { controls: { disable: true } },
  render: () => (
    <p className="font-sans type-body text-content">
      <Link asChild>
        <a href="#store/sprouts" data-router-link="">
          Browse Sprouts Farmers Market
        </a>
      </Link>
    </p>
  ),
};
