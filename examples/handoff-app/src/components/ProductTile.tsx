import { Badge, Button, PlusIcon, Price, Text } from 'instacart-ps-ds';

import { imageUrl, type Product } from '../products';
import { QuantityControl } from './QuantityControl';

export interface ProductTileProps {
  product: Product;
  quantity: number;
  onQuantityChange: (id: string, quantity: number) => void;
}

/**
 * A product tile, composed from Badge, Price, Text and Button. The library has
 * no ProductCard on purpose: composing it from atoms is the expected path.
 */
export function ProductTile({ product, quantity, onQuantityChange }: ProductTileProps) {
  const onSale = product.wasPrice !== undefined;

  return (
    <article className="tile" data-in-stock={product.inStock} aria-label={product.name}>
      <div className="tile-media">
        <img src={imageUrl(product)} alt="" width={400} height={400} loading="lazy" />
        <div className="tile-badges">
          {onSale ? (
            <Badge tone="sale" size="sm">
              Sale
            </Badge>
          ) : null}
          {product.badges.map((badge) => (
            <Badge key={badge} tone="brand" size="sm">
              {badge}
            </Badge>
          ))}
          {!product.inStock ? (
            <Badge tone="danger" size="sm">
              Out of stock
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="tile-body">
        <Price
          size="sm"
          amount={product.price}
          wasAmount={product.wasPrice}
          tone={onSale ? 'sale' : 'default'}
          unitPrice={product.unitPrice}
        />
        <Text variant="body" tone="strong">
          {product.name}
        </Text>
        <Text variant="caption" tone="muted">
          {product.size}
        </Text>
      </div>

      <div className="tile-action">
        {!product.inStock ? (
          <Button variant="secondary" size="sm" disabled>
            Out of stock
          </Button>
        ) : quantity > 0 ? (
          <QuantityControl
            productName={product.name}
            quantity={quantity}
            onChange={(next) => onQuantityChange(product.id, next)}
          />
        ) : (
          <Button
            variant="primary"
            size="sm"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => onQuantityChange(product.id, 1)}
          >
            <PlusIcon />
            Add
          </Button>
        )}
      </div>
    </article>
  );
}
