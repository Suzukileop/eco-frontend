import type { ComponentType } from 'react';
import { Composition } from 'remotion';
import { StudioComposition } from '@/remotion/StudioComposition';
import {
  STUDIO_COMPOSITION_ID,
  getRemotionDimensions,
  getCompositionDurationFrames,
  type StudioCompositionInputProps,
} from '@/lib/studio/remotionBridge';

const RemotionComp = StudioComposition as unknown as ComponentType<Record<string, unknown>>;

/**
 * calculateMetadata: called by @remotion/renderer at server-render time.
 * Derives width, height, fps and durationInFrames from the actual composition data
 * passed as inputProps — so the export is always pixel-perfect regardless of format.
 */
async function calculateMetadata({
  props,
}: {
  props: StudioCompositionInputProps;
}): Promise<{
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}> {
  const comp = props.composition;
  const dims = getRemotionDimensions(
    comp.format ?? '9:16',
    comp.customAspectW,
    comp.customAspectH
  );
  return {
    width: dims.width,
    height: dims.height,
    fps: comp.fps ?? 30,
    durationInFrames: getCompositionDurationFrames(comp),
  };
}

/** Enregistrement pour Remotion CLI / rendu serveur (phase export). */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={STUDIO_COMPOSITION_ID}
        component={RemotionComp}
        calculateMetadata={calculateMetadata as never}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          composition: {
            analysisId: '',
            title: 'Preview',
            duration: 10,
            fps: 30,
            format: '9:16',
            tracks: {
              background: [],
              text: [],
              audio: [],
              overlay: [],
              voiceover: [],
            },
            transitions: [],
          },
        }}
      />
    </>
  );
};
