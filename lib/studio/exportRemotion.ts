/**
 * Phase 5 — rendu serveur Remotion (@remotion/renderer).
 * Appel prévu depuis CompositionExportService (worker Node séparé).
 */
import type { Composition } from '@/types/composition';

export interface RemotionExportJob {
  compositionId: string;
  composition: Composition;
  outputPath: string;
}

/** Stub : brancher un worker Node avec bundle Remotion. */
export async function scheduleRemotionExport(
  job: RemotionExportJob
): Promise<{ jobId: string }> {
  void job;
  return { jobId: `remotion-stub-${Date.now()}` };
}
