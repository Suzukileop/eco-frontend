'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { AnalyticsDashboardDto, DailyPublicationPoint, PlatformShareSlice } from '@/types/analytics';

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: '#E1306C',
  TIKTOK: '#010101',
  YOUTUBE: '#FF0000',
  FACEBOOK: '#1877F2',
};

function pickColor(platform: string): string {
  const key = platform.toUpperCase();
  return PLATFORM_COLORS[key] ?? '#6366f1';
}

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
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">Vue d’ensemble de vos publications.</p>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : !data ? null : isEmpty ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-700">
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

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900">Publications par jour (30 derniers jours)</h2>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.publicationsLast30Days}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number, _name: string, item: { payload?: DailyPublicationPoint }) => {
                        const views = item?.payload?.views;
                        return [
                          typeof views === 'number' ? `${value} (vues : ${views})` : value,
                          'Publications',
                        ];
                      }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900">Répartition par plateforme</h2>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.platformDistribution}
                      dataKey="count"
                      nameKey="platform"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.platformDistribution.map((entry, index) => (
                        <Cell key={`cell-${entry.platform}-${index}`} fill={pickColor(entry.platform)} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardHomeShell>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
