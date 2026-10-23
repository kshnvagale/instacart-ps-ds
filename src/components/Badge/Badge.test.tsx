import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { Badge, type BadgeTone } from './Badge';

// No vitest globals, so Testing Library cannot clean up by itself.
afterEach(cleanup);

describe('Badge', () => {
  it('is a passive span with resolved defaults', () => {
    render(<Badge>12 oz</Badge>);
    const el = screen.getByText('12 oz');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveAttribute('data-slot', 'badge');
    expect(el).toHaveAttribute('data-tone', 'neutral');
    expect(el).toHaveAttribute('data-size', 'md');
    expect(el).not.toHaveAttribute('tabindex');
    expect(el).not.toHaveAttribute('role');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it.each([
    ['neutral', 'bg-badge-neutral', 'text-badge-neutral-fg'],
    ['success', 'bg-badge-success', 'text-badge-success-fg'],
    ['warning', 'bg-badge-warning', 'text-badge-warning-fg'],
    ['danger', 'bg-badge-danger', 'text-badge-danger-fg'],
    ['info', 'bg-badge-info', 'text-badge-info-fg'],
    ['brand', 'bg-badge-brand', 'text-badge-brand-fg'],
    ['sale', 'bg-badge-sale', 'text-badge-sale-fg'],
  ] as Array<[BadgeTone, string, string]>)('tone %s -> %s %s', (tone, bg, fg) => {
    render(<Badge tone={tone}>x</Badge>);
    const el = screen.getByText('x');
    expect(el).toHaveClass(bg, fg);
    expect(el).toHaveAttribute('data-tone', tone);
  });

  it.each([
    ['sm', 'type-caption'],
    ['md', 'type-label'],
  ] as const)('size %s -> %s', (size, cls) => {
    render(<Badge size={size}>x</Badge>);
    expect(screen.getByText('x')).toHaveClass(cls);
  });

  it('sizes a child icon unless the icon sets its own size', () => {
    render(
      <Badge tone="success">
        <svg data-testid="icon" />
        Delivered
      </Badge>,
    );
    const el = screen.getByText('Delivered');
    expect(el.firstChild).toBe(screen.getByTestId('icon'));
    expect(el.className).toContain("[&_svg:not([class*='size-'])]:size-icon-sm");
  });

  it('forwards the ref', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>x</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('merges className with cn', () => {
    render(
      <Badge size="md" className="px-3">
        x
      </Badge>,
    );
    const el = screen.getByText('x');
    expect(el).toHaveClass('px-3');
    expect(el).not.toHaveClass('px-2');
  });
});
