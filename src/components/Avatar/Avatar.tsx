import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

/**
 * The circle. Size sets the diameter AND the initials' type role, so the
 * letters always fit. Tone colours the initials fallback only; a loaded photo
 * covers it.
 */
export const avatarVariants = cva(
  'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full align-middle font-semibold',
  {
    variants: {
      size: {
        sm: 'size-6 type-caption',
        md: 'size-8 type-label',
        lg: 'size-10 type-title',
        xl: 'size-16 type-h2',
      },
      tone: {
        neutral: 'bg-surface-active text-content-strong',
        brand: 'bg-surface-brand text-content-on-brand',
      },
    },
    defaultVariants: { size: 'md', tone: 'neutral' },
  },
);

type AvatarVariantProps = VariantProps<typeof avatarVariants>;

/**
 * Initials from a name: the first letter of the first word and of the last
 * word, in capitals. "Maria Lopez" -> "ML", "Maria de la Cruz" -> "MC",
 * "Maria" -> "M". Empty or blank -> "".
 */
export function getInitials(name: string | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const first = Array.from(words[0]!)[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1]!)[0] ?? '') : '';
  return (first + last).toLocaleUpperCase();
}

export interface AvatarProps
  extends Omit<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>, 'children'>,
    AvatarVariantProps {
  /**
   * The photo's URL. While it loads, or if it fails, the initials show
   * instead. Any shape of photo is centre-cropped to the circle.
   */
  src?: string;
  /**
   * The person's full name, such as "Maria Lopez". It gives the initials
   * ("ML") and, unless `alt` is set, the accessible name.
   */
  name?: string;
  /**
   * The accessible name, when it should differ from `name` (for example
   * "Maria Lopez, your shopper"). Pass `""` when the name is already shown
   * as text beside the avatar: the avatar is then decorative and screen
   * readers skip it.
   *
   * @default name
   */
  alt?: string;
  /**
   * `sm` 24px (a dense list), `md` 32px (most rows), `lg` 40px (a chat or
   * order header), `xl` 64px (a profile page).
   *
   * @default 'md'
   */
  size?: AvatarVariantProps['size'];
  /**
   * The colour of the initials fallback. `brand` (Kale) marks the Instacart
   * shopper; `neutral` (grey) is for customers and everyone else.
   *
   * @default 'neutral'
   */
  tone?: AvatarVariantProps['tone'];
  /**
   * Optional fallback content that replaces the initials, such as an `Icon`
   * with Phosphor's `User` when there is no name yet.
   */
  children?: React.ReactNode;
}

/**
 * Avatar: a round picture of a person, with their initials when there is no
 * photo.
 *
 * **When to use:** to show who someone is: the shopper picking an order
 * ("Maria Lopez is shopping for you"), a customer in an order list, the
 * signed-in account in the header.
 *
 * **When not to use:**
 * - A product picture: use a plain `img` in the product card. Products are
 *   not round and must not be cropped.
 * - A store or retailer logo tile: it is a rounded square with a border, not
 *   an Avatar.
 * - The Instacart brand: use `Logo`.
 * - An icon on its own: use `Icon`.
 *
 * **Accessibility:** with a `name` (or `alt`) the avatar is one image with
 * that name, whether the photo or the initials are showing. When the name is
 * already written beside it, pass `alt=""` so it is not read twice.
 *
 * The photo loads in the browser, so server HTML shows the initials first.
 *
 * @example
 * <Avatar src={photoUrl} name="Maria Lopez" tone="brand" alt="Maria Lopez, your shopper" />
 *
 * <div className="flex items-center gap-3">
 *   <Avatar name="Sam Patel" alt="" />
 *   <span>Sam Patel</span>
 * </div>
 */
export const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  function Avatar({ className, src, name, alt, size, tone, children, ...props }, ref) {
    const label = alt ?? name ?? '';
    const named = label !== '';
    return (
      <AvatarPrimitive.Root
        ref={ref}
        data-slot="avatar"
        data-size={size ?? 'md'}
        data-tone={tone ?? 'neutral'}
        {...(named ? ({ role: 'img', 'aria-label': label } as const) : {})}
        className={cn(avatarVariants({ size, tone }), className)}
        {...props}
      >
        {src && (
          <AvatarPrimitive.Image
            data-slot="avatar-image"
            src={src}
            // The root carries the name, so the picture itself adds nothing.
            alt=""
            className="size-full object-cover"
          />
        )}
        <AvatarPrimitive.Fallback
          data-slot="avatar-fallback"
          aria-hidden="true"
          className="flex size-full items-center justify-center [&_svg]:shrink-0"
        >
          {children ?? getInitials(name)}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  },
);
Avatar.displayName = 'Avatar';
