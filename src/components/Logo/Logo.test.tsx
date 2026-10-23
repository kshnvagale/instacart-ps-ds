import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Logo } from './Logo';

const slots = (c: HTMLElement, name: string) => c.querySelectorAll(`[data-slot="${name}"]`);

describe('Logo', () => {
  it('is an image named "Instacart" by default', () => {
    render(<Logo />);
    const img = screen.getByRole('img', { name: 'Instacart' });
    expect(img.tagName.toLowerCase()).toBe('svg');
    expect(img).toHaveAttribute('data-slot', 'logo');
  });

  it('takes a custom title as its name', () => {
    render(<Logo title="Instacart home" />);
    expect(screen.getByRole('img', { name: 'Instacart home' })).toBeInTheDocument();
  });

  it('an empty title hides it from screen readers', () => {
    const { container } = render(<Logo title="" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
    expect(svg.querySelector('title')).toBeNull();
  });

  it('puts data-slot on every element it renders', () => {
    const { container } = render(<Logo />);
    for (const el of container.querySelectorAll('svg, svg *')) expect(el).toHaveAttribute('data-slot');
    expect(slots(container, 'logo-title')).toHaveLength(1);
    expect(slots(container, 'logo-leaves')).toHaveLength(1);
    expect(slots(container, 'logo-root')).toHaveLength(1);
    expect(slots(container, 'logo-letter')).toHaveLength(9);
  });

  it('full is the wordmark; mark is the carrot alone', () => {
    const { container, rerender } = render(<Logo />);
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 345.2 54.4');
    rerender(<Logo variant="mark" />);
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 42.3 52.9');
    expect(container.querySelector('svg')).toHaveAttribute('data-variant', 'mark');
    expect(slots(container, 'logo-letter')).toHaveLength(0);
    expect(slots(container, 'logo-leaves')).toHaveLength(1);
  });

  it('colours every part with logo tokens, per tone', () => {
    const expected = {
      color: ['fill-logo-lime', 'fill-logo-carrot', 'fill-logo-kale'],
      cashew: ['fill-logo-lime', 'fill-logo-carrot', 'fill-logo-cashew'],
      white: ['fill-logo-white', 'fill-logo-white', 'fill-logo-white'],
    } as const;
    for (const [tone, [leaves, root, letters]] of Object.entries(expected)) {
      const { container, unmount } = render(<Logo tone={tone as keyof typeof expected} />);
      expect(slots(container, 'logo-leaves')[0]).toHaveClass(leaves);
      expect(slots(container, 'logo-root')[0]).toHaveClass(root);
      for (const l of slots(container, 'logo-letter')) expect(l).toHaveClass(letters);
      expect(container.querySelector('svg')).toHaveAttribute('data-tone', tone);
      unmount();
    }
  });

  it('never carries a raw colour in the markup', () => {
    const { container } = render(<Logo />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b|fill="/i);
  });

  it('maps size to token heights (sm is the 20px minimum), md by default', () => {
    const { container, rerender } = render(<Logo />);
    const svg = () => container.querySelector('svg')!;
    expect(svg()).toHaveClass('h-6', 'w-auto');
    rerender(<Logo size="sm" />);
    expect(svg()).toHaveClass('h-5');
    rerender(<Logo size="lg" />);
    expect(svg()).toHaveClass('h-8');
  });

  it('forwards the ref to the svg', () => {
    const ref = React.createRef<SVGSVGElement>();
    render(<Logo ref={ref} />);
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
  });

  it('merges className through cn (a later height wins)', () => {
    const { container } = render(<Logo size="sm" className="h-10" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveClass('h-10');
    expect(svg).not.toHaveClass('h-5');
  });
});
