// Draws flat product illustrations as SVG, then renders each to a 400x400 PNG.
// Usage, from the repo root: node workshop/assets/products/generate.mjs workshop/assets/products "$PWD/node_modules/playwright/index.mjs"
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [outDir, pwPath] = process.argv.slice(2);
const { chromium } = await import(pwPath);

const BG = '#F6F3EC';
const wrap = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">` +
  `<rect width="400" height="400" fill="${BG}"/>` +
  `<ellipse cx="200" cy="335" rx="130" ry="14" fill="#000" opacity="0.06"/>` +
  body +
  `</svg>`;

const products = {
  banana: `
    <path d="M92 150 C110 290 250 330 320 230 C330 214 318 206 306 214 C240 270 150 250 118 140 Z" fill="#F4CF3A"/>
    <path d="M118 140 C150 250 240 270 306 214 C300 236 270 262 230 270 C170 278 120 230 104 150 Z" fill="#E2B52A"/>
    <path d="M86 128 l18 -8 l14 22 l-22 8 Z" fill="#6B4E2A"/>
    <circle cx="318" cy="220" r="7" fill="#5A4022"/>`,
  avocado: `
    <path d="M200 70 C150 70 130 150 112 200 C90 260 130 330 200 330 C270 330 310 260 288 200 C270 150 250 70 200 70 Z" fill="#3E6B2A"/>
    <path d="M200 92 C162 92 150 160 134 205 C116 255 150 310 200 310 C250 310 284 255 266 205 C250 160 238 92 200 92 Z" fill="#C9DE7A"/>
    <path d="M200 120 C172 120 164 175 152 210 C140 248 166 290 200 290 C234 290 260 248 248 210 C236 175 228 120 200 120 Z" fill="#E3EDA0"/>
    <circle cx="200" cy="232" r="44" fill="#8A5A2E"/>
    <circle cx="186" cy="218" r="12" fill="#A97445"/>`,
  strawberries: `
    <g>
      <path d="M130 150 C80 150 80 210 105 250 C120 275 135 290 140 300 C150 285 170 270 185 245 C205 205 190 150 130 150 Z" fill="#E0393E"/>
      <path d="M110 150 l20 -22 l14 18 l20 -14 l2 22 Z" fill="#3E8E2E"/>
      <g fill="#F7D774"><circle cx="118" cy="190" r="3"/><circle cx="145" cy="185" r="3"/><circle cx="165" cy="205" r="3"/><circle cx="125" cy="225" r="3"/><circle cx="152" cy="235" r="3"/><circle cx="140" cy="265" r="3"/></g>
    </g>
    <g>
      <path d="M260 120 C200 120 200 190 230 235 C247 262 262 280 268 292 C280 275 300 258 316 232 C340 188 322 120 260 120 Z" fill="#C8262E"/>
      <path d="M238 120 l22 -24 l15 20 l22 -16 l2 24 Z" fill="#2F7A24"/>
      <g fill="#F7D774"><circle cx="245" cy="165" r="3"/><circle cx="275" cy="158" r="3"/><circle cx="300" cy="180" r="3"/><circle cx="252" cy="205" r="3"/><circle cx="285" cy="210" r="3"/><circle cx="268" cy="250" r="3"/></g>
    </g>`,
  milk: `
    <path d="M140 130 L200 80 L260 130 Z" fill="#DCE6F2"/>
    <rect x="186" y="62" width="28" height="22" rx="3" fill="#2F6FB7"/>
    <rect x="140" y="130" width="120" height="200" rx="6" fill="#FFFFFF"/>
    <rect x="140" y="130" width="120" height="200" rx="6" fill="none" stroke="#C9D3DF" stroke-width="4"/>
    <rect x="140" y="190" width="120" height="70" fill="#2F6FB7"/>
    <path d="M160 225 c10 -14 20 -14 30 0 s20 14 30 0 s20 -14 20 0" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>`,
  eggs: `
    <path d="M70 230 L330 230 L310 300 L90 300 Z" fill="#C9A77C"/>
    <ellipse cx="125" cy="200" rx="40" ry="52" fill="#FBF6EE"/>
    <ellipse cx="200" cy="190" rx="42" ry="56" fill="#F1E3CE"/>
    <ellipse cx="275" cy="200" rx="40" ry="52" fill="#FBF6EE"/>
    <path d="M70 230 L330 230 L322 258 L78 258 Z" fill="#B8936A"/>
    <ellipse cx="112" cy="180" rx="9" ry="14" fill="#FFFFFF" opacity="0.7"/>
    <ellipse cx="186" cy="168" rx="9" ry="14" fill="#FFFFFF" opacity="0.6"/>`,
  bread: `
    <path d="M80 210 C80 140 140 120 200 120 C260 120 320 140 320 210 L320 300 C320 310 312 318 302 318 L98 318 C88 318 80 310 80 300 Z" fill="#C98A47"/>
    <path d="M96 205 C96 152 146 136 200 136 C254 136 304 152 304 205 L304 300 L96 300 Z" fill="#DDA463"/>
    <g fill="none" stroke="#B87736" stroke-width="10" stroke-linecap="round">
      <path d="M140 160 l-20 40"/><path d="M190 152 l-20 44"/><path d="M240 152 l-20 44"/><path d="M288 162 l-20 40"/>
    </g>`,
  apples: `
    <g>
      <path d="M150 140 C100 120 70 170 82 225 C94 280 130 305 150 295 C170 305 206 280 218 225 C230 170 200 120 150 140 Z" fill="#D8343A"/>
      <path d="M150 140 l4 -34" stroke="#6B4E2A" stroke-width="8" stroke-linecap="round"/>
      <path d="M156 116 C176 96 202 100 208 108 C196 124 172 126 156 116 Z" fill="#4C9A2E"/>
      <ellipse cx="112" cy="190" rx="12" ry="22" fill="#FFFFFF" opacity="0.25"/>
    </g>
    <g>
      <path d="M262 170 C220 154 194 196 204 242 C214 288 244 308 262 300 C280 308 310 288 320 242 C330 196 304 154 262 170 Z" fill="#E9B63C"/>
      <path d="M262 170 l3 -28" stroke="#6B4E2A" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="230" cy="215" rx="10" ry="18" fill="#FFFFFF" opacity="0.3"/>
    </g>`,
  carrots: `
    <g>
      <path d="M120 120 C140 110 165 118 168 140 L150 320 C148 330 138 330 136 320 L104 150 C100 135 108 125 120 120 Z" fill="#F08A24"/>
      <path d="M130 118 C110 80 100 70 92 74 M140 116 C140 76 150 62 156 64 M148 118 C170 86 186 82 190 88" stroke="#3E8E2E" stroke-width="10" stroke-linecap="round" fill="none"/>
      <g stroke="#C96D14" stroke-width="5" stroke-linecap="round"><path d="M118 170 l18 0"/><path d="M128 220 l16 0"/><path d="M134 270 l12 0"/></g>
    </g>
    <g>
      <path d="M240 140 C260 130 285 138 288 160 L270 330 C268 340 258 340 256 330 L224 170 C220 155 228 145 240 140 Z" fill="#F39A35"/>
      <path d="M250 138 C230 100 220 90 212 94 M260 136 C260 96 270 82 276 84 M268 138 C290 106 306 102 310 108" stroke="#2F7A24" stroke-width="10" stroke-linecap="round" fill="none"/>
      <g stroke="#C96D14" stroke-width="5" stroke-linecap="round"><path d="M240 190 l18 0"/><path d="M248 240 l16 0"/><path d="M254 290 l12 0"/></g>
    </g>`,
  tomatoes: `
    <g>
      <circle cx="150" cy="220" r="78" fill="#E0442E"/>
      <path d="M150 150 l-26 -10 l18 22 l-30 10 l32 4 l6 26 l8 -26 l30 -2 l-28 -12 l16 -22 Z" fill="#3E8E2E"/>
      <ellipse cx="118" cy="200" rx="14" ry="22" fill="#FFFFFF" opacity="0.25"/>
    </g>
    <g>
      <circle cx="270" cy="250" r="62" fill="#C9362A"/>
      <path d="M270 196 l-20 -8 l14 18 l-24 8 l26 3 l4 20 l6 -20 l24 -2 l-22 -10 l13 -17 Z" fill="#2F7A24"/>
      <ellipse cx="246" cy="236" rx="10" ry="16" fill="#FFFFFF" opacity="0.25"/>
    </g>`,
  spinach: `
    <g stroke="#2F6B22" stroke-width="6" stroke-linecap="round">
      <path d="M200 330 L200 230"/><path d="M200 330 L150 230"/><path d="M200 330 L250 230"/>
    </g>
    <ellipse cx="150" cy="180" rx="50" ry="72" transform="rotate(-25 150 180)" fill="#3E8E2E"/>
    <ellipse cx="250" cy="180" rx="50" ry="72" transform="rotate(25 250 180)" fill="#3E8E2E"/>
    <ellipse cx="200" cy="160" rx="54" ry="82" fill="#4FA83A"/>
    <g stroke="#2F7A24" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M200 236 L200 96"/><path d="M200 140 l-24 -18"/><path d="M200 140 l24 -18"/><path d="M200 185 l-28 -18"/><path d="M200 185 l28 -18"/>
    </g>
    <rect x="178" y="292" width="44" height="22" rx="6" fill="#C9A77C"/>`,
  cheese: `
    <path d="M70 250 L300 140 L330 170 L330 290 L70 290 Z" fill="#F2C33D"/>
    <path d="M70 250 L330 170 L330 290 L70 290 Z" fill="#F7D05C"/>
    <path d="M70 250 L300 140 L330 170 Z" fill="#E6AE22"/>
    <g fill="#E6AE22">
      <circle cx="130" cy="265" r="14"/><circle cx="210" cy="250" r="20"/><circle cx="285" cy="265" r="12"/><circle cx="270" cy="215" r="9"/><circle cx="170" cy="280" r="7"/>
    </g>`,
  yogurt: `
    <ellipse cx="200" cy="120" rx="92" ry="20" fill="#2F6FB7"/>
    <path d="M110 125 L290 125 L268 310 C266 322 256 330 244 330 L156 330 C144 330 134 322 132 310 Z" fill="#FFFFFF"/>
    <path d="M110 125 L290 125 L268 310 C266 322 256 330 244 330 L156 330 C144 330 134 322 132 310 Z" fill="none" stroke="#D5DCE5" stroke-width="4"/>
    <path d="M120 185 L280 185 L272 255 L128 255 Z" fill="#F4B7C5"/>
    <circle cx="200" cy="220" r="22" fill="#E0393E"/>
    <path d="M196 198 l6 -10 l8 4" stroke="#3E8E2E" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  coffee: `
    <path d="M130 120 L270 120 L290 320 L110 320 Z" fill="#5B3A24"/>
    <path d="M130 120 L270 120 L262 92 L138 92 Z" fill="#7A5236"/>
    <rect x="134" y="84" width="132" height="12" rx="4" fill="#3E2716"/>
    <rect x="148" y="180" width="104" height="90" rx="8" fill="#F6F3EC"/>
    <ellipse cx="200" cy="225" rx="22" ry="30" fill="#5B3A24"/>
    <path d="M200 198 C188 215 212 235 200 252" stroke="#F6F3EC" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  oranges: `
    <g>
      <circle cx="160" cy="215" r="82" fill="#F39A1E"/>
      <g fill="#E0870F"><circle cx="130" cy="200" r="3"/><circle cx="170" cy="180" r="3"/><circle cx="190" cy="240" r="3"/><circle cx="140" cy="250" r="3"/><circle cx="200" cy="205" r="3"/></g>
      <path d="M160 135 l2 -16" stroke="#6B4E2A" stroke-width="7" stroke-linecap="round"/>
      <path d="M164 122 C184 100 214 104 220 114 C204 130 180 132 164 122 Z" fill="#3E8E2E"/>
    </g>
    <g>
      <circle cx="280" cy="270" r="56" fill="#F7B54A"/>
      <circle cx="280" cy="270" r="46" fill="#FBD58A"/>
      <g stroke="#F7B54A" stroke-width="4">
        <path d="M280 224 L280 316"/><path d="M234 270 L326 270"/><path d="M247 237 L313 303"/><path d="M313 237 L247 303"/>
      </g>
      <circle cx="280" cy="270" r="6" fill="#F7B54A"/>
    </g>`,
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 400, height: 400 } });
for (const [name, body] of Object.entries(products)) {
  const svg = wrap(body);
  writeFileSync(join(outDir, `${name}.svg`), svg + '\n');
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.locator('svg').screenshot({ path: join(outDir, `${name}.png`) });
  console.log('wrote', name);
}
await browser.close();
