import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Avatar, getInitials } from './Avatar';

/**
 * jsdom never loads images, so Radix would always show the fallback. This
 * stand-in reports every image as loaded, to test the photo path.
 */
function stubLoadedImages() {
  class LoadedImage {
    complete = true;
    naturalWidth = 1;
    src = '';
    referrerPolicy = '';
    crossOrigin: string | null = null;
    addEventListener() {}
    removeEventListener() {}
  }
  vi.stubGlobal('Image', LoadedImage);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const slot = (c: HTMLElement, name: string) => c.querySelector(`[data-slot="${name}"]`);

describe('getInitials', () => {
  it.each([
    ['Maria Lopez', 'ML'],
    ['maria lopez', 'ML'],
    ['Maria de la Cruz', 'MC'],
    ['Maria', 'M'],
    ['  Sam   Patel  ', 'SP'],
    ['Élodie Ünal', 'ÉÜ'],
    ['', ''],
    [undefined, ''],
  ])('%s -> %s', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});

describe('Avatar', () => {
  it('shows initials from the name, hidden from screen readers', () => {
    const { container } = render(<Avatar name="Maria Lopez" />);
    const fallback = slot(container, 'avatar-fallback')!;
    expect(fallback).toHaveTextContent('ML');
    expect(fallback).toHaveAttribute('aria-hidden', 'true');
  });

  it('sets data-slot="avatar" on the root', () => {
    const { container } = render(<Avatar name="Maria Lopez" />);
    expect(container.firstElementChild).toHaveAttribute('data-slot', 'avatar');
  });

  it('is one image named by `name`', () => {
    render(<Avatar name="Maria Lopez" />);
    const img = screen.getByRole('img', { name: 'Maria Lopez' });
    expect(img).toHaveAttribute('data-slot', 'avatar');
  });

  it('`alt` overrides the name', () => {
    render(<Avatar name="Maria Lopez" alt="Maria Lopez, your shopper" />);
    expect(screen.getByRole('img', { name: 'Maria Lopez, your shopper' })).toBeInTheDocument();
  });

  it('alt="" makes it decorative: no role, no name', () => {
    const { container } = render(<Avatar name="Maria Lopez" alt="" />);
    const root = slot(container, 'avatar')!;
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('aria-label');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows the photo once it loads, with data-slot, and hides the initials', () => {
    stubLoadedImages();
    const { container } = render(<Avatar src="/maria.png" name="Maria Lopez" />);
    const image = slot(container, 'avatar-image')!;
    expect(image).not.toBeNull();
    expect(image).toHaveAttribute('src', '/maria.png');
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveClass('object-cover');
    expect(slot(container, 'avatar-fallback')).toBeNull();
    // The root still carries the one name.
    expect(screen.getByRole('img', { name: 'Maria Lopez' })).toBe(slot(container, 'avatar'));
  });

  it('shows the initials while the photo has not loaded', () => {
    const { container } = render(<Avatar src="/maria.png" name="Maria Lopez" />);
    expect(slot(container, 'avatar-image')).toBeNull();
    expect(slot(container, 'avatar-fallback')).toHaveTextContent('ML');
  });

  it('children replace the initials', () => {
    const { container } = render(
      <Avatar name="Maria Lopez">
        <svg data-testid="icon" />
      </Avatar>,
    );
    const fallback = slot(container, 'avatar-fallback')!;
    expect(fallback.querySelector('[data-testid="icon"]')).not.toBeNull();
    expect(fallback).not.toHaveTextContent('ML');
  });

  it('maps size to spacing tokens and a type role, md by default', () => {
    const expected = { sm: 'size-6', md: 'size-8', lg: 'size-10', xl: 'size-16' } as const;
    const { container, rerender } = render(<Avatar name="Maria Lopez" />);
    const root = () => slot(container, 'avatar')!;
    expect(root()).toHaveClass('size-8', 'type-label');
    expect(root()).toHaveAttribute('data-size', 'md');
    for (const [size, cls] of Object.entries(expected)) {
      rerender(<Avatar name="Maria Lopez" size={size as keyof typeof expected} />);
      expect(root()).toHaveClass(cls, 'rounded-full');
      expect(root()).toHaveAttribute('data-size', size);
    }
  });

  it('maps tone to the fallback colours, neutral by default', () => {
    const { container, rerender } = render(<Avatar name="Maria Lopez" />);
    const root = () => slot(container, 'avatar')!;
    expect(root()).toHaveClass('bg-surface-active', 'text-content-strong');
    rerender(<Avatar name="Maria Lopez" tone="brand" />);
    expect(root()).toHaveClass('bg-surface-brand', 'text-content-on-brand');
    expect(root()).toHaveAttribute('data-tone', 'brand');
  });

  it('forwards the ref to the root span', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} name="Maria Lopez" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveAttribute('data-slot', 'avatar');
  });

  it('merges className through cn (a later size wins)', () => {
    const { container } = render(<Avatar name="Maria Lopez" size="sm" className="size-12 mt-2" />);
    const root = slot(container, 'avatar')!;
    expect(root).toHaveClass('size-12', 'mt-2');
    expect(root).not.toHaveClass('size-6');
  });
});
