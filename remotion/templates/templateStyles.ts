import type { CSSProperties } from 'react';
import type { TextTemplateSlotDef } from '@/lib/studio/textTemplateCatalog';

export function slotLineStyle(slot: TextTemplateSlotDef): CSSProperties {
  return {
    display: 'block',
    width: 'fit-content',
    margin: '0 auto',
    padding: '8px 20px',
    fontSize: slot.fontSize,
    fontWeight: slot.fontWeight ?? 'bold',
    color: slot.color,
    backgroundColor: slot.backgroundColor ?? 'transparent',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    lineHeight: 1.1,
  };
}

export const templateRootStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
};
