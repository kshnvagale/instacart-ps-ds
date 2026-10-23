import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { Link } from './Link';

// No Vitest globals, so Testing Library does not clean up by itself.
afterEach(cleanup);

describe('Link', () => {
  it('renders an <a> with its data-slot', () => {
    render(<Link href="/store/sprouts">Sprouts Farmers Market</Link>);
    const link = screen.getByRole('link', { name: 'Sprouts Farmers Market' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/store/sprouts');
    expect(link).toHaveAttribute('data-slot', 'link');
    expect(link).toHaveAttribute('data-variant', 'default');
  });

  it.each([
    ['default', 'text-content-link'],
    ['subtle', 'text-inherit'],
    ['inverse', 'text-content-inverse'],
  ] as const)('variant="%s" uses %s', (variant, cls) => {
    render(
      <Link href="/" variant={variant}>
        Home
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass(cls);
  });

  it('is underlined by default, with the tokenised offset and thickness', () => {
    render(<Link href="/">Home</Link>);
    expect(screen.getByRole('link')).toHaveClass(
      'underline',
      'underline-offset-(--link-underline-offset)',
      'decoration-(length:--link-underline-thickness)',
    );
  });

  it('underline="hover" shows the underline only on hover and focus', () => {
    render(
      <Link href="/" underline="hover">
        Home
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveClass('no-underline', 'hover:underline', 'focus-visible:underline');
    expect(link).not.toHaveClass('underline');
  });

  it('uses the focus-ring colour', () => {
    render(<Link href="/">Home</Link>);
    expect(screen.getByRole('link')).toHaveClass('focus-visible:outline-focus-ring');
  });

  it('external opens a new tab safely and tells screen readers', () => {
    const { container } = render(
      <Link href="https://docs.instacart.com/" external>
        Developer docs
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Developer docs (opens in a new tab)' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(container.querySelector('[data-slot="link-external-hint"]')).toHaveClass('sr-only');
  });

  it('external keeps an explicit rel', () => {
    render(
      <Link href="https://example.com" external rel="noopener">
        Example
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener');
  });

  it('is not external unless asked', () => {
    render(<Link href="/">Home</Link>);
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('asChild renders the router link with the link classes', () => {
    const RouterLink = React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'> & { to: string }>(
      ({ to, ...props }, ref) => <a ref={ref} href={to} data-router="" {...props} />,
    );
    RouterLink.displayName = 'RouterLink';
    render(
      <Link asChild variant="subtle">
        <RouterLink to="/store/sprouts">Sprouts Farmers Market</RouterLink>
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Sprouts Farmers Market' });
    expect(link).toHaveAttribute('href', '/store/sprouts');
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveAttribute('data-slot', 'link');
    expect(link).toHaveClass('text-inherit');
  });

  it('asChild with external puts the hint inside the child', () => {
    render(
      <Link asChild external>
        <a href="https://docs.instacart.com/">Developer docs</a>
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Developer docs (opens in a new tab)' });
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('forwards its ref', () => {
    const ref = React.createRef<HTMLAnchorElement>();
    render(
      <Link ref={ref} href="/">
        Home
      </Link>,
    );
    expect(ref.current).toBe(screen.getByRole('link'));
  });

  it('merges className through cn', () => {
    render(
      <Link href="/" className="text-content-strong">
        Home
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveClass('text-content-strong');
    expect(link).not.toHaveClass('text-content-link');
  });
});
