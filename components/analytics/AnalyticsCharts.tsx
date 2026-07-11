'use client';

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
import type { AnalyticsDashboardDto, DailyPublicationPoint } from '@/types/analytics';

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: '#E1306C',
  TIKTOK: '#010101',
  YOUTUBE: '#FF0000',
  FACEBOOK: '#1877F2',
};

function pickColor(platform: string): string {
  return PLATFORM_COLORS[platform.toUpperCase()] ?? '#6366f1';
}

type Props = {
  data: AnalyticsDashboardDto;
};

export default function AnalyticsCharts({ data }: Props) {
  return (
    <>
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Publications par jour (30 derniers jours)
        </h2>
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

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Répartition par plateforme</h2>
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
  );
}
