import api from '@/lib/api';
import type { Composition } from '@/types/composition';

export interface CompositionResponse {
  id: string;
  analysisId: string;
  userId: string;
  title: string;
  compositionJson: Composition | null;
  format: string;
  durationSeconds: number;
  exportStatus: 'idle' | 'exporting' | 'done' | 'failed';
  exportUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompositionBody {
  analysisId: string;
  title?: string;
  format?: string;
}

export interface SaveCompositionBody {
  title: string;
  compositionJson: Composition;
  format: string;
  durationSeconds: number;
}

const BASE = '/api/compositions';

export async function createComposition(body: CreateCompositionBody): Promise<CompositionResponse> {
  const res = await api.post<CompositionResponse>(BASE, body);
  return res.data;
}

export async function getComposition(id: string): Promise<CompositionResponse> {
  const res = await api.get<CompositionResponse>(`${BASE}/${encodeURIComponent(id)}`);
  return res.data;
}

export async function saveComposition(id: string, body: SaveCompositionBody): Promise<CompositionResponse> {
  const res = await api.put<CompositionResponse>(`${BASE}/${encodeURIComponent(id)}`, body);
  return res.data;
}

export async function listCompositions(): Promise<CompositionResponse[]> {
  const res = await api.get<CompositionResponse[]>(BASE);
  return res.data;
}

export async function uploadCompositionAsset(
  compositionId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ assetUrl: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<{ assetUrl: string }>(
    `${BASE}/${encodeURIComponent(compositionId)}/assets`,
    form,
    {
      onUploadProgress: (event) => {
        if (!onProgress) return;
        const total = event.total ?? 0;
        if (total <= 0) { onProgress(0); return; }
        onProgress(Math.min(100, Math.round((event.loaded * 100) / total)));
      },
    }
  );
  return res.data;
}

export interface ExportCompositionBody {
  fileName?: string;
  resolution?: '480p' | '720p' | '1080p';
  quality?: 'recommended' | 'high' | 'low';
  fps?: number;
  format?: 'mp4';
}

export async function exportComposition(
  compositionId: string,
  settings?: ExportCompositionBody
): Promise<{ jobId: string }> {
  const res = await api.post<{ jobId: string }>(
    `${BASE}/${encodeURIComponent(compositionId)}/export`,
    settings ?? {}
  );
  return res.data;
}

export async function getExportStatus(compositionId: string): Promise<{
  status: string;
  exportUrl: string | null;
  progress: number;
}> {
  const res = await api.get<{ status: string; exportUrl: string | null; progress: number }>(
    `${BASE}/${encodeURIComponent(compositionId)}/export-status`
  );
  return res.data;
}
