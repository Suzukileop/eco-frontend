'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { NotificationDto } from '@/types/ecosystem';

const POLL_MS = 30_000;

export function NotificationBell() {
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get<NotificationDto[]>('/api/notifications');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (ev: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const unreadCount = items.filter((n) => !n.isRead).length;
  const latest = items.slice(0, 5);

  const markOneRead = async (notifId: string) => {
    try {
      await api.put(`/api/notifications/${notifId}/read`);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      await load();
      setOpen(false);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lues` : ''}`}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white shadow-lg"
          role="dialog"
          aria-label="Liste des notifications"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold text-gray-900">Notifications</span>
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              Tout marquer lu
            </button>
          </div>
          {error && <p className="px-4 py-2 text-xs text-red-600">{error}</p>}
          <ul className="max-h-80 overflow-y-auto py-1">
            {latest.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-500">Aucune notification</li>
            ) : (
              latest.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => void markOneRead(n.id)}
                    className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left text-sm transition hover:bg-gray-50 ${
                      !n.isRead ? 'bg-indigo-50/80' : ''
                    }`}
                  >
                    <span className="font-medium text-gray-900">{n.title}</span>
                    {n.message && <span className="text-xs text-gray-600 line-clamp-2">{n.message}</span>}
                    <span className="text-[10px] text-gray-400">
                      {new Date(n.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-gray-100 px-4 py-2">
            <Link
              href="/dashboard/notifications"
              className="block text-center text-xs font-medium text-indigo-600 hover:text-indigo-800"
              onClick={() => setOpen(false)}
            >
              Voir tout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
