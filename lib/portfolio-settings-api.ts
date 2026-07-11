import api from '@/lib/api';
import {
  mergePortfolioSettings,
  portfolioSettingsStorageKey,
  type PortfolioSettings,
} from '@/components/portfolio/portfolio-settings-types';

export function isPortfolioSettingsEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.keys(value).length === 0;
}

export function readLocalPortfolioSettings(creatorId: string): PortfolioSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(portfolioSettingsStorageKey(creatorId));
    if (!raw) return null;
    return mergePortfolioSettings(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function getCreatorPortfolioSettings(): Promise<Record<string, unknown>> {
  const res = await api.get<Record<string, unknown>>('/api/creator/profile/portfolio-settings');
  return res.data ?? {};
}

export async function updateCreatorPortfolioSettings(
  settings: PortfolioSettings
): Promise<Record<string, unknown>> {
  const res = await api.put<Record<string, unknown>>('/api/creator/profile/portfolio-settings', settings);
  return res.data ?? {};
}

/** Push localStorage settings to backend when the server copy is still empty. */
export async function migrateLocalPortfolioSettingsIfNeeded(
  creatorId: string,
  serverSettings: unknown
): Promise<PortfolioSettings | null> {
  if (!isPortfolioSettingsEmpty(serverSettings)) return null;
  const local = readLocalPortfolioSettings(creatorId);
  if (!local) return null;
  await updateCreatorPortfolioSettings(local);
  return local;
}

/** Owner sync: prefer server; migrate local → server when server is empty. */
export async function syncOwnerPortfolioSettings(
  creatorId: string,
  serverSnapshot: unknown
): Promise<PortfolioSettings> {
  if (!isPortfolioSettingsEmpty(serverSnapshot)) {
    return mergePortfolioSettings(serverSnapshot);
  }

  try {
    const remote = await getCreatorPortfolioSettings();
    if (!isPortfolioSettingsEmpty(remote)) {
      return mergePortfolioSettings(remote);
    }
  } catch {
    // fall through to local migration
  }

  const migrated = await migrateLocalPortfolioSettingsIfNeeded(creatorId, serverSnapshot);
  if (migrated) return migrated;

  const local = readLocalPortfolioSettings(creatorId);
  if (local) return local;

  return mergePortfolioSettings(serverSnapshot);
}
