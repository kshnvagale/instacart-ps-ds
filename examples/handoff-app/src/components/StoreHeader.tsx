import { Avatar, Icon, Input, Logo, MagnifyingGlassIcon, Price, Switch, Text } from 'instacart-ps-ds';

import { store } from '../products';

export type Theme = 'light' | 'dark';

export interface StoreHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

/** The store header: logo, store, delivery fee, search, theme and account. */
export function StoreHeader({ search, onSearchChange, theme, onThemeChange }: StoreHeaderProps) {
  return (
    <header className="header">
      {/* Full-colour logo only on white; on the dark surface use the white one. */}
      <Logo size="md" tone={theme === 'dark' ? 'white' : 'color'} />

      <div className="header-store">
        <Text variant="label" tone="strong">
          {store.name}
        </Text>
        <div className="header-fee">
          <Text as="span" variant="caption" tone="muted">
            Delivery fee
          </Text>
          <Price size="sm" amount={store.deliveryFee} />
        </div>
      </div>

      <div className="header-search" role="search">
        <Icon size="md" tone="muted">
          <MagnifyingGlassIcon />
        </Icon>
        <Input
          type="search"
          size="lg"
          aria-label="Search products"
          placeholder="Search [Store name]"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="header-end">
        {/* An instant setting with no save button, so a Switch, not a Checkbox. */}
        <div className="setting">
          <Switch
            id="dark-theme"
            size="sm"
            checked={theme === 'dark'}
            onCheckedChange={(on) => onThemeChange(on ? 'dark' : 'light')}
          />
          <Text as="label" htmlFor="dark-theme" variant="label">
            Dark theme
          </Text>
        </div>
        <Avatar name="Alex Rivera" size="md" tone="brand" />
      </div>
    </header>
  );
}
