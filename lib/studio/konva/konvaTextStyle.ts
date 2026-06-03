import type Konva from 'konva';
import type { Clip, TextPreset } from '@/types/composition';
import { resolveTextPresetStyle } from '@/lib/textStyleCatalog';

export interface KonvaTextVisual {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  fillLinearGradientStartPoint?: { x: number; y: number };
  fillLinearGradientEndPoint?: { x: number; y: number };
  fillLinearGradientColorStops?: (number | string)[];
  /** Deuxième couche (lueur / double contour) */
  glow?: {
    fill: string;
    shadowColor: string;
    shadowBlur: number;
    stroke?: string;
    strokeWidth?: number;
  };
}

const GRADIENT_STOPS: Partial<Record<TextPreset, [string, string]>> = {
  'gradient-gold': ['#f6d365', '#fda085'],
  'gradient-fire': ['#ff4e50', '#f9d423'],
  'gradient-ocean': ['#667eea', '#764ba2'],
  'gradient-sunset': ['#f093fb', '#f5576c'],
  'gradient-mint': ['#11998e', '#38ef7d'],
  'gradient-purple': ['#a855f7', '#ec4899'],
};

function parseShadow(shadow: string | undefined): Partial<KonvaTextVisual> {
  if (!shadow) return {};
  const parts = shadow.split(/,\s*/);
  const first = parts[0]?.trim() ?? '';
  const m = first.match(/^(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?\s+(.+)$/);
  if (!m) return { shadowColor: 'black', shadowBlur: 4, shadowOffsetX: 0, shadowOffsetY: 2, shadowOpacity: 0.85 };
  return {
    shadowOffsetX: Number(m[1]),
    shadowOffsetY: Number(m[2]),
    shadowBlur: m[3] ? Number(m[3]) : 0,
    shadowColor: m[4].trim(),
    shadowOpacity: 1,
  };
}

/** Styles visuels Konva alignés sur resolveTextPresetStyle (Remotion / preview). */
export function resolveKonvaTextVisual(clip: Clip, boxWidth: number, boxHeight: number): KonvaTextVisual {
  const preset = clip.textPreset ?? 'none';
  const css = resolveTextPresetStyle(clip);
  const baseColor = (css.color as string | undefined) ?? clip.fontColor ?? '#ffffff';
  const strokeCss = css.WebkitTextStroke as string | undefined;
  const strokeMatch = strokeCss?.match(/^([\d.]+)px\s+(.+)$/);

  const visual: KonvaTextVisual = {
    fill: baseColor,
    stroke: strokeMatch?.[2] ?? (clip.strokeWidth ? clip.strokeColor ?? '#000000' : undefined),
    strokeWidth: strokeMatch ? Number(strokeMatch[1]) : clip.strokeWidth,
    ...parseShadow(css.textShadow as string | undefined),
  };

  const grad = GRADIENT_STOPS[preset];
  if (grad) {
    visual.fill = '#ffffff';
    visual.fillLinearGradientStartPoint = { x: 0, y: 0 };
    visual.fillLinearGradientEndPoint = { x: boxWidth, y: boxHeight };
    visual.fillLinearGradientColorStops = [0, grad[0], 1, grad[1]];
  }

  switch (preset) {
    case 'neon':
      visual.glow = {
        fill: baseColor,
        shadowColor: baseColor,
        shadowBlur: 28,
      };
      visual.shadowColor = baseColor;
      visual.shadowBlur = 16;
      break;
    case 'double-outline':
      visual.glow = {
        fill: '#22d3ee',
        stroke: '#22d3ee',
        strokeWidth: 4,
        shadowColor: 'transparent',
        shadowBlur: 0,
      };
      break;
    case 'pop-bold':
      visual.shadowColor = '#ff0066';
      visual.shadowOffsetX = 4;
      visual.shadowOffsetY = 4;
      visual.shadowBlur = 0;
      break;
    case 'comic':
      visual.shadowColor = '#e63946';
      visual.shadowOffsetX = 3;
      visual.shadowOffsetY = 3;
      visual.shadowBlur = 0;
      break;
    default:
      break;
  }

  if (clip.textShadow && preset === 'none') {
    const c = clip.textShadowColor ?? 'rgba(0,0,0,0.8)';
    visual.shadowColor = c;
    visual.shadowBlur = clip.textShadowBlur ?? 4;
    visual.shadowOffsetX = clip.textShadowX ?? 2;
    visual.shadowOffsetY = clip.textShadowY ?? 2;
    visual.shadowOpacity = 1;
  }

  return visual;
}

export function konvaFontStyle(clip: Clip): string {
  const parts: string[] = [];
  if (clip.fontStyle === 'italic') parts.push('italic');
  if (clip.fontWeight === 'bold') parts.push('bold');
  return parts.length > 0 ? parts.join(' ') : 'normal';
}

export function konvaFontFamily(clip: Clip): string {
  const f = clip.fontFamily;
  if (!f || f === 'inherit') return 'Arial, sans-serif';
  return f;
}

export function hasTextBackground(clip: Clip): boolean {
  const bgHex = clip.backgroundColor;
  const bgAlpha = clip.backgroundOpacity ?? 0;
  return Boolean(bgHex && bgAlpha > 0);
}

export function konvaTextBackgroundFill(clip: Clip): string {
  const bgHex = clip.backgroundColor ?? '#000000';
  const bgAlpha = clip.backgroundOpacity ?? 0;
  const a = Math.round(bgAlpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${bgHex}${a}`;
}

export function applyVisualToKonvaText(
  node: Konva.Text,
  visual: KonvaTextVisual,
  boxWidth: number,
  boxHeight: number
): void {
  node.fill(visual.fill);
  node.stroke(visual.stroke);
  node.strokeWidth(visual.strokeWidth ?? 0);

  if (visual.fillLinearGradientColorStops) {
    node.fillLinearGradientStartPoint(visual.fillLinearGradientStartPoint ?? { x: 0, y: 0 });
    node.fillLinearGradientEndPoint(
      visual.fillLinearGradientEndPoint ?? { x: boxWidth, y: boxHeight }
    );
    node.fillLinearGradientColorStops(visual.fillLinearGradientColorStops);
  } else {
    node.fillLinearGradientColorStops(undefined);
  }

  node.shadowColor(visual.shadowColor ?? 'transparent');
  node.shadowBlur(visual.shadowBlur ?? 0);
  node.shadowOffsetX(visual.shadowOffsetX ?? 0);
  node.shadowOffsetY(visual.shadowOffsetY ?? 0);
  node.shadowOpacity(visual.shadowOpacity ?? 1);
}
