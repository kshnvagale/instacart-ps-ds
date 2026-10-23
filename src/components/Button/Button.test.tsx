import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { Button } from './Button';

// No Vitest globals, so Testing Library does not clean up by itself.
afterEach(cleanup);

describe('Button', () => {
  it('renders a button with its data-slot and state hooks', () => {
    render(
      <Button variant="danger" size="lg">
        Remove
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Remove' });
    expect(button).toHaveAttribute('data-slot', 'button');
    expect(button).toHaveAttribute('data-variant', 'danger');
    expect(button).toHaveAttribute('data-size', 'lg');
  });

  it('defaults to primary, md and type="button"', () => {
    render(<Button>Add to cart</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('keeps an explicit type', () => {
    render(<Button type="submit">Checkout</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('is a full pill with the focus-ring colour', () => {
    render(<Button>Add to cart</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-full', 'focus-visible:outline-focus-ring');
  });

  it.each([
    ['primary', 'bg-action-primary'],
    ['secondary', 'bg-action-secondary'],
    ['tertiary', 'bg-action-tertiary'],
    ['danger', 'bg-action-danger'],
    ['neutral', 'bg-action-neutral'],
  ] as const)('variant="%s" uses %s', (variant, cls) => {
    render(<Button variant={variant}>Add to cart</Button>);
    expect(screen.getByRole('button')).toHaveClass(cls);
  });

  it.each([
    ['sm', 'h-control-sm'],
    ['md', 'h-control-md'],
    ['lg', 'h-control-lg'],
    ['xl', 'h-control-xl'],
    ['icon-sm', 'size-control-sm'],
    ['icon-md', 'size-control-md'],
    ['icon-lg', 'size-control-lg'],
  ] as const)('size="%s" uses %s', (size, cls) => {
    render(
      <Button size={size} aria-label="Add to cart">
        Add
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveClass(cls);
  });

  it('calls onClick when idle', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Add to cart</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  describe('loading', () => {
    it('shows a Spinner, sets aria-busy and aria-disabled, and stays focusable', () => {
      const { container } = render(<Button loading>Add to cart</Button>);
      const button = screen.getByRole('button', { name: 'Add to cart' });
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('data-loading');
      expect(button).not.toBeDisabled();
      button.focus();
      expect(button).toHaveFocus();
      expect(container.querySelector('[data-slot="spinner"]')).not.toBeNull();
    });

    it('keeps the Spinner out of the accessible name and out of the live regions', () => {
      const { container } = render(<Button loading>Add to cart</Button>);
      const spinner = container.querySelector('[data-slot="spinner"]');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
      expect(spinner).not.toHaveAttribute('role');
      expect(screen.getByRole('button')).toHaveAccessibleName('Add to cart');
    });

    it('ignores clicks', () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Add to cart
        </Button>,
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('renders no Spinner when idle', () => {
      const { container } = render(<Button>Add to cart</Button>);
      expect(container.querySelector('[data-slot="spinner"]')).toBeNull();
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
    });
  });

  describe('disabled', () => {
    it('is natively disabled and marked for styling', () => {
      render(<Button disabled>Checkout</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('data-disabled');
      expect(button).toHaveClass('data-disabled:bg-action-disabled');
    });

    it('does not call onClick', () => {
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          Checkout
        </Button>,
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('asChild', () => {
    it('renders the child element with the button classes and data-slot', () => {
      render(
        <Button asChild variant="secondary">
          <a href="/store/sprouts">Browse Sprouts Farmers Market</a>
        </Button>,
      );
      const link = screen.getByRole('link', { name: 'Browse Sprouts Farmers Market' });
      expect(link).toHaveAttribute('href', '/store/sprouts');
      expect(link).toHaveAttribute('data-slot', 'button');
      expect(link).toHaveClass('bg-action-secondary', 'rounded-full');
      expect(link).not.toHaveAttribute('type');
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('blocks the click on a disabled link, which has no native disabled', () => {
      const onClick = vi.fn();
      render(
        <Button asChild disabled onClick={onClick}>
          <a href="/checkout">Checkout</a>
        </Button>,
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).not.toHaveAttribute('disabled');
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('puts the loading Spinner inside the child', () => {
      render(
        <Button asChild loading>
          <a href="/checkout">Checkout</a>
        </Button>,
      );
      const link = screen.getByRole('link', { name: 'Checkout' });
      expect(link.querySelector('[data-slot="spinner"]')).not.toBeNull();
      expect(link).toHaveAttribute('aria-busy', 'true');
    });
  });

  it('forwards its ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Add to cart</Button>);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('merges className through cn, so a consumer class wins a conflict', () => {
    render(
      <Button size="md" className="w-full px-6">
        Add to cart
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full', 'px-6');
    expect(button).not.toHaveClass('px-4');
  });

  it('passes other props through', () => {
    render(<Button aria-describedby="fees">Checkout</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'fees');
  });
});
