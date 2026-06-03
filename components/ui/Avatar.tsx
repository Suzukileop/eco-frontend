import Image from 'next/image';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const sizePx = {
  sm: 32,
  md: 40,
  lg: 48,
};

export function Avatar({ name, avatarUrl, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={sizePx[size]}
        height={sizePx[size]}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0`}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
