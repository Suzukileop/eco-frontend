import type { Clip } from '@/types/composition';

export type TextTemplateId =
  | 'pretty-powerful'
  | 'viral-hook'
  | 'subtitle-bold'
  | 'quote-minimal'
  | 'sale-badge';

export interface TextTemplateSlotDef {
  id: string;
  defaultText: string;
  fontSize: number;
  fontWeight?: 'normal' | 'bold';
  color: string;
  backgroundColor?: string;
  yOffsetPct: number;
}

export interface TextTemplateDef {
  id: TextTemplateId;
  label: string;
  group: 'tendance' | 'classique' | 'vente';
  defaultDurationSec: number;
  slots: TextTemplateSlotDef[];
}

export const TEXT_TEMPLATE_CATALOG: TextTemplateDef[] = [
  {
    id: 'pretty-powerful',
    label: 'Pretty Powerful',
    group: 'tendance',
    defaultDurationSec: 5,
    slots: [
      { id: 'line1', defaultText: 'PRETTY', fontSize: 42, fontWeight: 'bold', color: '#111', backgroundColor: '#fef08a', yOffsetPct: 38 },
      { id: 'line2', defaultText: 'BUT', fontSize: 42, fontWeight: 'bold', color: '#111', backgroundColor: '#86efac', yOffsetPct: 48 },
      { id: 'line3', defaultText: 'POWERFUL', fontSize: 42, fontWeight: 'bold', color: '#111', backgroundColor: '#93c5fd', yOffsetPct: 58 },
    ],
  },
  {
    id: 'viral-hook',
    label: 'Accroche virale',
    group: 'tendance',
    defaultDurationSec: 4,
    slots: [
      { id: 'hook', defaultText: 'ATTENTION', fontSize: 48, fontWeight: 'bold', color: '#fff', backgroundColor: '#ef4444', yOffsetPct: 42 },
      { id: 'sub', defaultText: 'Regarde jusqu\'à la fin', fontSize: 22, fontWeight: 'bold', color: '#fff', yOffsetPct: 55 },
    ],
  },
  {
    id: 'subtitle-bold',
    label: 'Sous-titre bold',
    group: 'classique',
    defaultDurationSec: 5,
    slots: [
      { id: 'main', defaultText: 'Votre message ici', fontSize: 32, fontWeight: 'bold', color: '#fff', backgroundColor: 'rgba(0,0,0,0.75)', yOffsetPct: 78 },
    ],
  },
  {
    id: 'quote-minimal',
    label: 'Citation minimal',
    group: 'classique',
    defaultDurationSec: 6,
    slots: [
      { id: 'quote', defaultText: '"La citation"', fontSize: 28, fontWeight: 'normal', color: '#f5f5f5', yOffsetPct: 45 },
      { id: 'author', defaultText: '— Auteur', fontSize: 18, color: '#a3a3a3', yOffsetPct: 58 },
    ],
  },
  {
    id: 'sale-badge',
    label: 'Badge promo',
    group: 'vente',
    defaultDurationSec: 4,
    slots: [
      { id: 'badge', defaultText: '-50%', fontSize: 56, fontWeight: 'bold', color: '#fff', backgroundColor: '#f97316', yOffsetPct: 35 },
      { id: 'cta', defaultText: 'LIEN EN BIO', fontSize: 20, fontWeight: 'bold', color: '#fff', backgroundColor: '#171717', yOffsetPct: 52 },
    ],
  },
];

export function getTextTemplateDef(id: string): TextTemplateDef | undefined {
  return TEXT_TEMPLATE_CATALOG.find((t) => t.id === id);
}

export function buildClipFromTextTemplate(
  templateId: TextTemplateId,
  startTime: number,
  segmentId?: string
): Clip {
  const def = getTextTemplateDef(templateId);
  if (!def) {
    throw new Error(`Unknown text template: ${templateId}`);
  }
  const slots: Record<string, string> = {};
  for (const s of def.slots) {
    slots[s.id] = s.defaultText;
  }
  const content = def.slots.map((s) => slots[s.id]).join('\n');
  return {
    id: `txt-tpl-${templateId}-${Date.now()}`,
    trackType: 'text',
    type: 'text',
    startTime,
    endTime: startTime + def.defaultDurationSec,
    content,
    textTemplateId: templateId,
    textTemplateSlots: slots,
    position: 'center',
    textAlign: 'center',
    x: 50,
    y: 50,
    boxWidthPct: 90,
    fontSize: 28,
    textScaleBaseFontSize: 28,
    textScalePct: 100,
    fontWeight: 'bold',
    fontColor: '#ffffff',
    segmentId,
  };
}
