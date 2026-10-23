import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShoppingCart } from '@phosphor-icons/react';

import { Icon } from './Icon';

describe('Icon', () => {
  it('renders its child svg inside a data-slot wrapper', () => {
    const { container } = render(
      <Icon>
        <ShoppingCart />
      </Icon>,
    );
    const root = container.querySelector('[data-slot="icon"]');
    expect(root).not.toBeNull();
    expect(root!.querySelector('svg')).not.toBeNull();
  });

  it('is decorative by default: aria-hidden, no role', () => {
    const { container } = render(
      <Icon>
        <ShoppingCart />
      </Icon>,
    );
    const root = container.querySelector('[data-slot="icon"]')!;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('role');
  });

  it('with a label it is an image with that name, and not hidden', () => {
    render(
      <Icon label="Cart">
        <ShoppingCart />
      </Icon>,
    );
    const img = screen.getByRole('img', { name: 'Cart' });
    expect(img).toHaveAttribute('data-slot', 'icon');
    expect(img).not.toHaveAttribute('aria-hidden');
  });

  it('maps size to the icon size tokens, md by default', () => {
    const { container, rerender } = render(
      <Icon>
        <ShoppingCart />
      </Icon>,
    );
    const root = () => container.querySelector('[data-slot="icon"]')!;
    expect(root()).toHaveClass('size-icon-md');
    for (const size of ['sm', 'md', 'lg'] as const) {
      rerender(
        <Icon size={size}>
          <ShoppingCart />
        </Icon>,
      );
      expect(root()).toHaveClass(`size-icon-${size}`);
      expect(root()).toHaveAttribute('data-size', size);
    }
  });

  it('makes the svg fill the wrapper, so Phosphor needs no size prop', () => {
    const { container } = render(
      <Icon>
        <ShoppingCart />
      </Icon>,
    );
    expect(container.querySelector('[data-slot="icon"]')).toHaveClass('[&>svg]:size-full');
  });

  it('inherits colour by default and maps tones to text colours', () => {
    const { container, rerender } = render(
      <Icon>
        <ShoppingCart />
      </Icon>,
    );
    const root = () => container.querySelector('[data-slot="icon"]')!;
    expect(root().className).not.toMatch(/\btext-/);
    const map = {
      default: 'text-content',
      strong: 'text-content-strong',
      muted: 'text-content-muted',
      brand: 'text-content-brand',
      success: 'text-success-fg',
      warning: 'text-warning-fg',
      danger: 'text-danger-fg',
    } as const;
    for (const [tone, cls] of Object.entries(map)) {
      rerender(
        <Icon tone={tone as keyof typeof map}>
          <ShoppingCart />
        </Icon>,
      );
      expect(root()).toHaveClass(cls);
    }
  });

  it('forwards the ref to the wrapper span', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Icon ref={ref}>
        <ShoppingCart />
      </Icon>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveAttribute('data-slot', 'icon');
  });

  it('merges className through cn (a later size wins)', () => {
    const { container } = render(
      <Icon size="sm" className="size-icon-lg mt-1">
        <ShoppingCart />
      </Icon>,
    );
    const root = container.querySelector('[data-slot="icon"]')!;
    expect(root).toHaveClass('size-icon-lg', 'mt-1');
    expect(root).not.toHaveClass('size-icon-sm');
  });
});
