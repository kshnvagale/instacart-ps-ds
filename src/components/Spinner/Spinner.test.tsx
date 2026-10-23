import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { Spinner } from './Spinner';

// No Vitest globals, so Testing Library does not clean up by itself.
afterEach(cleanup);

describe('Spinner', () => {
  it('is a status live region named by its label', () => {
    render(<Spinner label="Finding your shopper" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Finding your shopper');
  });

  it('defaults the label to "Loading"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });

  it('puts data-slot on every part', () => {
    const { container } = render(<Spinner />);
    for (const slot of ['spinner', 'spinner-icon', 'spinner-arc', 'spinner-label']) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    }
  });

  it('hides the drawing from assistive tech and keeps the label visually hidden', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('[data-slot="spinner-icon"]')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('[data-slot="spinner-label"]')).toHaveClass('sr-only');
  });

  it('turns through the tokenised keyframe class', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('[data-slot="spinner-icon"]')).toHaveClass('spinner-turn');
  });

  it.each([
    ['sm', 'size-icon-sm'],
    ['md', 'size-icon-lg'],
    ['lg', 'size-10'],
  ] as const)('size="%s" maps to %s', (size, cls) => {
    render(<Spinner size={size} />);
    const root = screen.getByRole('status');
    expect(root).toHaveClass(cls);
    expect(root).toHaveAttribute('data-size', size);
  });

  it.each([
    ['brand', 'text-content-brand'],
    ['muted', 'text-content-muted'],
    ['current', 'text-current'],
  ] as const)('tone="%s" maps to %s', (tone, cls) => {
    render(<Spinner tone={tone} />);
    expect(screen.getByRole('status')).toHaveClass(cls);
  });

  it('is decoration, not a live region, when aria-hidden', () => {
    const { container } = render(<Spinner aria-hidden="true" />);
    const root = container.querySelector('[data-slot="spinner"]');
    expect(root).not.toHaveAttribute('role');
    expect(container.querySelector('[data-slot="spinner-label"]')).toBeNull();
  });

  it('forwards its ref to the root', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('status'));
  });

  it('merges className through cn, so a consumer size wins', () => {
    render(<Spinner size="sm" className="size-icon-md" />);
    const root = screen.getByRole('status');
    expect(root).toHaveClass('size-icon-md');
    expect(root).not.toHaveClass('size-icon-sm');
  });
});
