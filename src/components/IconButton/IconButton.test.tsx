import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { IconButton } from './IconButton';

// No Vitest globals, so Testing Library does not clean up by itself.
afterEach(cleanup);

const Plus = () => <svg data-testid="icon" viewBox="0 0 24 24" />;

describe('IconButton', () => {
  it('is a button named by its aria-label', () => {
    render(
      <IconButton aria-label="Add 1 lemon to cart">
        <Plus />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Add 1 lemon to cart' })).toBeInTheDocument();
  });

  it('requires aria-label in its type', () => {
    // @ts-expect-error: an IconButton without aria-label must not compile.
    const missing = <IconButton><Plus /></IconButton>;
    expect(missing).toBeTruthy();
  });

  it('carries its own data-slot and size', () => {
    render(
      <IconButton aria-label="Close" size="lg">
        <Plus />
      </IconButton>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-slot', 'icon-button');
    expect(button).toHaveAttribute('data-size', 'lg');
  });

  it('is a round square', () => {
    render(
      <IconButton aria-label="Close">
        <Plus />
      </IconButton>,
    );
    expect(screen.getByRole('button')).toHaveClass('rounded-full', 'size-control-md', 'p-0');
  });

  it.each([
    ['sm', 'size-control-sm'],
    ['md', 'size-control-md'],
    ['lg', 'size-control-lg'],
  ] as const)('size="%s" uses %s', (size, cls) => {
    render(
      <IconButton aria-label="Close" size={size}>
        <Plus />
      </IconButton>,
    );
    expect(screen.getByRole('button')).toHaveClass(cls);
  });

  it.each([
    ['primary', 'bg-action-primary'],
    ['secondary', 'bg-action-secondary'],
    ['tertiary', 'bg-action-tertiary'],
    ['danger', 'bg-action-danger'],
    ['neutral', 'bg-action-neutral'],
  ] as const)('variant="%s" uses %s', (variant, cls) => {
    render(
      <IconButton aria-label="Close" variant={variant}>
        <Plus />
      </IconButton>,
    );
    expect(screen.getByRole('button')).toHaveClass(cls);
  });

  it('loading swaps the icon for a Spinner, keeps the name, and ignores clicks', () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Add 1 lemon to cart" loading onClick={onClick}>
        <Plus />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Add 1 lemon to cart' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('[data-slot="spinner"]')).not.toBeNull();
    expect(button).toHaveClass('data-loading:[&>svg]:hidden');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards its ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <IconButton ref={ref} aria-label="Close">
        <Plus />
      </IconButton>,
    );
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('supports asChild', () => {
    render(
      <IconButton asChild aria-label="Open cart">
        <a href="/cart">
          <Plus />
        </a>
      </IconButton>,
    );
    const link = screen.getByRole('link', { name: 'Open cart' });
    expect(link).toHaveAttribute('data-slot', 'icon-button');
  });

  it('merges className through cn', () => {
    render(
      <IconButton aria-label="Close" className="shadow-raised">
        <Plus />
      </IconButton>,
    );
    expect(screen.getByRole('button')).toHaveClass('shadow-raised');
  });
});
