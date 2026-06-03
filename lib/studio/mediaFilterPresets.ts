/** Presets filtre visuel — CSS `filter` appliqué aux images/vidéos. */
export const MEDIA_FILTER_PRESET_IDS = [
  'none',
  'warm',
  'cold',
  'vintage',
  'bw',
  'cinematic',
  'vivid',
  'dark',
  'pastel',
  'neon',
] as const;

export type MediaFilterPresetId = (typeof MEDIA_FILTER_PRESET_IDS)[number];

export const MEDIA_FILTER_CSS: Record<MediaFilterPresetId, string> = {
  none: '',
  warm: 'sepia(0.35) saturate(1.4) hue-rotate(-10deg) brightness(1.05)',
  cold: 'saturate(0.9) hue-rotate(180deg) brightness(1.08) contrast(1.05)',
  vintage: 'sepia(0.5) contrast(0.9) brightness(0.95) saturate(0.8)',
  bw: 'grayscale(1) contrast(1.1)',
  cinematic: 'contrast(1.15) saturate(0.85) brightness(0.92) sepia(0.15)',
  vivid: 'saturate(1.6) contrast(1.1) brightness(1.05)',
  dark: 'brightness(0.75) contrast(1.2) saturate(0.9)',
  pastel: 'saturate(0.6) brightness(1.12) contrast(0.9)',
  neon: 'saturate(2) contrast(1.3) brightness(1.1) hue-rotate(10deg)',
};

export const MEDIA_FILTER_UI_LABELS: Record<MediaFilterPresetId, string> = {
  none: 'Normal',
  warm: '☀ Warm',
  cold: '❄ Cold',
  vintage: '📷 Vintage',
  bw: '⬛ B&W',
  cinematic: '🎬 Cinéma',
  vivid: '🌈 Vivid',
  dark: '🌑 Dark',
  pastel: '🌸 Pastel',
  neon: '⚡ Neon',
};

export function resolveMediaFilterCss(preset?: string | null): string {
  if (!preset || preset === 'none') return '';
  const key = preset as MediaFilterPresetId;
  return MEDIA_FILTER_CSS[key] ?? '';
}

/** Applique un filtre CSS sur une image pour Konva (pas de `filter` natif sur Konva.Image). */
export function applyCssFilterToImage(
  source: HTMLImageElement,
  filterCss: string
): Promise<HTMLImageElement> {
  if (!filterCss) return Promise.resolve(source);

  const w = source.naturalWidth || source.width;
  const h = source.naturalHeight || source.height;
  if (w <= 0 || h <= 0) return Promise.resolve(source);

  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(source);
        return;
      }
      ctx.filter = filterCss;
      ctx.drawImage(source, 0, 0, w, h);
      const out = new window.Image();
      out.onload = () => resolve(out);
      out.onerror = () => resolve(source);
      out.src = canvas.toDataURL('image/png');
    } catch {
      resolve(source);
    }
  });
}
