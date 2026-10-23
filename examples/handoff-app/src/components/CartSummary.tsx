import * as React from 'react';
import { Badge, Button, Checkbox, Heading, Icon, Price, ShoppingCartIcon, Switch, Text } from 'instacart-ps-ds';

import { imageUrl, productById, store } from '../products';
import { QuantityControl } from './QuantityControl';

export interface CartSummaryProps {
  /** Product id to quantity. Ids with quantity 0 are not in the map. */
  cart: Record<string, number>;
  onQuantityChange: (id: string, quantity: number) => void;
  substitutionAlerts: boolean;
  onSubstitutionAlertsChange: (on: boolean) => void;
}

/** The cart summary: lines, delivery options, fees, total and checkout. */
export function CartSummary({
  cart,
  onQuantityChange,
  substitutionAlerts,
  onSubstitutionAlertsChange,
}: CartSummaryProps) {
  const [leaveAtDoor, setLeaveAtDoor] = React.useState(false);
  const [placed, setPlaced] = React.useState<string | null>(null);

  const lines = Object.entries(cart).flatMap(([id, quantity]) => {
    const product = productById.get(id);
    return product ? [{ product, quantity, total: product.price * quantity }] : [];
  });
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const total = subtotal + store.serviceFee + store.deliveryFee;

  function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Demo only: a real app would send the order here. "Leave at door" is a
    // form choice, so it is read when the form is submitted, not on change.
    setPlaced(leaveAtDoor ? 'Checkout started. We will leave it at your door.' : 'Checkout started.');
  }

  return (
    <aside className="cart" aria-labelledby="cart-heading">
      <div className="cart-head">
        <Heading as="h2" variant="h3" id="cart-heading">
          Your cart
        </Heading>
        {itemCount > 0 ? (
          <Badge tone="neutral">{itemCount === 1 ? '1 item' : `${itemCount} items`}</Badge>
        ) : null}
      </div>

      {lines.length === 0 ? (
        <div className="cart-empty">
          <Icon size="lg" tone="muted">
            <ShoppingCartIcon />
          </Icon>
          <Text variant="label-lg" tone="strong">
            Your cart is empty
          </Text>
          <Text variant="body-sm" tone="muted">
            Add items from the shelves to start your order.
          </Text>
        </div>
      ) : (
        <ul className="cart-items">
          {lines.map(({ product, quantity, total: lineTotal }) => (
            <li key={product.id} className="cart-item">
              <img src={imageUrl(product)} alt="" width={48} height={48} />
              <div className="cart-item-info">
                <Text variant="body-sm" tone="strong">
                  {product.name}
                </Text>
                <QuantityControl
                  productName={product.name}
                  quantity={quantity}
                  onChange={(next) => onQuantityChange(product.id, next)}
                />
              </div>
              <Price size="sm" amount={lineTotal} />
            </li>
          ))}
        </ul>
      )}

      {/* Applies the moment it is flipped, with no save button: a Switch. */}
      <div className="cart-section">
        <div className="cart-setting">
          <div className="cart-setting-text">
            <Text as="label" htmlFor="substitution-alerts" variant="label" tone="strong">
              Substitution alerts
            </Text>
            <Text variant="caption" tone="muted">
              Get a text if your shopper replaces an item.
            </Text>
          </div>
          <Switch
            id="substitution-alerts"
            checked={substitutionAlerts}
            onCheckedChange={onSubstitutionAlertsChange}
          />
        </div>
      </div>

      {lines.length > 0 ? (
        <form className="cart-form cart-section" onSubmit={handleCheckout}>
          <dl className="totals">
            <dt>
              <Text as="span" variant="body-sm">
                Subtotal
              </Text>
            </dt>
            <dd>
              <Price size="sm" amount={subtotal} />
            </dd>
            <dt>
              <Text as="span" variant="body-sm">
                Service fee
              </Text>
            </dt>
            <dd>
              <Price size="sm" amount={store.serviceFee} />
            </dd>
            <dt>
              <Text as="span" variant="body-sm">
                Delivery fee
              </Text>
            </dt>
            <dd>
              <Price size="sm" amount={store.deliveryFee} />
            </dd>
            <dt className="total">
              <Text as="span" variant="label-lg" tone="strong">
                Total
              </Text>
            </dt>
            <dd className="total">
              <Price size="md" amount={total} />
            </dd>
          </dl>

          {/* Applied when the order is submitted: a Checkbox. */}
          <div className="setting">
            <Checkbox
              id="leave-at-door"
              name="leaveAtDoor"
              checked={leaveAtDoor}
              onCheckedChange={(checked) => setLeaveAtDoor(checked === true)}
            />
            <Text as="label" htmlFor="leave-at-door" variant="label">
              Leave at door
            </Text>
          </div>

          <Button type="submit" variant="primary" size="lg">
            Go to checkout
          </Button>
          {placed ? (
            <Text variant="body-sm" tone="brand" role="status">
              {placed}
            </Text>
          ) : null}
        </form>
      ) : null}
    </aside>
  );
}
