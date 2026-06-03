import type { PagedResponse } from '@/types/ecosystem';

export type SchedulerPlatform = 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'FACEBOOK';

export type SchedulerPostStatus =
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'FAILED'
  | 'CANCELLED'
  | 'DRAFT'
  | string;

export type ContentSourceType = 'EXTERNAL_URL' | 'UPLOAD';

export interface ValidatedNicheDto {
  nicheCode: string;
  nicheTheme: string;
}

export interface ScheduledPostDto {
  id: string;
  platform: SchedulerPlatform | string;
  caption: string;
  scheduledAt: string;
  status: SchedulerPostStatus;
  externalUrl?: string | null;
  nicheRef?: string | null;
  createdAt?: string;
}

export interface SchedulePostCreateBody {
  platform: SchedulerPlatform;
  sourceType: ContentSourceType;
  externalUrl?: string;
  caption: string;
  scheduledAt: string;
  nicheRef?: string;
}

export type ScheduledPostsPage = PagedResponse<ScheduledPostDto>;
