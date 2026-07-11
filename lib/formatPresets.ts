import type { Composition, Format } from '@/types/composition';

/** Entrée menu format preview (style CapCut). */
export type CapcutFormatMenuItem = {
  id: string;
  ratioLabel: string;
  subtitle?: string;
  /** Ratio cible (largeur × hauteur). */
  aspectW: number;
  aspectH: number;
  /** Format stocké si prédéfini, sinon `custom` + aspect. */
  storeFormat?: Format;
  social?: 'tiktok' | 'youtube' | 'instagram' | 'linkedin' | 'facebook';
};

/** Liste verticale « Format d'origine » (réf. CapCut). */
export const CAPCUT_FORMAT_MENU: CapcutFormatMenuItem[] = [
  { id: '16:9', ratioLabel: '16:9', subtitle: 'Publicités YouTube', aspectW: 16, aspectH: 9, storeFormat: '16:9', social: 'youtube' },
  { id: '4:3', ratioLabel: '4:3', subtitle: 'Publicités LinkedIn', aspectW: 4, aspectH: 3, social: 'linkedin' },
  { id: '2:1', ratioLabel: '2:1', aspectW: 2, aspectH: 1 },
  { id: '9:16', ratioLabel: '9:16', subtitle: 'TikTok, publicités…', aspectW: 9, aspectH: 16, storeFormat: '9:16', social: 'tiktok' },
  { id: '1:1', ratioLabel: '1:1', subtitle: 'Publications Insta…', aspectW: 1, aspectH: 1, storeFormat: '1:1', social: 'instagram' },
  { id: '3:4', ratioLabel: '3:4', aspectW: 3, aspectH: 4 },
  { id: '4:5', ratioLabel: '4:5', subtitle: 'Feed Facebook', aspectW: 4, aspectH: 5, storeFormat: '4:5', social: 'facebook' },
];

export function aspectRatiosEqual(aW: number, aH: number, bW: number, bH: number): boolean {
  if (aW <= 0 || aH <= 0 || bW <= 0 || bH <= 0) return false;
  return Math.abs(aW * bH - bW * aH) < 0.5;
}

export function getActiveCapcutMenuId(
  format: Format,
  customW?: number,
  customH?: number
): string | null {
  const { w, h } = getAspectRatio(format, customW, customH);
  const hit = CAPCUT_FORMAT_MENU.find((item) => aspectRatiosEqual(w, h, item.aspectW, item.aspectH));
  return hit?.id ?? null;
}

export function applyCapcutFormatMenuItem(
  item: CapcutFormatMenuItem,
  setFormat: (f: Format) => void,
  setCustomAspect: (w: number, h: number) => void
): void {
  if (item.storeFormat && item.storeFormat !== 'custom') {
    setFormat(item.storeFormat);
    return;
  }
  setCustomAspect(item.aspectW, item.aspectH);
}

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
