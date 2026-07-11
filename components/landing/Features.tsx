'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { brandGradientText } from '@/components/landing/landingBrand';

const ICON_CLASS = 'h-7 w-7 shrink-0 text-[#F97316]';

function FeatureIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      className={ICON_CLASS}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function IconAutomation() {
  return (
    <FeatureIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </FeatureIcon>
  );
}

function IconTemplates() {
  return (
    <FeatureIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </FeatureIcon>
  );
}

function IconMarketplace() {
  return (
    <FeatureIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </FeatureIcon>
  );
}

const features = [
  {
    icon: IconAutomation,
    title: 'Automated content ecosystem',
    description:
      'Manage your entire content strategy from one place. From niche research to publishing, our AI orchestrates everything.',
    items: [
      'Smart publishing scheduler',
      'AI niche strategy bot',
      'Automated follow-up emails',
      'Real-time analytics',
    ],
    href: '/register',
  },
  {
    icon: IconTemplates,
    title: 'AI-generated viral templates',
    description:
      'AI analyzes your video frame by frame and generates unique backgrounds. Your content, reinvented in 30 seconds.',
    items: [
      'Multi-dimensional AI video analysis',
      'Background generation (3 images per sequence)',
      'Direct export to the built-in editor',
      'Templates tailored to your niche',
    ],
    href: '/register',
  },
  {
    icon: IconMarketplace,
    title: 'Verified creator marketplace',
    description:
      'Find the perfect creator for your project. Briefing, delivery, and secure payment — all in one place.',
    items: [
      'Verified profiles with portfolio',
      'Brief → Delivery → Review',
      'Secure payment via Voaray',
      'Dedicated support for every order',
    ],
    href: '#marketplace',
  },
];

function DiamondBullet() {
  return (
    <span
      className="mt-1.5 inline-block h-2 w-2 shrink-0 rotate-45 border border-neutral-300 dark:border-neutral-500"
      aria-hidden="true"
    />
  );
}

function FeatureCard({
  feat,
  snapViewport,
  index,
}: {
  feat: (typeof features)[number];
  snapViewport: boolean;
  index: number;
}) {
  const Icon = feat.icon;
  const visibleItems = snapViewport ? feat.items.slice(0, 3) : feat.items;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`flex h-full flex-col items-center rounded-2xl border border-neutral-200 bg-white text-center transition-colors dark:border-neutral-700 dark:bg-neutral-900 ${
        snapViewport ? 'px-4 py-5 sm:px-5 sm:py-6' : 'px-6 py-8 sm:px-8 sm:py-10'
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-600 sm:h-16 sm:w-16">
          <Icon />
        </div>
        <div className="my-2 h-5 w-px bg-neutral-200 dark:bg-neutral-600 sm:my-3 sm:h-6" aria-hidden="true" />
        <h3
          className={`max-w-[16rem] font-bold leading-snug text-[#F97316] sm:max-w-none ${
            snapViewport ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
          }`}
        >
          {feat.title}
        </h3>
      </div>

      <p
        className={`mx-auto mt-4 max-w-[18rem] leading-relaxed lp-muted sm:max-w-[20rem] ${
          snapViewport ? 'mb-5 text-xs sm:text-sm' : 'mb-7 text-sm md:text-[15px]'
        }`}
      >
        {feat.description}
      </p>

      <ul
        className={`mx-auto w-full max-w-[15rem] space-y-3 text-left sm:max-w-[17rem] ${
          snapViewport ? 'mb-5' : 'mb-8'
        }`}
      >
        {visibleItems.map((item) => (
          <li
            key={item}
            className={`flex items-start gap-3 lp-text ${snapViewport ? 'text-xs sm:text-sm' : 'text-sm'}`}
          >
            <DiamondBullet />
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>

      <Link
        href={feat.href}
        className={`mt-auto inline-flex items-center gap-6 rounded-full border border-neutral-300 bg-transparent font-medium lowercase lp-text transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-600 dark:hover:border-neutral-500 dark:hover:bg-neutral-800 ${
          snapViewport ? 'px-5 py-2 text-xs sm:px-6 sm:text-sm' : 'px-8 py-2.5 text-sm'
        }`}
      >
        <span>Get started</span>
        <span className="text-neutral-400 dark:text-neutral-500" aria-hidden="true">
          →
        </span>
      </Link>
    </motion.div>
  );
}

type FeaturesProps = {
  /** Compact layout for 100dvh snap panel (Before/After → Features bridge). */
  snapViewport?: boolean;
  /** Anchor id for navbar link — only on the primary instance. */
  withAnchor?: boolean;
};

export function Features({ snapViewport = false, withAnchor = true }: FeaturesProps) {
  return (
    <section
      id={withAnchor ? 'features' : undefined}
      className={`lp-bg w-full transition-colors duration-300 ${
        snapViewport
          ? 'flex h-full min-h-full flex-col overflow-hidden px-4 pb-4 pt-20 sm:px-6 sm:pb-6 sm:pt-24 md:px-10 lg:px-14 xl:px-20'
          : 'px-4 py-16 sm:px-6 md:px-10 lg:px-14 lg:py-24 xl:px-20 xl:py-32'
      }`}
    >
      <div
        className={`lp-bg-card mx-auto flex w-full max-w-[90rem] flex-col border border-black/5 shadow-sm transition-colors duration-300 dark:border-white/10 ${
          snapViewport
            ? 'min-h-0 flex-1 justify-center overflow-hidden rounded-2xl px-5 py-6 sm:rounded-3xl sm:px-8 sm:py-8'
            : 'rounded-2xl px-6 py-10 sm:rounded-3xl sm:px-10 sm:py-12 md:px-12 lg:px-16'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={
            snapViewport
              ? '-mt-2 mb-5 text-center sm:-mt-3 sm:mb-6'
              : 'mb-16 text-center lg:mb-20'
          }
        >
          <h2
            className={`font-bold leading-tight tracking-tight lp-text ${
              snapViewport ? 'text-[1.7rem] sm:text-4xl lg:text-[2.85rem]' : 'text-3xl md:text-4xl lg:text-5xl'
            }`}
          >
            Everything you need
            <br className="hidden sm:block" />
            {' '}to dominate{' '}
            <span className={brandGradientText}>social media</span>
          </h2>
          <p
            className={`mx-auto max-w-2xl leading-relaxed lp-muted ${
              snapViewport ? 'mt-4 text-base md:text-lg' : 'mt-5 text-base md:text-lg'
            }`}
          >
            A complete platform built for creators who want to grow on TikTok, Instagram, and YouTube.
          </p>
        </motion.div>

        <div
          className={
            snapViewport
              ? 'grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5'
              : 'grid gap-14 md:grid-cols-3 md:gap-10 lg:gap-14 xl:gap-16'
          }
        >
          {features.map((feat, i) => (
            <FeatureCard key={feat.title} feat={feat} snapViewport={snapViewport} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
