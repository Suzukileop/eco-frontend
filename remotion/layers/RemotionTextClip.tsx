import { useVideoConfig } from 'remotion';
import type { Clip } from '@/types/composition';
import { buildClassicTextContentStyle } from '@/lib/studio/textContentStyle';
import { positionToY } from '@/lib/textPosition';
import { getTextTemplateDef } from '@/lib/studio/textTemplateCatalog';
import { PrettyPowerfulTemplate } from '@/remotion/templates/PrettyPowerfulTemplate';
import { ViralHookTemplate } from '@/remotion/templates/ViralHookTemplate';
import { SubtitleBoldTemplate } from '@/remotion/templates/SubtitleBoldTemplate';
import { QuoteMinimalTemplate } from '@/remotion/templates/QuoteMinimalTemplate';
import { SaleBadgeTemplate } from '@/remotion/templates/SaleBadgeTemplate';

/** Largeur du cadre texte (%) — déterministe, sans mesure DOM (robuste en player + export). */
function resolveBoxWidthPct(clip: Clip): number {
  const stored = clip.boxWidthPct ?? 85;
  // ≥72 % = cadre « plein » (legacy wide) → laisse le texte remplir / passer à la ligne au besoin.
  if (stored >= 72) return 96;
  return Math.min(96, Math.max(8, stored));
}

export function RemotionTextClip({ clip }: { clip: Clip }) {
  const { height } = useVideoConfig();

  if (clip.textTemplateId) {
    const slots = clip.textTemplateSlots ?? {};
    const tpl = clip.textTemplateId;
    if (tpl === 'pretty-powerful') {
      return <PrettyPowerfulTemplate slots={slots} />;
    }
    if (tpl === 'viral-hook') {
      return <ViralHookTemplate slots={slots} />;
    }
    if (tpl === 'subtitle-bold') {
      return <SubtitleBoldTemplate slots={slots} />;
    }
    if (tpl === 'quote-minimal') {
      return <QuoteMinimalTemplate slots={slots} />;
    }
    if (tpl === 'sale-badge') {
      return <SaleBadgeTemplate slots={slots} />;
    }
    if (getTextTemplateDef(tpl)) {
      return <PrettyPowerfulTemplate slots={slots} />;
    }
  }

  // Rendu identique à l'éditeur pause (TextZoneClip) : même typographie, centré sur (x, y),
  // hauteur automatique, AUCUN overflow:hidden ni mesure DOM (déterministe).
  const align = (clip.textAlign ?? 'center') as 'left' | 'center' | 'right';
  const rotation = clip.textRotation ?? 0;
  const transform =
    rotation !== 0
      ? `translate(-50%, -50%) rotate(${rotation}deg)`
      : 'translate(-50%, -50%)';

  const xPct = clip.x ?? 50;
  const yPct = clip.y ?? positionToY(clip.position);
  const widthPct = resolveBoxWidthPct(clip);

  const textStyle = buildClassicTextContentStyle(clip, height);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform,
        width: `${widthPct}%`,
        display: 'flex',
        justifyContent:
          align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          ...textStyle,
          maxWidth: '100%',
          textAlign: align,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        {clip.content ?? ''}
      </div>
    </div>
  );
}
