import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { Text, type TextTone, type TextVariant } from './Text';

// No vitest globals, so Testing Library cannot clean up by itself.
afterEach(cleanup);

describe('Text', () => {
  it('renders a <p> with the body role and default tone', () => {
    render(<Text>Delivery by 7:30am</Text>);
    const el = screen.getByText('Delivery by 7:30am');
    expect(el.tagName).toBe('P');
    expect(el).toHaveAttribute('data-slot', 'text');
    expect(el).toHaveAttribute('data-variant', 'body');
    expect(el).toHaveAttribute('data-tone', 'default');
    expect(el).toHaveClass('type-body', 'text-content');
  });

  it.each([
    ['body-lg', 'type-body-lg'],
    ['body', 'type-body'],
    ['body-sm', 'type-body-sm'],
    ['caption', 'type-caption'],
    ['label', 'type-label'],
    ['label-lg', 'type-label-lg'],
  ] as Array<[TextVariant, string]>)('variant %s -> %s', (variant, cls) => {
    render(<Text variant={variant}>x</Text>);
    expect(screen.getByText('x')).toHaveClass(cls);
  });

  it.each([
    ['default', 'text-content'],
    ['strong', 'text-content-strong'],
    ['muted', 'text-content-muted'],
    ['brand', 'text-content-brand'],
    ['danger', 'text-danger-fg'],
    ['inverse', 'text-content-inverse'],
  ] as Array<[TextTone, string]>)('tone %s -> %s', (tone, cls) => {
    render(<Text tone={tone}>x</Text>);
    expect(screen.getByText('x')).toHaveClass(cls);
  });

  it.each(['p', 'span', 'div', 'label'] as const)('as=%s renders that element', (as) => {
    render(<Text as={as}>x</Text>);
    expect(screen.getByText('x').tagName).toBe(as.toUpperCase());
  });

  it('as="label" names its control', () => {
    render(
      <>
        <Text as="label" variant="label" htmlFor="notes">
          Delivery instructions
        </Text>
        <input id="notes" />
      </>,
    );
    expect(screen.getByLabelText('Delivery instructions').tagName).toBe('INPUT');
  });

  it('asChild renders the child with merged classes and data-slot', () => {
    render(
      <Text asChild variant="caption" className="mt-2">
        <small>Fine print</small>
      </Text>,
    );
    const el = screen.getByText('Fine print');
    expect(el.tagName).toBe('SMALL');
    expect(el).toHaveAttribute('data-slot', 'text');
    expect(el).toHaveClass('type-caption', 'mt-2');
  });

  it('forwards the ref', () => {
    const ref = React.createRef<HTMLElement>();
    render(<Text ref={ref}>x</Text>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });

  it('merges className with cn: a later type role and colour win', () => {
    render(
      <Text variant="body" tone="muted" className="type-caption text-content-strong">
        x
      </Text>,
    );
    const el = screen.getByText('x');
    expect(el).toHaveClass('type-caption', 'text-content-strong');
    expect(el).not.toHaveClass('type-body');
    expect(el).not.toHaveClass('text-content-muted');
  });
});
