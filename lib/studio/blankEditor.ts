import type { Composition } from '@/types/composition';
import type { VideoAnalysisResponse } from '@/types/templates';

export const STANDALONE_EDITOR_ANALYSIS_ID = 'standalone';

export function createBlankEditorAnalysis(): VideoAnalysisResponse {
  return {
    id: STANDALONE_EDITOR_ANALYSIS_ID,
    status: 'DONE',
    segments: [],
  };
}

export function createBlankComposition(): Composition {
  return {
    analysisId: STANDALONE_EDITOR_ANALYSIS_ID,
    title: 'Ma composition',
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
  };
}

export function isStandaloneEditorAnalysis(analysisId: string | null | undefined): boolean {
  return analysisId === STANDALONE_EDITOR_ANALYSIS_ID;
}
