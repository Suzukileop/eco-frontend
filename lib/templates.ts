import api from '@/lib/api';
import { normalizeSpringPage } from '@/lib/ecosystem';
import type {
  AnalyzeUrlBody,
  GenerateSegmentImagesBody,
  GenerateTextVariantsBody,
  GenerateVideoBody,
  PagedResponse,
  SegmentResponse,
  SpringPageRaw,
  VideoAnalysisResponse,
} from '@/types/templates';

const BASE = '/api/templates';

export async function analyzeVideoByUrl(videoUrl: string): Promise<VideoAnalysisResponse> {
  const body: AnalyzeUrlBody = { videoUrl: videoUrl.trim() };
  const res = await api.post<VideoAnalysisResponse>(`${BASE}/analyze/url`, body);
  return res.data;
}

export async function analyzeVideoByUpload(
  file: File,
  onUploadProgress?: (percent: number) => void
): Promise<VideoAnalysisResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<VideoAnalysisResponse>(`${BASE}/analyze/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!onUploadProgress) return;
      const total = event.total ?? 0;
      if (total <= 0) {
        onUploadProgress(0);
        return;
      }
      const percent = Math.min(100, Math.round((event.loaded * 100) / total));
      onUploadProgress(percent);
    },
  });
  return res.data;
}

export async function getMyAnalyses(
  page = 0,
  size = 20
): Promise<PagedResponse<VideoAnalysisResponse>> {
  const res = await api.get<SpringPageRaw<VideoAnalysisResponse>>(`${BASE}/analyses`, {
    params: { page, size },
  });
  return normalizeSpringPage(res.data);
}

export async function getAnalysis(id: string): Promise<VideoAnalysisResponse> {
  const res = await api.get<VideoAnalysisResponse>(
    `${BASE}/analyses/${encodeURIComponent(id)}`
  );
  return res.data;
}

export async function regenerateSegmentImages(segmentId: string): Promise<SegmentResponse> {
  const res = await api.post<SegmentResponse>(
    `${BASE}/segments/${encodeURIComponent(segmentId)}/regenerate-images`
  );
  return res.data;
}

export async function generateSegmentImages(
  segmentId: string,
  body: GenerateSegmentImagesBody
): Promise<SegmentResponse> {
  const res = await api.post<SegmentResponse>(
    `${BASE}/segments/${encodeURIComponent(segmentId)}/generate-images`,
    body
  );
  return res.data;
}

export async function generateTextVariants(
  analysisId: string,
  body: GenerateTextVariantsBody
): Promise<VideoAnalysisResponse> {
  const res = await api.post<VideoAnalysisResponse>(
    `${BASE}/analyses/${encodeURIComponent(analysisId)}/text-variants`,
    body
  );
  return res.data;
}

export async function generateSegmentVideo(
  segmentId: string,
  body: GenerateVideoBody
): Promise<SegmentResponse> {
  const res = await api.post<SegmentResponse>(
    `${BASE}/segments/${encodeURIComponent(segmentId)}/generate-video`,
    body
  );
  return res.data;
}
