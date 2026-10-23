import * as React from 'react';
import { Heading, Text } from 'instacart-ps-ds';

import { products, productById } from './products';
import { ProductTile } from './components/ProductTile';
import { CartSummary } from './components/CartSummary';
import { StoreHeader, type Theme } from './components/StoreHeader';

/** Start with one item so the cart is not empty on first load. Empty it to see that state. */
const INITIAL_CART: Record<string, number> = { banana: 2 };

export function App() {
  const [theme, setTheme] = React.useState<Theme>('light');
  const [search, setSearch] = React.useState('');
  const [cart, setCart] = React.useState<Record<string, number>>(INITIAL_CART);
  const [substitutionAlerts, setSubstitutionAlerts] = React.useState(true);

  // The theme is a data-theme attribute on <html>; every token follows it.
  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setQuantity = React.useCallback((id: string, quantity: number) => {
    // An unavailable product can never enter the cart, whatever the UI shows.
    if (quantity > 0 && !productById.get(id)?.inStock) return;
    setCart((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  }, []);

  const query = search.trim().toLowerCase();
  const visible = query ? products.filter((p) => p.name.toLowerCase().includes(query)) : products;
  const favourites = visible.filter((p) => p.section === 'favourites');
  const deals = visible.filter((p) => p.section === 'deals');

  return (
    <div className="page">
      <StoreHeader search={search} onSearchChange={setSearch} theme={theme} onThemeChange={setTheme} />

      <main className="layout">
        <div className="shelves">
          <section className="shelf" aria-labelledby="favourites-heading">
            <Heading as="h2" variant="h2" id="favourites-heading">
              Shop your favourites
            </Heading>
            {favourites.length > 0 ? (
              <div className="grid">
                {favourites.map((product) => (
                  <ProductTile
                    key={product.id}
                    product={product}
                    quantity={cart[product.id] ?? 0}
                    onQuantityChange={setQuantity}
                  />
                ))}
              </div>
            ) : (
              <Text tone="muted">No favourites match "{search}".</Text>
            )}
          </section>

          <section className="shelf" aria-labelledby="deals-heading">
            <Heading as="h2" variant="h2" id="deals-heading">
              Deals
            </Heading>
            {deals.length > 0 ? (
              <div className="grid">
                {deals.map((product) => (
                  <ProductTile
                    key={product.id}
                    product={product}
                    quantity={cart[product.id] ?? 0}
                    onQuantityChange={setQuantity}
                  />
                ))}
              </div>
            ) : (
              <Text tone="muted">No deals match "{search}".</Text>
            )}
          </section>
        </div>

        <CartSummary
          cart={cart}
          onQuantityChange={setQuantity}
          substitutionAlerts={substitutionAlerts}
          onSubstitutionAlertsChange={setSubstitutionAlerts}
        />
      </main>
    </div>
  );
}
