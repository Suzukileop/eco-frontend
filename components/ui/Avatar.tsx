import Image from 'next/image';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  tone?: 'brand' | 'muted';
}

const sizeClasses = {
  xs: 'w-9 h-9 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-28 h-28 text-2xl',
};

const sizePx = {
  xs: 36,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 80,
  '2xl': 112,
};

export function Avatar({ name, avatarUrl, size = 'md', tone = 'brand' }: AvatarProps) {
  const safeName = name?.trim() || '?';
  const initials = safeName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={safeName}
        width={sizePx[size]}
        height={sizePx[size]}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  const fallbackClassName =
    tone === 'muted'
      ? 'bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-white'
      : 'bg-[#F97316] text-white';

  return (
    <div
      className={`${sizeClasses[size]} flex flex-shrink-0 items-center justify-center rounded-full font-semibold ${fallbackClassName}`}
      aria-label={safeName}
    >
      {initials}
    </div>
  );
}
