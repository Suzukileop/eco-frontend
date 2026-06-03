import { getTextTemplateDef } from '@/lib/studio/textTemplateCatalog';
import { slotLineStyle, templateRootStyle } from '@/remotion/templates/templateStyles';

export function PrettyPowerfulTemplate({ slots }: { slots: Record<string, string> }) {
  const def = getTextTemplateDef('pretty-powerful');
  if (!def) return null;

  return (
    <div style={templateRootStyle}>
      {def.slots.map((slot) => (
        <span
          key={slot.id}
          style={{
            ...slotLineStyle(slot),
            position: 'absolute',
            top: `${slot.yOffsetPct}%`,
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {slots[slot.id] ?? slot.defaultText}
        </span>
      ))}
    </div>
  );
}
