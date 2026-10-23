// Storybook's stylesheet, loaded as its own preview entry (see main.ts).
// Keep it out of preview.tsx: the design sync bundles that file without a CSS loader.
import './preview.css';
