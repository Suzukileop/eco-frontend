'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AnalyticsChartsSkeleton } from '@/components/analytics/AnalyticsChartsSkeleton';
import type { AnalyticsDashboardDto, DailyPublicationPoint, PlatformShareSlice } from '@/types/analytics';

const AnalyticsCharts = dynamic(() => import('@/components/analytics/AnalyticsCharts'), {
  loading: () => <AnalyticsChartsSkeleton />,
  ssr: false,
});

function normalizeDashboard(raw: unknown): AnalyticsDashboardDto {
  if (!raw || typeof raw !== 'object') {
    return {
      kpis: {
        scheduledCount: 0,
        publishedCount: 0,
        successRatePercent: 0,
        totalViews: 0,
      },
      publicationsLast30Days: [],
      platformDistribution: [],
    };
  }
  const r = raw as Record<string, unknown>;
  const kpisRaw = (r.kpis ?? r) as Record<string, unknown>;
  const kpis = {
    scheduledCount: Number(kpisRaw.scheduledCount ?? kpisRaw.scheduledPublications ?? 0) || 0,
    publishedCount: Number(kpisRaw.publishedCount ?? kpisRaw.published ?? 0) || 0,
    successRatePercent: Number(kpisRaw.successRatePercent ?? kpisRaw.successRate ?? 0) || 0,
    totalViews: Number(kpisRaw.totalViews ?? kpisRaw.views ?? 0) || 0,
  };
  const publicationsLast30Days = Array.isArray(r.publicationsLast30Days)
    ? (r.publicationsLast30Days as DailyPublicationPoint[])
    : Array.isArray(r.dailyPublications)
      ? (r.dailyPublications as DailyPublicationPoint[])
      : [];
  const platformDistribution = Array.isArray(r.platformDistribution)
    ? (r.platformDistribution as PlatformShareSlice[])
    : Array.isArray(r.platforms)
      ? (r.platforms as PlatformShareSlice[])
      : [];
  return { kpis, publicationsLast30Days, platformDistribution };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await api.get<unknown>('/api/analytics/dashboard');
      setData(normalizeDashboard(res.data));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger les analytics.'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const isEmpty =
    data &&
    data.kpis.scheduledCount === 0 &&
    data.kpis.publishedCount === 0 &&
    data.publicationsLast30Days.length === 0 &&
    data.platformDistribution.length === 0;

  return (
    <DashboardHomeShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">Vue d’ensemble de vos publications.</p>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : !data ? null : isEmpty ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <p className="text-gray-700 dark:text-neutral-300">
              Aucune publication pour le moment — commencez par planifier un contenu !
            </p>
            <Link
              href="/dashboard/scheduler"
              className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Ouvrir le planificateur
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Publications planifiées" value={String(data.kpis.scheduledCount)} />
              <KpiCard label="Publiées" value={String(data.kpis.publishedCount)} />
              <KpiCard
                label="Taux de réussite"
                value={`${data.kpis.successRatePercent.toFixed(1)} %`}
              />
              <KpiCard label="Total vues" value={String(data.kpis.totalViews)} />
            </div>

            <AnalyticsCharts data={data} />
          </>
        )}
      </div>
    </DashboardHomeShell>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
