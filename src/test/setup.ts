import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Vitest runs without globals, so Testing Library cannot register its own
// automatic cleanup. Without this, renders pile up from one test to the next.
afterEach(cleanup);

/**
 * jsdom gaps that Radix primitives touch (some measure with ResizeObserver or
 * scroll items into view). Inert stand-ins: tests check behaviour and ARIA,
 * not layout.
 */
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

/**
 * A warning is a failed test. React reports every contract it thinks a
 * component broke (an unknown DOM prop, a missing key, a ref on a function
 * component, a controlled/uncontrolled switch) through `console.error`. A test
 * that expects a warning can mock console itself.
 */
let spies: Array<ReturnType<typeof vi.spyOn>> = [];

beforeEach(() => {
  spies = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')];
});

afterEach(() => {
  const calls = spies.flatMap((spy) => spy.mock.calls);
  spies.forEach((spy) => spy.mockRestore());
  if (calls.length) {
    throw new Error(`The test logged to console:\n${calls.map((c) => c.map(String).join(' ')).join('\n')}`);
  }
});
