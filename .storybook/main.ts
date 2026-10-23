import type { StorybookConfig } from '@storybook/react-vite';

/** DOM attributes listed in the props tables (see `propFilter` below). */
const HTML_PROPS = new Set(['disabled', 'required', 'readOnly', 'placeholder', 'name', 'type']);

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // The stylesheet loads from its own preview entry, NOT from preview.tsx.
  // The design sync bundles preview.tsx's decorators with no CSS loader; in SSX
  // a CSS import there made every decorator silently fail (LEARNINGS §2.3).
  previewAnnotations: async (entries = []) => [...entries, './.storybook/styles.ts'],
  typescript: {
    // The props tables come from the TSDoc on each props interface, so the docs
    // cannot drift from the types.
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // Name each export by its export name, so a cva recipe exported next to a
      // component never steals the component's docs (an SSX bug).
      componentNameResolver: (exp) => {
        const name = exp.getName();
        return name === 'default' || name === '__function' ? undefined : name;
      },
      propFilter: (prop, component) => {
        if (!prop.parent) return true;
        const file = prop.parent.fileName;
        if (!/node_modules/.test(file)) return true;
        // Props declared by the Radix primitives we wrap ARE our API
        // (`checked`, `onCheckedChange` on Checkbox and Switch).
        if (/node_modules\/@radix-ui\//.test(file)) return true;
        if (HTML_PROPS.has(prop.name)) return component.name !== 'Icon';
        return component.name === 'Link' && (prop.name === 'href' || prop.name === 'target');
      },
    },
  },
};

export default config;
