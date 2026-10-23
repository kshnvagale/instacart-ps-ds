// Copies the package stylesheets into dist/styles, so `instacart-ps-ds/styles.css`
// resolves. Tests and the standalone build input are not shipped.
//
// Also copies the DM Sans font files into dist/files. The standalone build inlines
// the @fontsource @font-face rules with `url(./files/…)`, relative to
// dist/instacart.standalone.css, so the files must sit next to it or the font is lost.
import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const from = 'src/styles';
const to = 'dist/styles';
mkdirSync(to, { recursive: true });
for (const name of readdirSync(from)) {
  if (!name.endsWith('.css') || name === 'standalone.css') continue;
  cpSync(join(from, name), join(to, name));
}
console.log(`copied styles to ${to}`);

// Only the variable-weight upright files: the only ones fonts.css loads.
const fonts = 'node_modules/@fontsource-variable/dm-sans/files';
const fontsTo = 'dist/files';
mkdirSync(fontsTo, { recursive: true });
for (const name of readdirSync(fonts)) {
  if (!/^dm-sans-latin(-ext)?-wght-normal\.woff2$/.test(name)) continue;
  cpSync(join(fonts, name), join(fontsTo, name));
}
console.log(`copied fonts to ${fontsTo}`);
