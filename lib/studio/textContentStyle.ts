import type { CSSProperties } from 'react';
import type { Clip } from '@/types/composition';
import { resolveTextPresetStyle } from '@/lib/textStyleCatalog';
import {
  resolveClipRenderFontSizePx,
  STUDIO_TEXT_CANVAS_REF_HEIGHT,
  TEXT_ZONE_PADDING_X,
  TEXT_ZONE_PADDING_Y,
} from '@/lib/studio/textZone/textZoneGeometry';

function buildTextShadow(clip: Clip): string {
  if (clip.textPreset && clip.textPreset !== 'none') return '';
  if (clip.textShadow) {
    const color = clip.textShadowColor ?? 'rgba(0,0,0,0.8)';
    const x = clip.textShadowX ?? 2;
    const y = clip.textShadowY ?? 2;
    const blur = clip.textShadowBlur ?? 4;
    return `${x}px ${y}px ${blur}px ${color}`;
  }
  return '0 1px 4px rgba(0,0,0,0.7)';
}

/** Style contenu texte classique — cadre serré sur les glyphes (réf. CapCut). */
export function buildClassicTextContentStyle(
  clip: Clip,
  canvasHeight?: number
): CSSProperties {
  const presetStyle = resolveTextPresetStyle(clip);
  const bgHex = clip.backgroundColor;
  const bgAlpha = clip.backgroundOpacity ?? 0;
  const hasBg = Boolean(bgHex && bgAlpha > 0);
  const bgColor = hasBg
    ? `${bgHex}${Math.round(bgAlpha * 255).toString(16).padStart(2, '0')}`
    : 'transparent';

  const isGradientFill = presetStyle.WebkitTextFillColor === 'transparent';
  const renderFontSize =
    canvasHeight != null && canvasHeight > 0
      ? resolveClipRenderFontSizePx(clip, canvasHeight)
      : resolveClipRenderFontSizePx(clip, STUDIO_TEXT_CANVAS_REF_HEIGHT);

  return {
    display: 'inline-block',
    width: 'fit-content',
    margin: 0,
    fontFamily: clip.fontFamily ?? 'inherit',
    fontSize: renderFontSize,
    fontWeight: clip.fontWeight ?? 'bold',
    fontStyle: clip.fontStyle ?? 'normal',
    textDecoration: clip.textDecoration !== 'none' ? clip.textDecoration : undefined,
    textTransform:
      clip.textTransform && clip.textTransform !== 'none' ? clip.textTransform : undefined,
    letterSpacing: clip.letterSpacing !== undefined ? `${clip.letterSpacing}px` : undefined,
    lineHeight: clip.lineHeight ?? 1.1,
    textAlign: clip.textAlign ?? 'center',
    opacity: clip.opacity ?? 1,
    backgroundColor: bgColor,
    padding: hasBg ? '6px 12px' : '0',
    borderRadius: hasBg ? 4 : 0,
    textShadow: buildTextShadow(clip),
    WebkitTextStroke:
      clip.strokeWidth && clip.strokeWidth > 0
        ? `${clip.strokeWidth}px ${clip.strokeColor ?? '#000000'}`
        : undefined,
    boxSizing: 'border-box',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    ...presetStyle,
    ...(isGradientFill ? {} : { color: clip.fontColor ?? (presetStyle.color as string | undefined) ?? '#ffffff' }),
  };
}

/** Padding interne zone texte — fond du texte ou marge simulateur. */
export function resolveTextZoneContentPadding(
  clip: Pick<Clip, 'backgroundColor' | 'backgroundOpacity'>,
  padScale = 1
): { x: number; y: number } {
  const bgAlpha = clip.backgroundOpacity ?? 0;
  const hasBg = Boolean(clip.backgroundColor && bgAlpha > 0);
  if (hasBg) return { x: 12, y: 6 };
  return {
    x: Math.max(6, Math.round(TEXT_ZONE_PADDING_X * padScale)),
    y: Math.max(4, Math.round(TEXT_ZONE_PADDING_Y * padScale)),
  };
}
