import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import * as pkg from '../index';
import * as icons from './index';

/** The contract: exactly these icons ship. Add a name here when you add an icon. */
const EXPECTED = [
  'ArrowLeftIcon', 'ArrowRightIcon', 'ArrowSquareOutIcon', 'BasketIcon', 'BellIcon',
  'CaretDownIcon', 'CaretLeftIcon', 'CaretRightIcon', 'CaretUpIcon', 'CarrotIcon',
  'CheckCircleIcon', 'CheckIcon', 'ClockIcon', 'FunnelIcon', 'GiftIcon', 'HeartIcon',
  'HouseIcon', 'InfoIcon', 'LeafIcon', 'ListIcon', 'MagnifyingGlassIcon', 'MapPinIcon',
  'MinusIcon', 'OrangeIcon', 'PackageIcon', 'PercentIcon', 'PlusIcon', 'ReceiptIcon',
  'ShoppingBagIcon', 'ShoppingCartIcon', 'SlidersHorizontalIcon', 'SlidersIcon', 'StarIcon',
  'StorefrontIcon', 'TagIcon', 'TrashIcon', 'TruckIcon', 'UserIcon', 'WarningCircleIcon',
  'WarningIcon', 'XIcon',
];

describe('icon set', () => {
  it('exports exactly the listed icons', () => {
    expect(Object.keys(icons).sort()).toEqual([...EXPECTED].sort());
  });

  it.each(EXPECTED)('%s is exported from the package entry and renders an svg', (name) => {
    const Glyph = (pkg as Record<string, unknown>)[name] as React.ComponentType;
    expect(Glyph).toBeDefined();
    expect(Glyph).toBe((icons as Record<string, unknown>)[name]);
    const { container } = render(<Glyph />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('every icon name ends in Icon, so none can collide with a component', () => {
    for (const name of Object.keys(icons)) expect(name).toMatch(/^[A-Z][A-Za-z]*Icon$/);
    expect(Object.keys(icons)).not.toContain('Icon');
  });
});
