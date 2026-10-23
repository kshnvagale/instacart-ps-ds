/**
 * Generates the colour ramps in `tokens/primitive.color.json`.
 *
 * Run it by hand (`node scripts/generate-ramps.mjs`) only when an anchor
 * changes. The JSON it writes is the source of truth that `build-tokens.mjs`
 * reads; this script just records HOW the in-between steps were made, so no
 * value is invented by hand.
 *
 * The rules:
 *   - An ANCHOR is a value Instacart publishes or ships (see brand/brand.md).
 *     Each anchor lands EXACTLY on its step, byte for byte.
 *   - A step between two anchors is an OKLCH interpolation between them
 *     (lightness, chroma and hue move in a straight line). OKLCH, because its
 *     lightness is perceptual: equal steps look equal.
 *   - A step past the last anchor (the palest tint, the darkest shade) needs a
 *     target to interpolate toward. Those targets are ours, written below as
 *     OKLCH, and marked "generated" in the JSON.
 *   - If a generated colour falls outside sRGB, its chroma is reduced until it
 *     fits (hue and lightness kept).
 *
 * Steps run 1 (lightest) to 12 (darkest) in every ramp.
 *
 * No dependencies: node builtins only.
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '..', 'tokens', 'primitive.color.json');

// ---- colour maths (sRGB <-> OKLab, Björn Ottosson's matrices) ---------------

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function rgbToOklch([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  const H = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return [L, C, H];
}

function oklchToLinearRgb([L, C, H]) {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb) => rgb.every((c) => c >= -1e-6 && c <= 1 + 1e-6);

function oklchToHex([L, C, H]) {
  let c = C;
  let lin = oklchToLinearRgb([L, c, H]);
  // Reduce chroma until the colour fits in sRGB.
  while (!inGamut(lin) && c > 0) {
    c = Math.max(0, c - 0.001);
    lin = oklchToLinearRgb([L, c, H]);
  }
  return (
    '#' +
    lin
      .map((v) => Math.round(Math.min(1, Math.max(0, fromLinear(Math.min(1, Math.max(0, v))))) * 255))
      .map((v) => v.toString(16).padStart(2, '0').toUpperCase())
      .join('')
  );
}

/** Interpolate hue the short way round the circle. */
function mixHue(h1, h2, t) {
  let d = h2 - h1;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return (h1 + d * t + 360) % 360;
}

function mix(a, b, t) {
  // A near-grey has no meaningful hue; borrow the other end's.
  const ha = a[1] < 0.005 ? b[2] : a[2];
  const hb = b[1] < 0.005 ? a[2] : b[2];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, mixHue(ha, hb, t)];
}

// ---- the ramps ----------------------------------------------------------------
// `anchors`: Instacart values, exact. `targets`: our OKLCH end points, only where
// a ramp has no anchor at its end. Every other step is interpolated.

const RAMPS = {
  green: {
    description:
      'Instacart green. Anchors are the IDS brand-primary tokens and the brand guide\'s Lime, all from brand/brand.md. Steps 3-7 and 12 are generated (OKLCH interpolation).',
    anchors: {
      1: ['#F6FDF6', '--ids-color-brand-primary-extra-light (measured token, https://www.instacart.com/)'],
      2: ['#E9FBE9', '--ids-color-brand-primary-light (measured token, https://www.instacart.com/)'],
      8: ['#0AAD0A', 'Lime, brand guide (published, https://heyitsinstacart.com/color). Fill and dark-mode action only: 3.00:1 on white, so never text on light.'],
      9: ['#108910', '--ids-color-brand-primary-regular (measured token, https://www.instacart.com/). The light-mode action and green text colour: 4.56:1 with white.'],
      10: ['#0D720D', '--ids-color-brand-primary-dark (measured token, https://www.instacart.com/)'],
      11: ['#0A610A', '--ids-color-brand-primary-extra-dark (measured token, https://www.instacart.com/)'],
    },
    targets: { 12: [0.3, 0.07, 142.5] },
  },
  orange: {
    description:
      'Instacart Carrot. The only anchor is Carrot (step 9). Every other step is generated (OKLCH interpolation toward our own pale and dark end points). Spot colour only: the brand guide says never body copy.',
    anchors: {
      9: ['#FF7009', 'Carrot, brand guide (published, https://heyitsinstacart.com/color) and the logo SVG fill'],
    },
    targets: { 1: [0.985, 0.012, 60], 12: [0.34, 0.08, 45] },
  },
  neutral: {
    description:
      'Cool UI greys. Every step except 4 is an IDS grayscale token measured on https://www.instacart.com/ (brand/brand.md, "Greys"). Step 4 is generated (OKLCH interpolation between 3 and 5), for hover fills.',
    anchors: {
      1: ['#FFFFFF', '--ids-color-system-grayscale-00 (measured token)'],
      2: ['#F6F7F8', '--ids-color-system-grayscale-10 (measured token): quiet fills, search field'],
      3: ['#E8E9EB', '--ids-color-system-grayscale-20 (measured token): secondary button fill, card borders'],
      5: ['#C7C8CD', '--ids-color-system-grayscale-30 (measured token): outline button and field borders'],
      6: ['#8F939B', '--ids-color-system-grayscale-40 (measured token). 3.08:1 on white: icons and placeholders only, never text.'],
      7: ['#72767E', '--ids-color-system-grayscale-50 (measured token): secondary text on the aisle page'],
      8: ['#56595E', '--ids-color-system-grayscale-60 (measured token): secondary text on the product page'],
      9: ['#343538', '--ids-color-system-grayscale-70 (measured token): main body text'],
      10: ['#242529', '--ids-color-system-grayscale-80 (measured token): headings, button text on grey'],
      11: ['#191A1C', '--ids-color-system-grayscale-90 (measured token)'],
      12: ['#0B0C0D', '--ids-color-system-grayscale-99 (measured token)'],
    },
    targets: {},
  },
  red: {
    description:
      'Danger. Anchors are the IDS feedback-detrimental tokens (brand/brand.md, "Status colours"). Steps 1, 3-8 and 12 are generated (OKLCH interpolation).',
    anchors: {
      2: ['#FEF0F0', '--ids-color-system-feedback-detrimental-light (measured token, https://www.instacart.com/)'],
      9: ['#DE3534', '--ids-color-system-feedback-detrimental-regular (measured token, https://www.instacart.com/)'],
      10: ['#BB1C1B', '--ids-color-system-feedback-detrimental-dark (measured token, https://www.instacart.com/)'],
      11: ['#AC1615', '--ids-color-system-feedback-detrimental-extra-dark (measured token, https://www.instacart.com/)'],
    },
    targets: { 1: [0.99, 0.006, 20], 12: [0.32, 0.1, 25] },
  },
  amber: {
    description:
      'Warning. Anchors are the IDS feedback-alert tokens (brand/brand.md, "Status colours"). Every other step is generated (OKLCH interpolation). Amber is a FILL: warning text uses the dark generated steps.',
    anchors: {
      8: ['#FFBE1D', '--ids-color-system-feedback-alert-light (measured token, https://www.instacart.com/)'],
      9: ['#FFA500', '--ids-color-system-feedback-alert-regular (measured token, https://www.instacart.com/)'],
    },
    targets: { 1: [0.99, 0.02, 85], 12: [0.36, 0.07, 60] },
  },
  yellow: {
    description:
      'Deal and sale highlight. The only anchor is step 9, the yellow behind sale prices and deal tags. Every other step is generated (OKLCH interpolation).',
    anchors: {
      9: ['#FFDC23', '--ids-color-brand-max-light (measured token, https://www.instacart.com/). The brand guide\'s Banana is #FFE200; the live UI uses this one.'],
    },
    targets: { 1: [0.995, 0.02, 100], 12: [0.38, 0.07, 85] },
  },
  blue: {
    description:
      'Info. NOT AN INSTACART VALUE: Instacart ships no info colour (brand/brand.md, Decisions). This whole ramp is ours, generated in OKLCH around one chosen anchor, and is used only for the info status.',
    anchors: {
      9: ['#1B6AD1', 'chosen by us, NOT an Instacart value: a mid blue that passes 5.21:1 with white'],
    },
    targets: { 1: [0.985, 0.01, 255], 12: [0.3, 0.09, 260] },
  },
};

function buildRamp({ anchors, targets }) {
  // Known points: anchors (from hex) and targets (already OKLCH).
  const known = {};
  for (const [s, [hex]] of Object.entries(anchors)) known[s] = { lch: rgbToOklch(hexToRgb(hex)), hex, anchor: true };
  for (const [s, lch] of Object.entries(targets)) known[s] = { lch, hex: oklchToHex(lch), anchor: false };
  const steps = Object.keys(known).map(Number).sort((a, b) => a - b);
  if (steps[0] !== 1 || steps.at(-1) !== 12) throw new Error('a ramp needs a point at step 1 and step 12');

  const out = {};
  for (let s = 1; s <= 12; s++) {
    if (known[s]) {
      out[s] = { hex: known[s].hex, kind: known[s].anchor ? 'anchor' : 'end' };
      continue;
    }
    const lo = Math.max(...steps.filter((k) => k < s));
    const hi = Math.min(...steps.filter((k) => k > s));
    const lch = mix(known[lo].lch, known[hi].lch, (s - lo) / (hi - lo));
    out[s] = { hex: oklchToHex(lch), kind: 'between', lo, hi };
  }
  return out;
}

const doc = {
  $schema: 'https://tr.designtokens.org/format/',
  $description:
    'Primitive colours. Written by scripts/generate-ramps.mjs: change an anchor there and re-run it, do not hand-edit a ramp. Components never read these; only semantic.color.json does. Every anchor is an Instacart value with its source; every other step says how it was generated.',
  color: { $type: 'color' },
};

for (const [name, ramp] of Object.entries(RAMPS)) {
  const steps = buildRamp(ramp);
  const group = { $description: ramp.description };
  for (const [s, v] of Object.entries(steps)) {
    let desc;
    if (v.kind === 'anchor') desc = `ANCHOR. ${ramp.anchors[s][1]}`;
    else if (v.kind === 'end') desc = `generated: our OKLCH end point oklch(${ramp.targets[s].join(' ')})`;
    else desc = `generated: OKLCH interpolation between step ${v.lo} and step ${v.hi}`;
    group[s] = { $value: v.hex, $description: desc };
  }
  doc.color[name] = group;
}

// Single brand colours that are not ramps.
doc.color.kale = {
  $description: 'Kale, the deep brand green, and its IDS brand-secondary family. Hero bands, the dark CTA.',
  1: { $value: '#EDF7F4', $description: 'ANCHOR. --ids-color-brand-secondary-light (measured token, https://www.instacart.com/)' },
  2: { $value: '#003D29', $description: 'ANCHOR. Kale, brand guide (published, https://heyitsinstacart.com/color) and --ids-color-brand-secondary-regular' },
  3: { $value: '#003121', $description: 'ANCHOR. --ids-color-brand-secondary-dark (measured token, https://www.instacart.com/)' },
  4: { $value: '#001810', $description: 'ANCHOR. --ids-color-brand-secondary-extra-dark (measured token, https://www.instacart.com/)' },
};
doc.color.cashew = {
  $description: 'Cashew, the warm brand surface, and its IDS brand-tertiary family. Brand surfaces (banners) only; UI greys are the cool neutral ramp.',
  1: { $value: '#F7F5F0', $description: 'ANCHOR. --ids-color-brand-tertiary-light (measured token, https://www.instacart.com/): the home header band' },
  2: { $value: '#FAF1E5', $description: 'ANCHOR. Cashew, brand guide (published, https://heyitsinstacart.com/color) and --ids-color-brand-tertiary-regular' },
  3: { $value: '#EFE9E1', $description: 'ANCHOR. --ids-color-brand-tertiary-dark (measured token, https://www.instacart.com/)' },
};
doc.color.white = { $value: '#FFFFFF', $description: 'Pure white. Text on a solid green or red fill.' };
doc.color.transparent = { $value: '#00000000', $description: 'No fill.' };

writeFileSync(OUT, JSON.stringify(doc, null, 2) + '\n');
for (const [name, g] of Object.entries(doc.color)) {
  if (name.startsWith('$') || g.$value) continue;
  console.log(name.padEnd(8), Object.entries(g).filter(([k]) => !k.startsWith('$')).map(([, v]) => v.$value).join(' '));
}
