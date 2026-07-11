import Link from 'next/link';
import { brandGradientBg } from '@/components/landing/landingBrand';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Marketplace', href: '#marketplace' },
      { label: 'AI Templates', href: '/dashboard/templates' },
    ],
  },
  {
    title: 'Creators',
    links: [
      { label: 'Become a creator', href: '/register?type=creator' },
      { label: 'List a service', href: '/marketplace' },
      { label: 'Reviews', href: '/marketplace' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Legal notice', href: '/legal' },
      { label: 'Terms of service', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Contact', href: 'mailto:support@noprobleme.ai' },
    ],
  },
];

const socials = [
  {
    label: 'TikTok',
    href: '#',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.27a8.2 8.2 0 004.78 1.52V7.34a4.85 4.85 0 01-1.01-.65z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-neutral-50 lp-container-x pb-8 pt-16 transition-colors duration-300 dark:border-white/5 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white ${brandGradientBg}`}>
                NP
              </div>
              <span className="text-lg font-bold lp-text">NoProbleme</span>
            </Link>
            <p className="text-sm leading-relaxed lp-muted">
              The AI content creation platform for creators in Madagascar and French-speaking Africa.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/8 bg-white lp-muted transition-all hover:border-[#F97316]/30 hover:text-[#F97316] dark:border-white/10 dark:bg-neutral-900"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold lp-text">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm lp-muted transition-colors hover:text-[#F97316]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-6 dark:border-white/5 sm:flex-row">
          <p className="text-sm lp-muted">© 2026 NoProbleme — Made with ❤️ in Madagascar</p>
          <div className="flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 dark:border-white/10 dark:bg-neutral-900">
            <svg className="h-4 w-4 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-xs lp-muted">Secure payment via Voaray</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
