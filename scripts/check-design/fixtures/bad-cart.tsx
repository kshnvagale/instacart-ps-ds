// Deliberate misuse, one or more per rule. Each `expect:` comment names the
// rules that must fire on the next line that opens a JSX element;
// `expect-file:` rules fire on line 1. calibrate.mjs scores the checker
// against these. Lines with no `expect:` are correct usage and must stay quiet.
// expect-file: primary-count, brand-theme
import { Minus, Plus, Trash } from '@phosphor-icons/react';

const { Badge, Button, Checkbox, Heading, IconButton, Input, Link, Price, Text } = window.Instacart;

async function saveSubstitutionAlerts(checked) {
  await fetch('/api/me/settings/substitution-alerts', { method: 'PATCH', body: JSON.stringify({ on: checked }) });
}

async function removeFromCart() {
  await fetch('/api/cart/items/bananas', { method: 'DELETE' });
}

function clearOrganicFilter() {}
function changeQuantity() {}

export default function CartPage() {
  return (
    // expect: dead-class
    <div className="max-w-md bg-white p-7">
      {/* expect: raw-element */}
      <h2 className="type-h2">Your cart</h2>
      {/* expect: text-as-heading */}
      <Text className="font-semibold">Delivery details</Text>
      <Text tone="muted">Delivery by 7:30am from Sprouts Farmers Market.</Text>

      {/* expect: dead-class */}
      <div className="flex flex-col gap-7">
        <Heading as="h3" variant="title">Organic Bananas</Heading>
        {/* expect: price-as-text */}
        <Text variant="body-sm">$3.99</Text>
        {/* expect: price-as-text */}
        <span className="type-caption">$0.42/oz</span>
        <Price amount={2.99} wasAmount={3.99} tone="sale" />
        <Text variant="body-sm">Free delivery on orders over $35.</Text>
      </div>

      {/* expect: quantity-raw-input */}
      <div className="flex items-center gap-2">
        <IconButton aria-label="Remove one" size="sm" onClick={changeQuantity}><Minus /></IconButton>
        <Text>2</Text>
        <IconButton aria-label="Add one" size="sm" onClick={changeQuantity}><Plus /></IconButton>
      </div>
      <div className="flex items-center gap-2">
        {/* expect: raw-element, quantity-raw-input */}
        <input type="number" aria-label="Quantity" defaultValue={1} />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary">Save for later</Button>
        <Button variant="danger">Remove</Button>
      </div>

      {/* expect: inline-style */}
      <div style={{ color: '#343538', padding: 12 }}>Signed in as Maya Chen</div>
      {/* expect: inline-layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* expect: raw-color */}
        <svg fill="#0AAD0A" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" /></svg>
      </div>

      <div className="flex items-center gap-2">
        {/* expect: checkbox-instant */}
        <Checkbox id="sub-alerts" onCheckedChange={saveSubstitutionAlerts} />
        <label htmlFor="sub-alerts">Substitution alerts</label>
      </div>

      <div>
        {/* expect: raw-element */}
        <button className="rounded-full px-4">Checkout</button>
      </div>
      <div>
        {/* expect: prop-type */}
        <Button variant="ghost">Cancel</Button>
      </div>
      <div>
        {/* expect: vague-label */}
        <Button>OK</Button>
      </div>
      <div>
        <Button size="xl">Add to cart</Button>
      </div>
      <div>
        {/* expect: component-class */}
        <Button variant="tertiary" class="w-full">Log in</Button>
      </div>

      <div className="flex items-center gap-2">
        <Badge tone="sale">Sale</Badge>
        {/* expect: interactive-badge, badge-interactive */}
        <Badge onClick={clearOrganicFilter}>Organic ×</Badge>
      </div>

      {/* expect: link-writes-data */}
      <Link href="#" onClick={removeFromCart}>Remove from cart</Link>
      <Link href="/store/sprouts/produce">View more</Link>

      {/* expect: arbitrary-value */}
      <div className="mt-[18px] text-[13px]">Prices may vary from those in store.</div>
      {/* expect: dead-class */}
      <span className="text-green-600">Need help?</span>
      {/* expect: prop-type */}
      <Input id="email" type="email" autocomplete="email" />
      {/* expect: prop-type */}
      <IconButton variant="tertiary"><Trash /></IconButton>
      {/* expect: prop-type */}
      <Text tone="secondary">Something went wrong</Text>
      {/* expect: raw-element */}
      <img src="/brand/instacart-logo.svg" alt="Instacart" />
      <img src="/products/avocado.jpg" alt="Hass avocado" className="size-16 rounded-md object-cover" />
    </div>
  );
}
