import type { PagedResponse } from '@/types/ecosystem';

export interface MarketplaceCreatorSummary {
  /** Préférer `id` ; le backend peut exposer `userId` à la place. */
  id?: string;
  userId?: string;
  fullName: string;
  avatarUrl: string | null;
  niche: string | null;
  isVerified: boolean;
  portfolioCount?: number;
  averageRating: number | null;
}

export type MarketplaceCreatorsPage = PagedResponse<MarketplaceCreatorSummary>;

export interface MarketplaceContentItem {
  id: string;
  title: string;
  genre: string | null;
  thumbnailUrl: string | null;
  mediaUrl?: string | null;
  priceInfo?: string | null;
  creatorId?: string | null;
}

export interface MarketplaceCreatorPublicProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  niche: string | null;
  bio: string | null;
  isVerified: boolean;
  portfolioCount: number;
  averageRating: number | null;
  /** Présent uniquement si le backend expose les liens pour l’utilisateur authentifié. */
  socialLinks?: Record<string, string> | null;
  portfolio?: MarketplaceContentItem[];
  contents?: MarketplaceContentItem[];
}
