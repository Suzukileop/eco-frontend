'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createDefaultPortfolioSettings,
  mergePortfolioSettings,
  portfolioSettingsStorageKey,
  type PortfolioNavSettings,
  type PortfolioSettings,
  type PortfolioSettingsSectionId,
} from '@/components/portfolio/portfolio-settings-types';
import { mergeGlobalSettings, type PortfolioGlobalSettingsPatch } from '@/components/portfolio/portfolio-global-settings';
import {
  DEFAULT_PORTFOLIO_THEME_ID,
  getPortfolioTheme,
  isBuiltinPortfolioThemeId,
  isCustomPortfolioThemeId,
  isLockedBuiltinPortfolioTheme,
  type PortfolioBuiltinThemeId,
  type PortfolioThemeId,
} from '@/components/portfolio/portfolio-themes';
import {
  createDraftCustomTheme,
  duplicateBuiltinAsCustom,
  duplicateCustomTheme,
  customThemeHasPendingChanges,
  refreshCustomThemeFromSettings,
  type PortfolioCustomTheme,
} from '@/components/portfolio/portfolio-custom-themes';
import { createBuiltinThemeSettings } from '@/components/portfolio/portfolio-builtin-theme-presets';
import {
  isPortfolioSettingsEmpty,
  migrateLocalPortfolioSettingsIfNeeded,
  syncOwnerPortfolioSettings,
  updateCreatorPortfolioSettings,
} from '@/lib/portfolio-settings-api';

type PortfolioContentSectionId = Exclude<PortfolioSettingsSectionId, 'theme' | 'navigation'>;

const SAVE_DEBOUNCE_MS = 400;

function resolveVisitorSettings(serverSettings: unknown | undefined): PortfolioSettings {
  if (!isPortfolioSettingsEmpty(serverSettings)) {
    return mergePortfolioSettings(serverSettings);
  }
  return createDefaultPortfolioSettings();
}

function refreshActiveCustomTheme(current: PortfolioSettings): PortfolioSettings {
  if (!isCustomPortfolioThemeId(current.themeId)) return current;
  return {
    ...current,
    customThemes: current.customThemes.map((theme) =>
      theme.id === current.themeId ? refreshCustomThemeFromSettings(theme, current) : theme
    ),
  };
}

/**
 * Editorial Warm is immutable. Personalization while it is active forks a copy.
 * Noir / Blanc is editable in place — no forced duplication.
 */
function forkBuiltinOnPersonalization(current: PortfolioSettings): PortfolioSettings {
  if (isCustomPortfolioThemeId(current.themeId)) {
    return refreshActiveCustomTheme(current);
  }

  if (!isLockedBuiltinPortfolioTheme(current.themeId)) {
    return current;
  }

  const label = getPortfolioTheme(current.themeId).label;
  const draft = isBuiltinPortfolioThemeId(current.themeId)
    ? duplicateBuiltinAsCustom(current, `${label} copie`, current.themeId)
    : createDraftCustomTheme(current, `${label} copie`);
  return {
    ...current,
    themeId: draft.id,
    customThemes: [...current.customThemes, draft],
  };
}

function applySnapshotTheme(
  current: PortfolioSettings,
  themeId: PortfolioThemeId
): PortfolioSettings {
  if (themeId === current.themeId && isBuiltinPortfolioThemeId(themeId)) {
    return current;
  }

  if (isBuiltinPortfolioThemeId(themeId)) {
    // Restore pristine builtin defaults; keep saved custom themes in the list.
    return createBuiltinThemeSettings(themeId, current.customThemes);
  }

  const custom = current.customThemes.find((theme) => theme.id === themeId);
  if (!custom) return current;

  return mergePortfolioSettings({
    ...custom.snapshot,
    themeId: custom.id,
    customThemes: current.customThemes,
  });
}

export function usePortfolioSettings(
  creatorId: string,
  options?: {
    initialSettings?: unknown;
    canEdit?: boolean;
  }
) {
  const canEdit = options?.canEdit ?? false;
  const initialSettings = options?.initialSettings;
  const [settings, setSettings] = useState<PortfolioSettings>(() => {
    if (!isPortfolioSettingsEmpty(initialSettings)) {
      return mergePortfolioSettings(initialSettings);
    }
    return createDefaultPortfolioSettings();
  });
  const [hydrated, setHydrated] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSettingsRef = useRef<PortfolioSettings>(settings);
  const ownerSyncedRef = useRef(false);

  useEffect(() => {
    latestSettingsRef.current = settings;
  }, [settings]);

  const writeLocalCache = useCallback(
    (next: PortfolioSettings) => {
      if (!canEdit) return;
      try {
        localStorage.setItem(portfolioSettingsStorageKey(creatorId), JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
    },
    [canEdit, creatorId]
  );

  const persistToBackend = useCallback(
    (next: PortfolioSettings, immediate = false) => {
      if (!canEdit) return;
      latestSettingsRef.current = next;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      const run = () => {
        void updateCreatorPortfolioSettings(next).catch(() => {});
      };

      if (immediate) {
        run();
        return;
      }

      saveTimerRef.current = setTimeout(run, SAVE_DEBOUNCE_MS);
    },
    [canEdit]
  );

  const flushPendingSave = useCallback(() => {
    if (!canEdit) return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    persistToBackend(latestSettingsRef.current, true);
  }, [canEdit, persistToBackend]);

  const saveSettings = useCallback(
    (next: PortfolioSettings, immediate = false) => {
      setSettings(next);
      writeLocalCache(next);
      persistToBackend(next, immediate);
    },
    [persistToBackend, writeLocalCache]
  );

  const applySettings = useCallback(
    (updater: (current: PortfolioSettings) => PortfolioSettings) => {
      setSettings((current) => {
        const next = updater(current);
        writeLocalCache(next);
        persistToBackend(next);
        return next;
      });
    },
    [persistToBackend, writeLocalCache]
  );

  useEffect(() => {
    if (!canEdit) {
      setSettings(resolveVisitorSettings(initialSettings));
      setHydrated(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const resolved = await syncOwnerPortfolioSettings(creatorId, initialSettings);
        if (!cancelled) {
          setSettings(resolved);
          writeLocalCache(resolved);
          ownerSyncedRef.current = true;
        }
      } catch {
        if (!cancelled) {
          const migrated = await migrateLocalPortfolioSettingsIfNeeded(creatorId, initialSettings);
          const fallback = migrated ?? mergePortfolioSettings(initialSettings);
          setSettings(fallback);
          writeLocalCache(fallback);
          ownerSyncedRef.current = true;
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [creatorId, canEdit, initialSettings, writeLocalCache]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!canEdit) return;

    const flush = () => flushPendingSave();
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);

    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      flushPendingSave();
    };
  }, [canEdit, flushPendingSave]);

  const updateSection = useCallback(
    <T extends PortfolioContentSectionId>(
      sectionId: T,
      patch: Partial<PortfolioSettings[T]>
    ) => {
      applySettings((current) => {
        const withPatch = {
          ...current,
          [sectionId]: { ...current[sectionId], ...patch },
        };
        return forkBuiltinOnPersonalization(withPatch);
      });
    },
    [applySettings]
  );

  const resetSettings = useCallback(() => {
    saveSettings(createDefaultPortfolioSettings(), true);
  }, [saveSettings]);

  /** Restore a builtin theme to factory defaults (works even when already active). */
  const resetBuiltinTheme = useCallback(
    (themeId: PortfolioBuiltinThemeId) => {
      applySettings((current) => createBuiltinThemeSettings(themeId, current.customThemes));
    },
    [applySettings]
  );

  const setThemeId = useCallback(
    (themeId: PortfolioThemeId) => {
      applySettings((current) => applySnapshotTheme(current, themeId));
    },
    [applySettings]
  );

  const updateNavigation = useCallback(
    (patch: Partial<PortfolioNavSettings>) => {
      applySettings((current) =>
        forkBuiltinOnPersonalization({
          ...current,
          navigation: { ...current.navigation, ...patch },
        })
      );
    },
    [applySettings]
  );

  const updateGlobal = useCallback(
    (patch: PortfolioGlobalSettingsPatch) => {
      applySettings((current) => {
        const withPatch = {
          ...current,
          global: mergeGlobalSettings(current.global, patch),
        };
        return forkBuiltinOnPersonalization(withPatch);
      });
    },
    [applySettings]
  );

  const saveCustomTheme = useCallback(
    (themeId: string, name?: string): boolean => {
      const current = latestSettingsRef.current;
      const theme = current.customThemes.find((item) => item.id === themeId);
      if (!theme) return false;

      const nextName = name?.trim() || theme.name;
      const nameChanged = nextName !== theme.name;
      const contentChanged = customThemeHasPendingChanges(theme, current);
      if (!nameChanged && !contentChanged && theme.saved) return false;

      const refreshed = refreshCustomThemeFromSettings(theme, current);
      applySettings(() => ({
        ...current,
        themeId,
        customThemes: current.customThemes.map((item) =>
          item.id === themeId
            ? {
                ...refreshed,
                name: nextName,
                saved: true,
              }
            : item
        ),
      }));
      return true;
    },
    [applySettings]
  );

  const renameCustomTheme = useCallback(
    (themeId: string, name: string): boolean => {
      const trimmed = name.trim();
      if (!trimmed) return false;

      const current = latestSettingsRef.current;
      const theme = current.customThemes.find((item) => item.id === themeId);
      if (!theme || theme.name === trimmed) return false;

      applySettings(() => ({
        ...current,
        customThemes: current.customThemes.map((item) =>
          item.id === themeId
            ? { ...item, name: trimmed, updatedAt: new Date().toISOString() }
            : item
        ),
      }));
      return true;
    },
    [applySettings]
  );

  const duplicateTheme = useCallback(
    (themeId: PortfolioThemeId) => {
      applySettings((current) => {
        let copy: PortfolioCustomTheme;
        if (isBuiltinPortfolioThemeId(themeId)) {
          const label = getPortfolioTheme(themeId).label;
          const sourceSettings =
            current.themeId === themeId
              ? current
              : createBuiltinThemeSettings(themeId, current.customThemes);
          copy = duplicateBuiltinAsCustom(sourceSettings, `${label} copie`, themeId);
        } else {
          const source = current.customThemes.find((theme) => theme.id === themeId);
          if (!source) return current;
          copy = duplicateCustomTheme(source);
        }
        return {
          ...current,
          themeId: copy.id,
          customThemes: [...current.customThemes, copy],
        };
      });
    },
    [applySettings]
  );

  const deleteCustomTheme = useCallback(
    (themeId: string) => {
      if (!isCustomPortfolioThemeId(themeId)) return;
      applySettings((current) => {
        const nextThemes = current.customThemes.filter((theme) => theme.id !== themeId);
        const nextThemeId =
          current.themeId === themeId ? DEFAULT_PORTFOLIO_THEME_ID : current.themeId;
        return {
          ...current,
          themeId: nextThemeId,
          customThemes: nextThemes,
        };
      });
    },
    [applySettings]
  );

  return {
    settings,
    hydrated,
    ownerSynced: ownerSyncedRef.current,
    persist: saveSettings,
    flushPendingSave,
    updateSection,
    resetSettings,
    resetBuiltinTheme,
    setThemeId,
    updateNavigation,
    updateGlobal,
    saveCustomTheme,
    renameCustomTheme,
    duplicateTheme,
    deleteCustomTheme,
  };
}
