import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { Price } from './Price';

const slot = (c: HTMLElement, name: string) => c.querySelector(`[data-slot="${name}"]`);

// No vitest globals, so Testing Library cannot clean up by itself.
afterEach(cleanup);

describe('Price', () => {
  it('formats the amount in USD / en-US by default', () => {
    const { container } = render(<Price amount={3.99} />);
    const root = slot(container, 'price')!;
    expect(root.tagName).toBe('SPAN');
    expect(root).toHaveAttribute('data-size', 'md');
    expect(root).toHaveAttribute('data-tone', 'default');
    const current = slot(container, 'price-current')!;
    expect(current.tagName).toBe('DATA');
    expect(current).toHaveAttribute('value', '3.99');
    expect(current).toHaveTextContent('$3.99');
    expect(root).toHaveTextContent(/^\$3\.99$/);
  });

  it('renders no was or unit parts unless asked', () => {
    const { container } = render(<Price amount={3.99} />);
    expect(slot(container, 'price-was')).toBeNull();
    expect(slot(container, 'price-unit')).toBeNull();
    expect(slot(container, 'price-label')).toBeNull();
  });

  it('formats with the given currency and locale', () => {
    const { container } = render(<Price amount={1234.5} currency="EUR" locale="de-DE" />);
    expect(slot(container, 'price-current')!.textContent).toBe(
      new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(1234.5),
    );
  });

  it('wasAmount renders a struck-through original price with a screen-reader label', () => {
    const { container } = render(<Price amount={2.99} wasAmount={3.99} tone="sale" />);
    const was = slot(container, 'price-was')!;
    expect(was.tagName).toBe('S');
    expect(was).toHaveTextContent('Original price $3.99');
    expect(slot(container, 'price-was-amount')).toHaveAttribute('value', '3.99');
    expect(slot(container, 'price-current')).toHaveTextContent('Current price $2.99');
    const labels = container.querySelectorAll('[data-slot="price-label"]');
    expect(labels).toHaveLength(2);
    labels.forEach((l) => expect(l).toHaveClass('sr-only'));
  });

  it('unitPrice shows "$0.42/oz" and reads "$0.42 per oz"', () => {
    const { container } = render(<Price amount={4.99} unitPrice={{ amount: 0.42, unit: 'oz' }} />);
    expect(slot(container, 'price-unit')).toBeInTheDocument();
    const visual = slot(container, 'price-unit-visual')!;
    expect(visual).toHaveTextContent('$0.42/oz');
    expect(visual).toHaveAttribute('aria-hidden', 'true');
    const label = slot(container, 'price-label')!;
    expect(label).toHaveTextContent('$0.42 per oz');
    expect(label).toHaveClass('sr-only');
  });

  it.each([
    ['sm', 'type-label', 'type-caption'],
    ['md', 'type-title', 'type-body-sm'],
    ['lg', 'type-h2', 'type-body'],
  ] as const)('size %s -> current %s, secondary %s', (size, cur, sec) => {
    const { container } = render(<Price amount={2.99} wasAmount={3.99} size={size} />);
    expect(slot(container, 'price-current')).toHaveClass(cur);
    expect(slot(container, 'price-was')).toHaveClass(sec);
  });

  it('tone sale puts the current price on the deal highlight', () => {
    const { container } = render(<Price amount={2.99} tone="sale" />);
    expect(slot(container, 'price-current')).toHaveClass('bg-badge-sale', 'text-badge-sale-fg');
    expect(slot(container, 'price')).toHaveAttribute('data-tone', 'sale');
  });

  it('tone default uses the strong content colour', () => {
    const { container } = render(<Price amount={2.99} />);
    const current = slot(container, 'price-current')!;
    expect(current).toHaveClass('text-content-strong');
    expect(current).not.toHaveClass('bg-badge-sale');
  });

  it('every rendered element has a data-slot', () => {
    const { container } = render(
      <Price amount={2.99} wasAmount={3.99} unitPrice={{ amount: 0.42, unit: 'oz' }} tone="sale" />,
    );
    container.querySelectorAll('*').forEach((el) => expect(el).toHaveAttribute('data-slot'));
  });

  it('forwards the ref and merges className with cn', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Price ref={ref} amount={1} className="gap-x-1" />);
    expect(ref.current).toHaveAttribute('data-slot', 'price');
    expect(ref.current).toHaveClass('gap-x-1');
    expect(ref.current).not.toHaveClass('gap-x-2');
  });

  it('passes other props to the root', () => {
    render(<Price amount={1} data-testid="p" id="price-1" />);
    expect(screen.getByTestId('p')).toHaveAttribute('id', 'price-1');
  });
});
