import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Switch } from './Switch';

afterEach(cleanup);

describe('Switch', () => {
  it('renders role="switch", off by default, with data-slot on root and thumb', () => {
    const { container } = render(<Switch aria-label="Substitution alerts" />);
    const sw = screen.getByRole('switch', { name: 'Substitution alerts' });
    expect(sw).toHaveAttribute('data-slot', 'switch');
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(sw).toHaveAttribute('data-size', 'md');
    expect(container.querySelector('[data-slot="switch-thumb"]')).toBeInTheDocument();
    for (const el of container.querySelectorAll('*')) expect(el).toHaveAttribute('data-slot');
  });

  it('is named by a separate <label htmlFor>', () => {
    render(
      <>
        <label htmlFor="alerts">Substitution alerts</label>
        <Switch id="alerts" />
      </>,
    );
    expect(screen.getByRole('switch', { name: 'Substitution alerts' })).toBeInTheDocument();
  });

  it('flips with a click, Space and Enter, reporting the new state at once', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="x" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole('switch');
    await userEvent.click(sw);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(sw).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard(' ');
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    await userEvent.keyboard('{Enter}');
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it('is reachable with Tab', async () => {
    render(<Switch aria-label="x" />);
    await userEvent.tab();
    expect(screen.getByRole('switch')).toHaveFocus();
  });

  it('works controlled', async () => {
    function Controlled() {
      const [on, setOn] = React.useState(true);
      return <Switch aria-label="x" checked={on} onCheckedChange={setOn} />;
    }
    render(<Controlled />);
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });

  it.each([
    ['sm', ['h-5', 'w-8'], ['size-4', 'data-[state=checked]:translate-x-3']],
    ['md', ['h-6', 'w-10'], ['size-5', 'data-[state=checked]:translate-x-4']],
  ] as const)('size %s maps to its classes', (size, rootClasses, thumbClasses) => {
    const { container } = render(<Switch aria-label="x" size={size} />);
    expect(screen.getByRole('switch')).toHaveClass(...rootClasses);
    expect(container.querySelector('[data-slot="switch-thumb"]')).toHaveClass(...thumbClasses);
  });

  it('disabled does not flip', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="x" disabled onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole('switch');
    expect(sw).toBeDisabled();
    await userEvent.click(sw);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('forwards the ref to the button', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Switch aria-label="x" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('merges className with cn', () => {
    render(<Switch aria-label="x" className="p-px" />);
    const sw = screen.getByRole('switch');
    expect(sw).toHaveClass('p-px');
    expect(sw).not.toHaveClass('p-0.5');
  });

  it('has a displayName', () => {
    expect(Switch.displayName).toBe('Switch');
  });
});
