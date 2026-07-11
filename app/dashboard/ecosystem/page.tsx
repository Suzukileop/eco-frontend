'use client';

import Link from 'next/link';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { EcosystemGeometricBackground } from '@/components/ecosystem/EcosystemGeometricBackground';
import { EcosystemHeroCard } from '@/components/ecosystem/EcosystemHeroCard';
import { EcosystemRequestsList } from '@/components/ecosystem/EcosystemRequestsList';

export default function EcosystemHubPage() {
  return (
    <>
      <EcosystemGeometricBackground />
      <div className="relative z-10">
        <DashboardHomeShell wide>
          <div className="space-y-6">
            <div className="flex justify-end">
              <Link
                href="/dashboard/ecosystem/new"
                className="inline-flex items-center gap-2 rounded-xl border border-[#F97316]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#EA580C] transition hover:border-[#F97316]/50 hover:bg-[#FFF7ED] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/40 focus-visible:ring-offset-2 dark:border-[#F97316]/40 dark:bg-neutral-900 dark:text-[#FB923C] dark:hover:bg-[#F97316]/10"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New request
              </Link>
            </div>

            <EcosystemHeroCard />
            <EcosystemRequestsList />
          </div>
        </DashboardHomeShell>
      </div>
    </>
  );
}
