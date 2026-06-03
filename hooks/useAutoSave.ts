import { useCallback, useEffect, useRef, useState } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import { saveComposition } from '@/lib/compositions';

const AUTOSAVE_INTERVAL_MS = 30_000;

export function useAutoSave(compositionId: string | null) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const lastSavedRef = useRef<string | null>(null);

  const save = useCallback(async () => {
    if (!compositionId) return;
    const { composition } = useCompositionStore.getState();
    if (!composition) return;

    const snapshot = JSON.stringify(composition);
    if (snapshot === lastSavedRef.current) return; // Nothing changed

    setSaving(true);
    try {
      await saveComposition(compositionId, {
        title: composition.title,
        compositionJson: composition,
        format: composition.format,
        durationSeconds: composition.duration,
      });
      lastSavedRef.current = snapshot;
      setLastSaved(new Date());
    } catch {
      // Silently fail on autosave — user can manually save
    } finally {
      setSaving(false);
    }
  }, [compositionId]);

  // Autosave every 30 seconds
  useEffect(() => {
    if (!compositionId) return;
    const interval = setInterval(() => void save(), AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [compositionId, save]);

  return { save, saving, lastSaved };
}
