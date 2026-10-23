# Avatar story fixtures

These images are for the Avatar stories only. They are not part of the published package.

| File | What it is |
|---|---|
| `shopper.png` | A simple illustrated shopper (256 × 256). |
| `banana.jpg` | A simple illustrated banana, standing in for a product photo (400 × 400). |

Both images were **generated for this repo**: we drew them as plain SVG shapes and rendered them to PNG and JPEG with Playwright. They are not photos, and they contain no third-party images, so they are free to use, change and share.

Load them in a story with a plain import, never with `new URL(..., import.meta.url)`:

```tsx
import shopper from './_fixtures/shopper.png';
```
