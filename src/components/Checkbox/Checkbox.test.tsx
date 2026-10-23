import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Checkbox } from './Checkbox';

afterEach(cleanup);

describe('Checkbox', () => {
  it('renders role="checkbox" with data-slot, unchecked by default', () => {
    render(<Checkbox aria-label="Leave at door" />);
    const box = screen.getByRole('checkbox', { name: 'Leave at door' });
    expect(box).toHaveAttribute('data-slot', 'checkbox');
    expect(box).toHaveAttribute('aria-checked', 'false');
    expect(box).toHaveAttribute('data-state', 'unchecked');
  });

  it('is named by a separate <label htmlFor>', () => {
    render(
      <>
        <Checkbox id="lad" />
        <label htmlFor="lad">Leave at door</label>
      </>,
    );
    expect(screen.getByRole('checkbox', { name: 'Leave at door' })).toBeInTheDocument();
  });

  it('checked: shows the indicator and the check mark, each with data-slot', () => {
    const { container } = render(<Checkbox aria-label="x" defaultChecked />);
    const box = screen.getByRole('checkbox');
    expect(box).toHaveAttribute('aria-checked', 'true');
    expect(box).toHaveClass('data-[state=checked]:bg-action-primary');
    expect(container.querySelector('[data-slot="checkbox-indicator"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="checkbox-check"]')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('[data-slot="checkbox-dash"]')).toBeInTheDocument();
  });

  it('every rendered element carries a data-slot', () => {
    const { container } = render(<Checkbox aria-label="x" defaultChecked />);
    for (const el of container.querySelectorAll('*')) {
      if (el.closest('svg') && el.tagName.toLowerCase() === 'path') continue;
      expect(el).toHaveAttribute('data-slot');
    }
  });

  it('indeterminate reports aria-checked="mixed"', () => {
    render(<Checkbox aria-label="Select all" checked="indeterminate" />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
  });

  it('toggles with a click and with Space, and reports the new state', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="x" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole('checkbox');
    await userEvent.click(box);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(box).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard(' ');
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(box).toHaveAttribute('aria-checked', 'false');
  });

  it('is reachable with Tab', async () => {
    render(<Checkbox aria-label="x" />);
    await userEvent.tab();
    expect(screen.getByRole('checkbox')).toHaveFocus();
  });

  it('disabled does not toggle', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="x" disabled onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole('checkbox');
    expect(box).toBeDisabled();
    await userEvent.click(box);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(box).toHaveAttribute('aria-checked', 'false');
  });

  it('shows the error state through aria-invalid', () => {
    render(<Checkbox aria-label="x" aria-invalid />);
    const box = screen.getByRole('checkbox');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveClass('aria-invalid:border-action-danger');
  });

  it('sends its value with a form when ticked', () => {
    const { container } = render(
      <form>
        <Checkbox aria-label="Leave at door" name="leaveAtDoor" defaultChecked />
      </form>,
    );
    const data = new FormData(container.querySelector('form')!);
    expect(data.get('leaveAtDoor')).toBe('on');
  });

  it('forwards the ref to the button', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Checkbox aria-label="x" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('merges className with cn', () => {
    render(<Checkbox aria-label="x" className="rounded-md" />);
    const box = screen.getByRole('checkbox');
    expect(box).toHaveClass('rounded-md');
    expect(box).not.toHaveClass('rounded-sm');
  });

  it('has a displayName', () => {
    expect(Checkbox.displayName).toBe('Checkbox');
  });
});
