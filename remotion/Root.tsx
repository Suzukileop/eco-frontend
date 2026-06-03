import type { ComponentType } from 'react';
import { Composition } from 'remotion';
import { StudioComposition } from '@/remotion/StudioComposition';
import { STUDIO_COMPOSITION_ID } from '@/lib/studio/remotionBridge';

const RemotionComp = StudioComposition as unknown as ComponentType<Record<string, unknown>>;

/** Enregistrement pour Remotion CLI / rendu serveur (phase export). */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={STUDIO_COMPOSITION_ID}
        component={RemotionComp}
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
