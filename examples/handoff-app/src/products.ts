// The sample product data shared with the workshop (workshop/assets/products.json).
// Images in it are relative to workshop/assets, which Vite serves as the site
// root (see vite.config.ts), so `products/banana.png` is a working URL.
import data from '../../../workshop/assets/products.json';
import type { UnitPrice } from 'instacart-ps-ds';

export interface Product {
  id: string;
  name: string;
  size: string;
  /** The price to pay now, in USD. */
  price: number;
  /** Set only when the product is on sale: the price before the sale. */
  wasPrice?: number;
  unitPrice: UnitPrice;
  inStock: boolean;
  image: string;
  badges: string[];
  section: 'favourites' | 'deals';
}

export interface Store {
  name: string;
  deliveryFee: number;
  serviceFee: number;
}

export const store: Store = data.store;
export const products: Product[] = data.products as Product[];

export const productById = new Map(products.map((p) => [p.id, p]));

/** Image URL for a product, resolved against the app's base path. */
export function imageUrl(product: Product): string {
  return `${import.meta.env.BASE_URL}${product.image}`;
}
