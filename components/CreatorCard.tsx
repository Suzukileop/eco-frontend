import Link from 'next/link';

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hueFromId(id: string) {
  const s = id ?? '';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * 17) % 360;
  return h;
}

type CreatorCardProps = {
  /** Identifiant créateur pour l’URL ; `userId` sert de repli si l’API ne renvoie que celui-ci. */
  id?: string;
  userId?: string;
  fullName?: string;
  avatarUrl?: string | null;
  niche: string | null;
  isVerified: boolean;
  portfolioCount?: number;
  averageRating?: number | null;
};

export function CreatorCard({
  id,
  userId,
  fullName,
  avatarUrl,
  niche,
  isVerified,
  portfolioCount,
  averageRating,
}: CreatorCardProps) {
  const resolvedId = (id ?? userId ?? '').trim();
  const hue = hueFromId(resolvedId || 'unknown');
  const ratingLabel =
    averageRating === null || averageRating === undefined ? (
      <span className="text-gray-400">★ N/A</span>
    ) : (
      <span className="text-amber-600">★ {averageRating.toFixed(1)}</span>
    );

  const cardClassName =
    'group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md';

  const body = (
    <div className="relative flex items-center gap-3 p-4">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
      ) : (
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: `hsl(${hue} 55% 42%)` }}
          aria-hidden
        >
          {initialsFromName(fullName ?? '')}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-900 group-hover:text-indigo-700">
          {fullName ?? 'Créateur'}
        </p>
        {niche && <p className="truncate text-xs text-gray-500">{niche}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          {isVerified && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800">Vérifié ✓</span>
          )}
          {ratingLabel}
          <span className="text-gray-500">{portfolioCount ?? 0} contenus</span>
        </div>
      </div>
    </div>
  );

  if (!resolvedId) {
    return (
      <div className={`${cardClassName} cursor-default opacity-90`} role="article">
        {body}
      </div>
    );
  }

  return (
    <Link href={`/marketplace/${resolvedId}`} className={cardClassName}>
      {body}
    </Link>
  );
}
