import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Input } from './Input';

afterEach(cleanup);

describe('Input', () => {
  it('renders a text input with data-slot and the default size', () => {
    render(<Input aria-label="Promo code" />);
    const input = screen.getByRole('textbox', { name: 'Promo code' });
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('data-slot', 'input');
    expect(input).toHaveAttribute('data-size', 'md');
  });

  it('is named by a separate <label htmlFor>', () => {
    render(
      <>
        <label htmlFor="phone">Phone number</label>
        <Input id="phone" type="tel" />
      </>,
    );
    expect(screen.getByLabelText('Phone number')).toHaveAttribute('type', 'tel');
  });

  it('has no label prop: an unknown `label` never reaches the DOM as text', () => {
    // @ts-expect-error label is not a prop
    render(<Input aria-label="x" label="Nope" />);
    expect(screen.queryByText('Nope')).toBeNull();
  });

  it.each([
    ['md', 'h-control-md', 'rounded-md', 'bg-surface-subtle'],
    ['lg', 'h-control-lg', 'rounded-md', 'bg-surface-subtle'],
    ['xl', 'h-control-xl', 'rounded-full', 'bg-surface'],
  ] as const)('size %s maps to its classes', (size, height, radius, fill) => {
    render(<Input aria-label="f" size={size} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(height, radius, fill);
    expect(input).toHaveAttribute('data-size', size);
  });

  it('passes `type` through', () => {
    render(<Input aria-label="Search" type="search" />);
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('shows the error state through aria-invalid only', () => {
    render(<Input aria-label="Promo code" aria-invalid aria-describedby="err" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeInvalid();
    expect(input.className).toContain('aria-invalid:border-action-danger');
  });

  it('disabled cannot be typed in', async () => {
    render(<Input aria-label="f" disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    await userEvent.type(input, 'abc');
    expect(input).toHaveValue('');
  });

  it('read-only keeps its value and stays focusable', async () => {
    render(<Input aria-label="Address" readOnly defaultValue="1 Ferry Building" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
    expect(input).not.toBeDisabled();
    await userEvent.type(input, 'xyz');
    expect(input).toHaveValue('1 Ferry Building');
    expect(document.activeElement).toBe(input);
  });

  it('accepts typing', async () => {
    render(<Input aria-label="f" />);
    await userEvent.type(screen.getByRole('textbox'), 'FRESH25');
    expect(screen.getByRole('textbox')).toHaveValue('FRESH25');
  });

  it('forwards the ref to the <input>', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input aria-label="f" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('merges className with cn (a later padding replaces ours)', () => {
    render(<Input aria-label="f" className="px-8" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('px-8');
    expect(input).not.toHaveClass('px-4');
  });

  it('has a displayName', () => {
    expect(Input.displayName).toBe('Input');
  });
});
