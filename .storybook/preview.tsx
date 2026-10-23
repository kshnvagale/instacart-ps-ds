import * as React from 'react';
import type { Decorator, Preview } from '@storybook/react-vite';

/**
 * No CSS imports in this file (see main.ts and LEARNINGS §2.3).
 *
 * The light theme is the default on `:root`, and the page colour comes from
 * base.css, so a story renders correctly even when this decorator never runs
 * (which is what happens inside the design sync). The decorator only adds the
 * Theme toolbar, by setting `data-theme` on <html>.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme as 'light' | 'dark';

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    return () => root.removeAttribute('data-theme');
  }, [theme]);

  return (
    <div data-theme={theme} className="min-h-screen bg-surface p-6 text-content">
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Light or dark',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    // The page colour comes from the tokens and follows the Theme toolbar.
    // Storybook's backgrounds addon would paint over it and make every dark
    // review wrong.
    backgrounds: { disabled: true },
    layout: 'fullscreen',
    controls: { expanded: true },
    a11y: { test: 'error' },
    options: { storySort: { order: ['Foundations', 'Atoms'] } },
  },
};

export default preview;
