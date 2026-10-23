import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '../components/Icon';
import { Text } from '../components/Text';
import * as icons from './index';

const names = Object.keys(icons).sort() as (keyof typeof icons)[];

/**
 * Every icon this package ships. Only these reach Claude Design: to use
 * another Phosphor icon in a design, add it to `src/icons/index.ts` first.
 */
const meta = {
  title: 'Foundations/Icons',
  parameters: {
    docs: {
      description: {
        component:
          'The curated icon set. Each one is a real export (`Instacart.ShoppingCartIcon` on a canvas, `import { ShoppingCartIcon } from \'instacart-ps-ds\'` in code). Always put it inside an `Icon`, or straight inside a Button, IconButton or Badge.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {names.map((name) => {
        const Glyph = icons[name];
        return (
          <div key={name} className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-4">
            <Icon size="lg" tone="default">
              <Glyph />
            </Icon>
            <Text variant="body-sm" tone="muted">
              {name}
            </Text>
          </div>
        );
      })}
    </div>
  ),
};
