# Product images

These 14 product pictures are for the workshop's grocery screen (product tiles, deals row, cart).

- **Generated, not photographed.** Each one is a flat SVG drawn by hand in code for this workshop (`generate.mjs`), then rendered to a 400 × 400 PNG with Playwright.
- **Rights-free.** No stock photos, no brand packaging, no third-party artwork. You may use, change and share them freely, inside or outside the workshop.
- **No real brands.** The milk, yogurt and coffee packs carry no logos or product names.

| File | Product |
|---|---|
| `apples.png` | Apples (red and yellow) |
| `avocado.png` | Avocado, halved |
| `banana.png` | Banana |
| `bread.png` | Bread loaf |
| `carrots.png` | Carrots |
| `cheese.png` | Cheese wedge |
| `coffee.png` | Bag of coffee |
| `eggs.png` | Eggs |
| `milk.png` | Milk carton |
| `oranges.png` | Oranges |
| `spinach.png` | Spinach bunch |
| `strawberries.png` | Strawberries |
| `tomatoes.png` | Tomatoes |
| `yogurt.png` | Yogurt cup |

Each PNG has a matching `.svg` source. Sample product data that uses these images is in `../products.json`.

## Make them again

From the repo root:

```bash
node workshop/assets/products/generate.mjs workshop/assets/products "$PWD/node_modules/playwright/index.mjs"
```

The background is a light warm grey (`#F6F3EC`), so the pictures read well on both the light and the dark theme.
