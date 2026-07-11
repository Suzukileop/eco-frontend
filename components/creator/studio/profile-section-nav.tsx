import type { ReactNode } from 'react';

export type ProfileSectionId =
  | 'about'
  | 'whyMe'
  | 'experience'
  | 'strengths'
  | 'services'
  | 'portfolio'
  | 'faq'
  | 'links'
  | 'location'
  | 'contact'
  | 'reputation';

export type ProfileSection = {
  id: ProfileSectionId;
  label: string;
  description: string;
};

export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: 'about',
    label: 'About',
    description: 'Explain your value proposition, gender, and working languages.',
  },
  {
    id: 'whyMe',
    label: 'Why choose me',
    description: 'Show what sets you apart with short stories and optional media.',
  },
  {
    id: 'experience',
    label: 'Experience',
    description: 'Highlight your background, years of experience, and proof points.',
  },
  {
    id: 'strengths',
    label: 'Skills & tools',
    description: 'List the skills and software you master (max 12).',
  },
  {
    id: 'services',
    label: 'Services',
    description: 'Describe what you offer, pricing hints, and typical deadlines.',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Choisissez jusqu’à 2 contenus publiés à mettre en avant sur votre portfolio.',
  },
  {
    id: 'faq',
    label: 'FAQ',
    description: 'Answer common questions from potential clients.',
  },
  {
    id: 'links',
    label: 'Links',
    description: 'Websites, social profiles, and CTAs. The first link becomes the primary button on your public profile.',
  },
  {
    id: 'location',
    label: 'Location',
    description: 'City, country, and timezone shown on your public profile.',
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Professional email, phone, and address — control what visitors can see.',
  },
  {
    id: 'reputation',
    label: 'Reputation',
    description: 'Ratings and feedback from users who interacted with your creator profile.',
  },
];

/** Sidebar order: presentation → offers & showcase → reach & contact → reputation last */
export const PROFILE_SECTION_GROUPS: ProfileSectionId[][] = [
  ['about', 'whyMe', 'experience', 'strengths'],
  ['services', 'portfolio', 'faq', 'links'],
  ['location', 'contact', 'reputation'],
];

const PROFILE_SECTION_BY_ID = new Map(PROFILE_SECTIONS.map((section) => [section.id, section]));

export function getProfileSection(id: ProfileSectionId): ProfileSection {
  return PROFILE_SECTION_BY_ID.get(id) ?? PROFILE_SECTIONS[0];
}

function NavIcon({ children, variant = 'nav' }: { children: ReactNode; variant?: 'nav' | 'header' }) {
  if (variant === 'header') {
    return (
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
        aria-hidden
      >
        {children}
      </span>
    );
  }

  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center text-current" aria-hidden>
      {children}
    </span>
  );
}

export function ProfileSectionNavIcon({
  sectionId,
  variant = 'nav',
}: {
  sectionId: ProfileSectionId;
  variant?: 'nav' | 'header';
}) {
  const iconClass = variant === 'header' ? 'h-6 w-6' : 'h-[18px] w-[18px]';
  const stroke = 1.75;
  const wrap = (children: ReactNode) => <NavIcon variant={variant}>{children}</NavIcon>;

  switch (sectionId) {
    case 'reputation':
      return wrap(
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3l2.09 6.26H21l-5.17 3.76 1.98 6.26L12 15.77l-5.81 3.51 1.98-6.26L3 9.26h6.91L12 3z"
          />
        </svg>
      );
    case 'about':
      return wrap(
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h10M7 16h6" />
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      );
    case 'whyMe':
      return wrap(
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 19h14" />
        </svg>
      );
    case 'experience':
      return wrap(
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
          <rect x="4" y="7" width="16" height="13" rx="2" />
          <path strokeLinecap="round" d="M4 12h16" />
        </svg>
      );
    case 'strengths':
      return wrap(
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.7 6.3a4 4 0 00-5.4 5.4L4 17l5.3-5.3a4 4 0 005.4-5.4z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l4 4" />
        </svg>
      );
    case 'services':
      return wrap(
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}>
          <rect x="3" y="8" width="18" height="12" rx="2" />
          <path strokeLinecap="round" d="M12 8V4M8 4h8" />
        </svg>
      );
    case 'portfolio':
      return wrap(
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path strokeLinecap="round" d="M3 10h18M8 15h2M14 15h2" />
        </svg>
      );
    case 'faq':
      return wrap(
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 1.5-2.5 3M12 16.5h.01" />
        </svg>
      );
    case 'links':
      return wrap(
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 00-7.07-7.07L10 5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 00-7.07 0L5.52 12.41a5 5 0 007.07 7.07L14 19" />
        </svg>
      );
    case 'location':
      return wrap(
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6-5.33 6-10a6 6 0 10-12 0c0 4.67 6 10 6 10z" />
          <circle cx="12" cy="11" r="2.5" />
        </svg>
      );
    case 'contact':
      return wrap(
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path strokeLinecap="round" d="M3 7l9 6 9-6" />
        </svg>
      );
    default:
      return null;
  }
}
