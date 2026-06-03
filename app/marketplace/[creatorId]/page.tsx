import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { OrderCreatorCta } from '@/components/marketplace/OrderCreatorCta';
import type { MarketplaceContentItem, MarketplaceCreatorPublicProfile } from '@/types/marketplace';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchPortfolio(creatorId: string): Promise<MarketplaceContentItem[]> {
  const data = await fetchJson<{ content?: MarketplaceContentItem[] }>(
    `/api/marketplace/contents?size=6&page=0&creatorId=${encodeURIComponent(creatorId)}`
  );
  return (data?.content ?? []).slice(0, 6);
}

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export async function generateMetadata({
  params,
}: {
  params: { creatorId: string };
}): Promise<Metadata> {
  const profile = await fetchJson<MarketplaceCreatorPublicProfile>(
    `/api/marketplace/creators/${params.creatorId}`
  );
  if (!profile) return { title: 'Créateur introuvable — NoProbleme' };
  return {
    title: `${profile.fullName} — Marketplace NoProbleme`,
    description: profile.bio ?? `Portfolio de ${profile.fullName}`,
  };
}

export default async function MarketplaceCreatorPage({
  params,
}: {
  params: { creatorId: string };
}) {
  const profile = await fetchJson<MarketplaceCreatorPublicProfile>(
    `/api/marketplace/creators/${params.creatorId}`
  );
  if (!profile) notFound();

  const sessionCookie = cookies().get('refresh_token');
  const isAuthenticated = Boolean(sessionCookie);

  let portfolio = profile.portfolio?.length ? profile.portfolio : profile.contents ?? [];
  if (!portfolio.length) {
    portfolio = await fetchPortfolio(params.creatorId);
  }

  const socialEntries = profile.socialLinks ? Object.entries(profile.socialLinks) : [];
  const showSocial = isAuthenticated && socialEntries.length > 0;

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <Link href="/marketplace" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
        ← Retour marketplace
      </Link>

      <header className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-start">
        <div className="flex flex-1 gap-4">
          {profile.avatarUrl ? (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-800">
              {initials(profile.fullName)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
              {profile.isVerified && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                  Vérifié ✓
                </span>
              )}
              {profile.niche && (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800">
                  {profile.niche}
                </span>
              )}
            </div>
            {profile.bio && <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{profile.bio}</p>}
          </div>
        </div>
        <OrderCreatorCta creatorId={params.creatorId} isAuthenticated={isAuthenticated} />
      </header>

      <section aria-labelledby="contacts-heading">
        <h2 id="contacts-heading" className="text-sm font-semibold text-gray-900">
          Contacts & réseaux
        </h2>
        {showSocial ? (
          <ul className="mt-3 flex flex-wrap gap-3">
            {socialEntries.map(([label, url]) => (
              <li key={label}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-gray-50"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            <Link href={`/login?redirect=${encodeURIComponent(`/marketplace/${params.creatorId}`)}`} className="font-semibold text-indigo-600 hover:text-indigo-800">
              Connectez-vous pour voir les contacts
            </Link>
          </p>
        )}
      </section>

      <section aria-labelledby="portfolio-heading">
        <h2 id="portfolio-heading" className="text-sm font-semibold text-gray-900">
          Portfolio
        </h2>
        {portfolio.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">Aucun contenu public pour le moment.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="relative aspect-video bg-gray-100">
                  {item.thumbnailUrl || item.mediaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailUrl ?? item.mediaUrl ?? ''}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      Aperçu indisponible
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {item.genre && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">{item.genre}</span>
                    )}
                    {item.priceInfo && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-800">{item.priceInfo}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
