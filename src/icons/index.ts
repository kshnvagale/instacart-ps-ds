// The icon set: a curated list of Phosphor icons (Regular weight), shipped as
// real exports of this package.
//
// Why re-export them? Claude Design bundles this package's exports, not its
// npm dependencies. An icon that is only in `@phosphor-icons/react` never
// reaches a design, so the design agent would have no icons at all. Every
// icon listed here travels in the bundle as `Instacart.<Name>Icon`.
//
// To use a new icon in designs, add it here (keep the Phosphor `*Icon` name),
// then run `npm run build:guide` and `npm run check:rules`. Put each icon
// inside an `Icon` (or straight inside a Button, IconButton or Badge).

export {
  // Cart and shopping
  ShoppingCartIcon,
  ShoppingBagIcon,
  BasketIcon,
  StorefrontIcon,
  ReceiptIcon,
  PackageIcon,
  TruckIcon,
  TagIcon,
  PercentIcon,
  GiftIcon,
  // Produce
  CarrotIcon,
  LeafIcon,
  OrangeIcon,
  // Actions
  PlusIcon,
  MinusIcon,
  TrashIcon,
  XIcon,
  CheckIcon,
  HeartIcon,
  StarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SlidersIcon,
  SlidersHorizontalIcon,
  // Navigation
  CaretLeftIcon,
  CaretRightIcon,
  CaretDownIcon,
  CaretUpIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowSquareOutIcon,
  HouseIcon,
  ListIcon,
  // Place, time, people
  MapPinIcon,
  ClockIcon,
  UserIcon,
  BellIcon,
  // Status
  InfoIcon,
  WarningIcon,
  WarningCircleIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react';
