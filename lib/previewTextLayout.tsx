import type { CSSProperties, ReactNode } from 'react';
import type { Clip } from '@/types/composition';
import { buildClassicTextContentStyle } from '@/lib/studio/textContentStyle';
import {
  getTextTemplateDef,
  type TextTemplateSlotDef,
} from '@/lib/studio/textTemplateCatalog';
import { positionToY } from '@/lib/textPosition';
import { centerFromFixedCorner } from '@/lib/studio/canvasPointer';
import {
  measureTextElementNatural,
  resolveTextFramePx,
} from '@/lib/studio/textBoundsMeasure';
import { defaultOverlayBoxWidthPct } from '@/components/editor/MovableCanvasZone';

export interface PreviewTextLayout {
  xPct: number;
  yPct: number;
  boxWidthPct: number;
  fontSize: number;
  resizeMode: 'split' | 'frame' | 'uniform';
  /** Cadre épouse le texte (max = boxWidthPct), style CapCut. */
  shrinkToContent: boolean;
  /** Styles du contenu (cadre serré, aligné Remotion). */
  contentStyle: CSSProperties;
  /** Lignes affichées dans la zone de hit. */
  lines: string[];
  /** Largeur mesurée en px (cadre serré). */
  frameWidthPx: number;
  /** Hauteur mesurée en px (cadre serré). */
  frameHeightPx: number;
  /** Cadre élargi manuellement par l'utilisateur. */
  userExpandedFrame: boolean;
}

function slotLineStyle(slot: TextTemplateSlotDef): CSSProperties {
  const hasBg = Boolean(slot.backgroundColor && slot.backgroundColor !== 'transparent');
  return {
    display: 'block',
    width: 'fit-content',
    maxWidth: '100%',
    margin: '0 auto',
    padding: hasBg ? '8px 20px' : '0',
    fontSize: slot.fontSize,
    fontWeight: slot.fontWeight ?? 'bold',
    color: slot.color,
    backgroundColor: slot.backgroundColor ?? 'transparent',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    lineHeight: 1.1,
    boxSizing: 'border-box',
  };
}

export { buildClassicTextContentStyle } from '@/lib/studio/textContentStyle';

type TextLayoutCore = Omit<
  PreviewTextLayout,
  'frameWidthPx' | 'frameHeightPx' | 'userExpandedFrame'
>;

function layoutFromTextTemplate(clip: Clip): TextLayoutCore | null {
  const templateId = clip.textTemplateId;
  if (!templateId) return null;
  const def = getTextTemplateDef(templateId);
  if (!def) return null;

  const slots = clip.textTemplateSlots ?? {};
  const lines = def.slots.map((s) => slots[s.id] ?? s.defaultText);

  if (def.slots.length === 1) {
    const slot = def.slots[0];
    return {
      xPct: 50,
      yPct: slot.yOffsetPct,
      boxWidthPct: templateId === 'subtitle-bold' ? 90 : 88,
      fontSize: slot.fontSize,
      resizeMode: 'frame',
      shrinkToContent: true,
      contentStyle: slotLineStyle(slot),
      lines: [(lines[0] ?? '').trim() || '\u00A0'],
    };
  }

  const minY = Math.min(...def.slots.map((s) => s.yOffsetPct));
  const maxY = Math.max(...def.slots.map((s) => s.yOffsetPct));
  const maxFont = Math.max(...def.slots.map((s) => s.fontSize));

  return {
    xPct: 50,
    yPct: (minY + maxY) / 2,
    boxWidthPct: 90,
    fontSize: maxFont,
    resizeMode: 'frame',
    shrinkToContent: true,
    contentStyle: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      width: 'max-content',
      maxWidth: '100%',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
    },
    lines,
  };
}

/** Dimensions de sélection alignées sur le rendu Remotion / canvas classique. */
export function getPreviewTextLayout(
  clip: Clip,
  canvasWidth: number,
  canvasHeight: number
): PreviewTextLayout {
  const fromTemplate = layoutFromTextTemplate(clip);
  if (fromTemplate) {
    const frame = resolveTextFramePx(clip, canvasWidth, canvasHeight);
    return {
      ...fromTemplate,
      frameWidthPx: frame.widthPx,
      frameHeightPx: frame.heightPx,
      userExpandedFrame: frame.userExpandedFrame,
    };
  }

  const frame = resolveTextFramePx(clip, canvasWidth, canvasHeight);
  const natural = measureTextElementNatural(clip, canvasHeight);
  const needsWordWrap = frame.widthPx < natural.width - 3;
  const fontSize = clip.fontSize ?? 24;

  let xPct = clip.x ?? 50;
  let yPct = clip.y ?? positionToY(clip.position);

  if (
    clip.textAnchorCorner &&
    clip.textAnchorXPx != null &&
    clip.textAnchorYPx != null &&
    canvasWidth > 0 &&
    canvasHeight > 0
  ) {
    const { centerX, centerY } = centerFromFixedCorner(
      clip.textAnchorCorner,
      clip.textAnchorXPx,
      clip.textAnchorYPx,
      frame.widthPx,
      frame.heightPx
    );
    xPct = (centerX / canvasWidth) * 100;
    yPct = (centerY / canvasHeight) * 100;
  }
  const base = buildClassicTextContentStyle(clip, canvasHeight);
  const align = clip.textAlign ?? 'center';

  return {
    xPct,
    yPct,
    boxWidthPct: frame.widthPct,
    fontSize,
    resizeMode: 'frame',
    shrinkToContent: true,
    contentStyle: {
      ...base,
      display: 'block',
      width: frame.widthPx,
      maxWidth: frame.widthPx,
      height: frame.heightPx,
      minHeight: frame.heightPx,
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      textAlign: align,
      whiteSpace: needsWordWrap ? 'pre-wrap' : 'pre',
      wordBreak: needsWordWrap ? 'break-word' : 'normal',
      overflowWrap: needsWordWrap ? 'break-word' : 'normal',
      overflow: 'hidden',
    },
    lines: [(clip.content ?? '').trim() || '\u00A0'],
    frameWidthPx: frame.widthPx,
    frameHeightPx: frame.heightPx,
    userExpandedFrame: frame.userExpandedFrame,
  };
}

export function renderPreviewTextHitContent(
  layout: PreviewTextLayout,
  clip: Clip,
  options?: { transparent?: boolean }
): ReactNode {
  const transparent = options?.transparent ?? true;

  if (clip.textTemplateId && layout.lines.length > 1) {
    const def = getTextTemplateDef(clip.textTemplateId);
    if (def) {
      return layout.lines.map((line, i) => {
        const slot = def.slots[i];
        if (!slot) return null;
        const style = slotLineStyle(slot);
        if (transparent) {
          style.color = 'transparent';
          style.backgroundColor = 'transparent';
        }
        return (
          <span key={slot.id} style={style} aria-hidden>
            {line || '\u00A0'}
          </span>
        );
      });
    }
  }

  const style: CSSProperties = {
    ...layout.contentStyle,
    margin: 0,
    padding: 0,
    width: layout.frameWidthPx,
    maxWidth: layout.frameWidthPx,
    height: layout.frameHeightPx,
    minHeight: layout.frameHeightPx,
  };
  if (transparent) {
    style.color = 'transparent';
    style.textShadow = 'none';
    style.WebkitTextStroke = undefined;
    if (!style.backgroundColor || style.backgroundColor === 'transparent') {
      style.backgroundColor = 'transparent';
    }
  }

  return (
    <div style={style} aria-hidden={transparent}>
      {layout.lines.join('\n')}
    </div>
  );
}

/** Style overlay / sticker positionné pour Remotion (aligné StudioOverlayHitZone). */
export function buildRemotionOverlayStyle(clip: Clip): CSSProperties {
  const xPct = clip.x ?? 50;
  const yPct = clip.y ?? 50;
  const boxWidthPct = clip.boxWidthPct ?? defaultOverlayBoxWidthPct(clip.content);
  const rotation = clip.mediaRotation ?? 0;
  const transform =
    rotation !== 0
      ? `translate(-50%, -50%) rotate(${rotation}deg)`
      : 'translate(-50%, -50%)';

  return {
    ...buildOverlayContentStyle(clip),
    position: 'absolute',
    left: `${xPct}%`,
    top: `${yPct}%`,
    transform,
    width: `${boxWidthPct}%`,
    maxWidth: `${boxWidthPct}%`,
    textAlign: 'center',
    boxSizing: 'border-box',
  };
}

/** Style overlay / sticker — cadre serré. */
export function buildOverlayContentStyle(clip: Clip): CSSProperties {
  const bgAlpha = clip.backgroundOpacity ?? 0;
  const hasBg = Boolean(clip.backgroundColor && bgAlpha > 0);
  const bgColor = hasBg
    ? `${clip.backgroundColor}${Math.round(bgAlpha * 255).toString(16).padStart(2, '0')}`
    : undefined;

  return {
    display: 'inline-block',
    width: 'fit-content',
    maxWidth: '100%',
    margin: 0,
    fontSize: clip.fontSize ?? 40,
    fontWeight: clip.fontWeight ?? 'bold',
    color: clip.fontColor ?? '#ffffff',
    opacity: clip.opacity ?? 1,
    backgroundColor: bgColor,
    padding: hasBg ? '4px 10px' : '0',
    borderRadius: hasBg ? 6 : 0,
    textAlign: 'center',
    lineHeight: 1.1,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    textShadow: '0 2px 8px rgba(0,0,0,0.85)',
    boxSizing: 'border-box',
  };
}
