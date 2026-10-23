import { QuantityStepper } from 'instacart-ps-ds';

export interface QuantityControlProps {
  /** The product name, used in the control's accessible name. */
  productName: string;
  quantity: number;
  max?: number;
  /** Called with the new quantity. 0 means "remove from cart". */
  onChange: (quantity: number) => void;
}

/**
 * The library's QuantityStepper, named for this app. Going down to 0 removes
 * the item from the cart (the cart logic handles that).
 */
export function QuantityControl({ productName, quantity, max = 20, onChange }: QuantityControlProps) {
  return (
    <QuantityStepper
      size="sm"
      label={`Quantity of ${productName}`}
      value={quantity}
      min={0}
      max={max}
      onValueChange={onChange}
    />
  );
}
