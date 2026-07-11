import type { PagedResponse, SpringPageRaw } from '@/types/ecosystem';

export type { PagedResponse, SpringPageRaw };

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';

export type ProcessingStage =
  | 'FETCHING_MEDIA'
  | 'GROK_ANALYSIS'
  | 'GENERATING_IMAGES'
  | 'FINALIZING';

export interface VideoAnalysisResponse {
  id: string;
  status: AnalysisStatus;
  processingStage?: ProcessingStage | null;
  videoUrl?: string | null;
  segmentsCount?: number | null;
  creditsUsed?: number | null;
  processingMs?: number | null;
  errorMessage?: string | null;
  globalText?: string | null;
  textVariants?: string[] | null;
  textVariantTheme?: string | null;
  segments?: SegmentResponse[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AudioSuggestion {
  title: string;
  source: string;
  url: string;
  description?: string | null;
}

export interface SegmentResponse {
  id: string;
  seqNumber: number;
  startTimeMs: number;
  endTimeMs: number;
  transcript?: string | null;
  backgroundDesc?: string | null;
  imagePrompt?: string | null;
  textOverlay?: string | null;
  audioDesc?: string | null;
  audioSuggestions?: AudioSuggestion[] | null;
  effectsDesc?: string | null;
  capCutEffects?: string[] | null;
  resources?: string[] | null;
  intention?: string | null;
  transitionToNext?: string | null;
  generatedImages?: string[] | null;
  generatedVideoUrl?: string | null;
  videoGenerating?: boolean;
  videoGenerationError?: string | null;
  videoDurationSeconds?: number | null;
}

export type VideoDurationSeconds = 6 | 10;

export interface GenerateVideoBody {
  durationSeconds: VideoDurationSeconds;
  videoPrompt?: string;
  aspectRatio?: string;
}

export interface GenerateSegmentImagesBody {
  prompt: string;
  aspectRatio: string;
  imageCount: number;
}

export interface GenerateTextVariantsBody {
  variantCount: number;
  theme?: string;
}

export interface AnalyzeUrlBody {
  videoUrl: string;
  imagesPerSegment?: number;
}

export const ANALYSIS_BASE_CREDITS = 10;
export const CREDITS_PER_IMAGE = 3;
export const CREDITS_REGENERATE_IMAGES = 5;
export const CREDITS_GENERATE_VIDEO = 20;
export const CREDITS_PER_TEXT_VARIANT = 3;
export const DEFAULT_SEGMENT_ESTIMATE = 10;
export const DEFAULT_IMAGES_PER_SEGMENT = 3;
export const MIN_IMAGES_PER_SEGMENT = 1;
export const MAX_IMAGES_PER_SEGMENT = 5;

/** Estimation : 10 crédits de base + (séquences × images/séquence × 3 crédits/image). */
export function estimateAnalysisCredits(
  segmentCount = DEFAULT_SEGMENT_ESTIMATE,
  imagesPerSegment = DEFAULT_IMAGES_PER_SEGMENT
): number {
  return ANALYSIS_BASE_CREDITS + segmentCount * imagesPerSegment * CREDITS_PER_IMAGE;
}
