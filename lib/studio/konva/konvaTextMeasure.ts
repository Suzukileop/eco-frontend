import Konva from 'konva';
import type { Clip } from '@/types/composition';
import {
  applyVisualToKonvaText,
  konvaFontFamily,
  konvaFontStyle,
  resolveKonvaTextVisual,
} from '@/lib/studio/konva/konvaTextStyle';
function fallbackTextHeight(clip: Clip, widthPx: number, fontSize: number): number {
  const lineHeight = clip.lineHeight ?? 1.15;
  const raw = clip.content ?? '';
  const content = raw.length > 0 ? raw : 'Votre texte';
  const charsPerLine = Math.max(1, Math.floor(widthPx / Math.max(8, fontSize * 0.55)));
  const wrappedLines = content
    .split('\n')
    .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);
  return Math.max(24, Math.ceil(fontSize * lineHeight * wrappedLines * 1.05));
}

let measureNode: Konva.Text | null = null;

function getMeasureNode(): Konva.Text {
  if (!measureNode) {
    measureNode = new Konva.Text({ listening: false, padding: 0 });
  }
  return measureNode;
}

function applyCommonTextMetrics(node: Konva.Text, clip: Clip, content: string, fontSize: number): void {
  node.text(content);
  node.fontSize(fontSize);
  node.fontFamily(konvaFontFamily(clip));
  node.fontStyle(konvaFontStyle(clip));
  node.lineHeight(clip.lineHeight ?? 1.15);
  node.letterSpacing(clip.letterSpacing ?? 0);
  node.align(clip.textAlign ?? 'center');
  node.padding(0);
}

/** Mesure pixel-perfect via Konva.Text (wrap + getTextHeight). */
export function measureKonvaTextBox(
  clip: Clip,
  widthPx: number,
  fontSizeOverride?: number
): { widthPx: number; heightPx: number } {
  const minPx = 24;
  const w = Math.max(minPx, Math.round(widthPx));
  const fontSize = fontSizeOverride ?? clip.fontSize ?? 24;

  if (typeof window === 'undefined') {
    return {
      widthPx: w,
      heightPx: fallbackTextHeight({ ...clip, fontSize }, w, fontSize),
    };
  }

  const raw = clip.content ?? '';
  const content = raw.length > 0 ? raw : 'Votre texte';
  const probeH = Math.max(400, fallbackTextHeight({ ...clip, fontSize }, w, fontSize) * 3);
  const visual = resolveKonvaTextVisual(clip, w, probeH);

  const node = getMeasureNode();
  applyCommonTextMetrics(node, clip, content, fontSize);
  node.width(w);
  // Char wrap prevents overflow for very long words/tokens.
  node.wrap('char');
  applyVisualToKonvaText(node, visual, w, probeH);

  // Use the rendered bbox (multi-line aware), then add visual effects padding.
  const rect = node.getClientRect({ skipTransform: true });
  const bboxHeight = Math.ceil(rect.height || node.getTextHeight());
  const strokePad = Math.ceil((node.strokeWidth() ?? 0) * 2);
  const shadowPad = Math.ceil((node.shadowBlur() ?? 0) * 2);
  const measured = Math.ceil(bboxHeight + strokePad + shadowPad);
  return {
    widthPx: w,
    heightPx: Math.max(minPx, measured),
  };
}

/** Natural width without wrapping, used for live auto-resize. */
export function measureKonvaTextNaturalWidth(
  clip: Clip,
  fontSizeOverride?: number
): number {
  const minPx = 48;
  const fontSize = fontSizeOverride ?? clip.fontSize ?? 24;
  const raw = clip.content ?? '';
  const content = raw.length > 0 ? raw : 'Votre texte';

  if (typeof window === 'undefined') {
    const chars = Math.max(1, content.length);
    return Math.max(minPx, Math.ceil(chars * fontSize * 0.6));
  }

  const probeW = 4096;
  const probeH = 512;
  const visual = resolveKonvaTextVisual(clip, probeW, probeH);
  const node = getMeasureNode();
  applyCommonTextMetrics(node, clip, content, fontSize);
  node.width(probeW);
  node.wrap('none');
  applyVisualToKonvaText(node, visual, probeW, probeH);

  const textW = Math.max(1, Math.ceil(node.getTextWidth()));
  const stroke = Math.ceil(node.strokeWidth() ?? 0);
  const shadowPad = Math.ceil(node.shadowBlur() ?? 0);
  return Math.max(minPx, textW + stroke * 2 + shadowPad * 2);
}
