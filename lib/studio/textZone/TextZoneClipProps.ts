import type { Clip } from '@/types/composition';
import type { TextZoneInteractionState } from '@/lib/studio/textZone/types';

export interface TextZoneClipProps {
  clip: Clip;
  canvasWidth: number;
  canvasHeight: number;
  pointerScale: number;
  interactionState: TextZoneInteractionState;
  isPrimary: boolean;
  seedChar: string | null;
  interactive: boolean;
  onSelect: () => void;
  onEnterEdit: () => void;
  onExitEdit: () => void;
  onCommit: (patch: Partial<Clip>) => void;
  onSaveHistory: () => void;
  onSeedConsumed: () => void;
}
