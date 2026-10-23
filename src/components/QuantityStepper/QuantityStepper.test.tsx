import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { QuantityStepper } from './QuantityStepper';

// No Vitest globals, so Testing Library does not clean up by itself.
afterEach(cleanup);

const dec = () => screen.getByRole('button', { name: 'Decrease quantity' });
const inc = () => screen.getByRole('button', { name: 'Increase quantity' });
const count = () => screen.getByRole('status');

describe('QuantityStepper', () => {
  it('is a group named by label, with two named buttons and a live count', () => {
    render(<QuantityStepper label="Quantity of Bananas" defaultValue={2} />);
    const group = screen.getByRole('group', { name: 'Quantity of Bananas' });
    expect(group).toHaveAttribute('data-slot', 'quantity-stepper');
    expect(dec()).toBeInTheDocument();
    expect(inc()).toBeInTheDocument();
    expect(count()).toHaveTextContent('2');
    expect(count()).toHaveAttribute('aria-live', 'polite');
    expect(count()).toHaveAttribute('data-slot', 'quantity-stepper-value');
  });

  it('requires label in its type', () => {
    // @ts-expect-error: a QuantityStepper without label must not compile.
    const missing = <QuantityStepper />;
    expect(missing).toBeTruthy();
  });

  it('is a pill', () => {
    render(<QuantityStepper label="Quantity of Bananas" />);
    expect(screen.getByRole('group')).toHaveClass('rounded-full', 'inline-flex');
  });

  it('uncontrolled: starts at min and counts up and down', () => {
    const onValueChange = vi.fn();
    render(<QuantityStepper label="Quantity of Bananas" onValueChange={onValueChange} />);
    expect(count()).toHaveTextContent('0');
    fireEvent.click(inc());
    fireEvent.click(inc());
    expect(count()).toHaveTextContent('2');
    fireEvent.click(dec());
    expect(count()).toHaveTextContent('1');
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual([1, 2, 1]);
  });

  it('controlled: shows value and reports, without changing by itself', () => {
    const onValueChange = vi.fn();
    render(<QuantityStepper label="Quantity of Bananas" value={3} onValueChange={onValueChange} />);
    fireEvent.click(inc());
    expect(onValueChange).toHaveBeenCalledWith(4);
    expect(count()).toHaveTextContent('3');
  });

  it('uses step', () => {
    render(<QuantityStepper label="Quantity of Bananas" defaultValue={2} step={2} />);
    fireEvent.click(inc());
    expect(count()).toHaveTextContent('4');
  });

  it('disables − at min and + at max', () => {
    const { rerender } = render(<QuantityStepper label="Quantity of Bananas" value={1} min={1} max={3} />);
    expect(dec()).toBeDisabled();
    expect(inc()).toBeEnabled();
    rerender(<QuantityStepper label="Quantity of Bananas" value={3} min={1} max={3} />);
    expect(dec()).toBeEnabled();
    expect(inc()).toBeDisabled();
  });

  it('disabled turns off both buttons', () => {
    const onValueChange = vi.fn();
    render(<QuantityStepper label="Quantity of Bananas" defaultValue={2} disabled onValueChange={onValueChange} />);
    expect(screen.getByRole('group')).toHaveAttribute('data-disabled');
    expect(dec()).toBeDisabled();
    expect(inc()).toBeDisabled();
    fireEvent.click(inc());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(count()).toHaveClass('text-content-disabled');
  });

  it.each([
    ['sm', 'size-control-sm', 'type-label'],
    ['md', 'size-control-md', 'type-label-lg'],
  ] as const)('size="%s" uses %s buttons', (size, buttonCls, typeCls) => {
    render(<QuantityStepper label="Quantity of Bananas" size={size} />);
    expect(screen.getByRole('group')).toHaveAttribute('data-size', size);
    expect(inc()).toHaveClass(buttonCls);
    expect(count()).toHaveClass(typeCls);
  });

  it('forwards its ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<QuantityStepper ref={ref} label="Quantity of Bananas" />);
    expect(ref.current).toBe(screen.getByRole('group'));
  });

  it('merges className through cn', () => {
    render(<QuantityStepper label="Quantity of Bananas" className="w-fit" />);
    expect(screen.getByRole('group')).toHaveClass('w-fit', 'rounded-full');
  });
});
