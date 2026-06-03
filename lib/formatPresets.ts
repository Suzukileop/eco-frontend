import type { Composition, Format } from '@/types/composition';

export const STANDARD_FORMATS: { label: string; value: Format }[] = [
  { label: '9:16', value: '9:16' },
  { label: '16:9', value: '16:9' },
  { label: '1:1', value: '1:1' },
  { label: '4:5', value: '4:5' },
];

/** Ratios alignés sur les usages courants (feed / vidéo standard). */
export const SOCIAL_FORMAT_PRESETS: {
  id: 'tiktok' | 'youtube' | 'facebook';
  label: string;
  format: Format;
  /** Pour aria-label / title uniquement */
  hint: string;
}[] = [
  { id: 'tiktok', label: 'TikTok', format: '9:16', hint: '9:16 — format natif TikTok' },
  { id: 'youtube', label: 'YouTube', format: '16:9', hint: '16:9 — vidéo YouTube standard' },
  { id: 'facebook', label: 'Facebook', format: '4:5', hint: '4:5 — feed Facebook (Meta)' },
];

export function getAspectRatio(
  format: Format,
  customW?: number,
  customH?: number
): { w: number; h: number } {
  if (format === 'custom') {
    const w = customW && customW > 0 ? customW : 9;
    const h = customH && customH > 0 ? customH : 16;
    return { w, h };
  }
  const map: Record<Exclude<Format, 'custom'>, { w: number; h: number }> = {
    '9:16': { w: 9, h: 16 },
    '16:9': { w: 16, h: 9 },
    '1:1': { w: 1, h: 1 },
    '4:5': { w: 4, h: 5 },
  };
  return map[format as Exclude<Format, 'custom'>] ?? { w: 9, h: 16 };
}

export function getCompositionAspectRatio(composition: Composition | null): {
  w: number;
  h: number;
} {
  if (!composition) return { w: 9, h: 16 };
  return getAspectRatio(
    composition.format,
    composition.customAspectW,
    composition.customAspectH
  );
}

export function formatDisplayLabel(
  format: Format,
  customW?: number,
  customH?: number
): string {
  if (format === 'custom' && customW && customH) {
    return `${customW}:${customH}`;
  }
  return format;
}
