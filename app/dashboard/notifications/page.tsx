'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NotificationDto } from '@/types/ecosystem';

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<NotificationDto[]>('/api/notifications');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Liste indisponible.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (id: string) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const markAll = async () => {
    try {
      await api.put('/api/notifications/read-all');
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800">
              ← Tableau de bord
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Notifications</h1>
          </div>
          <button
            type="button"
            onClick={() => void markAll()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Tout marquer lu
          </button>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-gray-500 shadow-sm">
            Aucune notification.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
            {items.map((n) => (
              <li key={n.id} className={`px-4 py-4 ${!n.isRead ? 'bg-indigo-50/60' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{n.title}</p>
                    {n.message && <p className="mt-1 text-sm text-gray-600">{n.message}</p>}
                    <p className="mt-2 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => void markRead(n.id)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Marquer lu
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardHomeShell>
  );
}
