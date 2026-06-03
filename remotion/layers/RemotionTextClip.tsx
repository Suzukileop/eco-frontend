import { useVideoConfig } from 'remotion';
import type { Clip } from '@/types/composition';
import { buildRemotionClassicTextStyle } from '@/lib/previewTextLayout';
import { getTextTemplateDef } from '@/lib/studio/textTemplateCatalog';
import { PrettyPowerfulTemplate } from '@/remotion/templates/PrettyPowerfulTemplate';
import { ViralHookTemplate } from '@/remotion/templates/ViralHookTemplate';
import { SubtitleBoldTemplate } from '@/remotion/templates/SubtitleBoldTemplate';
import { QuoteMinimalTemplate } from '@/remotion/templates/QuoteMinimalTemplate';
import { SaleBadgeTemplate } from '@/remotion/templates/SaleBadgeTemplate';

export function RemotionTextClip({ clip }: { clip: Clip }) {
  const { width, height } = useVideoConfig();

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

  return (
    <div style={buildRemotionClassicTextStyle(clip, width, height)}>
      {clip.content ?? ''}
    </div>
  );
}
