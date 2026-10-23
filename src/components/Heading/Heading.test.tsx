import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { Heading, type HeadingLevel } from './Heading';

// No vitest globals, so Testing Library cannot clean up by itself.
afterEach(cleanup);

describe('Heading', () => {
  it('renders the element named by `as`, in the strong tone', () => {
    render(<Heading as="h2">Often Bought With</Heading>);
    const el = screen.getByRole('heading', { level: 2, name: 'Often Bought With' });
    expect(el).toHaveAttribute('data-slot', 'heading');
    expect(el).toHaveAttribute('data-tone', 'strong');
    expect(el).toHaveClass('type-h2', 'text-content-strong');
  });

  it.each([
    ['h1', 'type-h1'],
    ['h2', 'type-h2'],
    ['h3', 'type-h3'],
    ['h4', 'type-title'],
    ['h5', 'type-title'],
    ['h6', 'type-title'],
  ] as Array<[HeadingLevel, string]>)('as=%s with no variant gets %s', (as, cls) => {
    render(<Heading as={as}>x</Heading>);
    const el = screen.getByRole('heading', { level: Number(as[1]) });
    expect(el.tagName).toBe(as.toUpperCase());
    expect(el).toHaveClass(cls);
  });

  it('variant sets the look apart from the level', () => {
    render(
      <Heading as="h3" variant="display">
        Order groceries
      </Heading>,
    );
    const el = screen.getByRole('heading', { level: 3 });
    expect(el).toHaveClass('type-display');
    expect(el).not.toHaveClass('type-h3');
    expect(el).toHaveAttribute('data-variant', 'display');
  });

  it.each([
    ['strong', 'text-content-strong'],
    ['default', 'text-content'],
    ['brand', 'text-content-brand'],
    ['inverse', 'text-content-inverse'],
  ] as const)('tone %s -> %s', (tone, cls) => {
    render(
      <Heading as="h2" tone={tone}>
        x
      </Heading>,
    );
    expect(screen.getByRole('heading')).toHaveClass(cls);
  });

  it('asChild renders the child heading with merged props', () => {
    render(
      <Heading as="h2" asChild variant="title">
        <h4>Items to add next</h4>
      </Heading>,
    );
    const el = screen.getByRole('heading', { level: 4 });
    expect(el).toHaveAttribute('data-slot', 'heading');
    expect(el).toHaveClass('type-title');
  });

  it('forwards the ref', () => {
    const ref = React.createRef<HTMLHeadingElement>();
    render(<Heading as="h1" ref={ref}>x</Heading>);
    expect(ref.current?.tagName).toBe('H1');
  });

  it('merges className with cn', () => {
    render(
      <Heading as="h2" className="type-h3 text-content-brand">
        x
      </Heading>,
    );
    const el = screen.getByRole('heading');
    expect(el).toHaveClass('type-h3', 'text-content-brand');
    expect(el).not.toHaveClass('type-h2');
    expect(el).not.toHaveClass('text-content-strong');
  });

  it('requires `as` by its type', () => {
    // @ts-expect-error `as` is required
    const el = <Heading>x</Heading>;
    expect(el).toBeTruthy();
  });
});
