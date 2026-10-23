// A clean grocery screen in Claude Design's export shape: components from
// window.Instacart. check-design must report nothing here, with or without
// --jev. Some usages sit close to a rule's boundary on purpose (money inside a
// sentence, a Checkbox in a form with a submit button, a Switch that saves at
// once, a dismissal labelled "Cancel"), and must stay quiet.
import { Leaf, ShoppingCart, Plus } from '@phosphor-icons/react';

const { Avatar, Badge, Button, Checkbox, Heading, Icon, IconButton, Input, Link, Logo, Price, Switch, Text } = window.Instacart;

async function saveSubstitutionAlerts(checked) {
  await fetch('/api/me/settings/substitution-alerts', { method: 'PUT', body: JSON.stringify({ on: checked }) });
}

function addToCart(event) {
  event.preventDefault();
}

function placeOrder(event) {
  event.preventDefault();
}

export default function StorePage() {
  return (
    <div data-theme="light" className="bg-surface text-content min-h-screen">
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <Logo size="md" />
        <Input size="lg" type="search" aria-label="Search" placeholder="Search products, stores, and recipes" className="flex-1" />
        <Avatar name="Maya Chen" size="sm" />
      </header>

      <main className="mx-auto flex w-full max-w-screen-lg flex-col gap-8 px-6 py-8">
        <div className="flex flex-col gap-2">
          <Heading as="h1">Sprouts Farmers Market</Heading>
          <Text tone="muted">Delivery by 7:30am · <Link href="/store/sprouts/info">Store info</Link></Text>
          <Text variant="body-sm">$0 delivery fees on your first 3 orders.</Text>
        </div>

        <section aria-labelledby="produce" className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Heading as="h2" id="produce">Fresh produce</Heading>
            <Link href="/store/sprouts/produce">View more</Link>
          </div>

          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <li className="flex flex-col gap-2 rounded-lg border border-border p-4">
              <img src="/products/bananas.jpg" alt="Organic bananas" className="aspect-square w-full rounded-md object-cover" />
              <div className="flex items-center gap-2">
                <Badge tone="sale">Sale</Badge>
                <Badge tone="success"><Leaf weight="bold" />Organic</Badge>
              </div>
              <Price amount={2.99} wasAmount={3.99} tone="sale" />
              <Heading as="h3" variant="title">Organic Bananas</Heading>
              <Text variant="caption" tone="muted">About 2 lb</Text>
              <IconButton aria-label="Add Organic Bananas to cart" size="sm" onClick={addToCart}>
                <Plus />
              </IconButton>
            </li>

            <li className="flex flex-col gap-2 rounded-lg border border-border p-4">
              <img src="/products/avocado.jpg" alt="Hass avocado" className="aspect-square w-full rounded-md object-cover" />
              <Badge tone="danger">Out of stock</Badge>
              <Price amount={1.49} unitPrice={{ amount: 1.49, unit: 'each' }} />
              <Heading as="h3" variant="title">Hass Avocado</Heading>
              <Text variant="caption" tone="muted">1 each</Text>
            </li>
          </ul>
        </section>

        <section aria-labelledby="settings" className="flex flex-col gap-4">
          <Heading as="h2" id="settings">Shopping preferences</Heading>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="sub-alerts" className="type-label">Substitution alerts</label>
              <Text variant="body-sm" tone="muted">Changes apply right away.</Text>
            </div>
            <Switch id="sub-alerts" defaultChecked onCheckedChange={saveSubstitutionAlerts} />
          </div>
        </section>

        <form className="flex flex-col gap-4 rounded-lg border border-border p-6" onSubmit={placeOrder}>
          <Heading as="h2">Checkout</Heading>
          <div className="flex items-center justify-between gap-4">
            <Text>Subtotal</Text>
            <Price amount={4.48} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="promo" className="type-label">Promo code</label>
            <Input id="promo" autoComplete="off" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="leave-at-door" name="leaveAtDoor" />
            <label htmlFor="leave-at-door" className="type-body-sm">Leave at door</label>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary">Cancel</Button>
            <Button type="submit" size="lg">
              <Icon size="sm"><ShoppingCart /></Icon>
              Place order
            </Button>
          </div>
          <Text variant="caption" tone="muted">
            *Service and other fees apply. <Link href="/help/fees">See fees</Link>
          </Text>
        </form>

        <Button asChild variant="tertiary">
          <a href="/store/sprouts/deals">Browse this week&apos;s deals</a>
        </Button>
      </main>
    </div>
  );
}
