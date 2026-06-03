export interface CreatorContentCreateBody {
  title: string;
  genre: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  priceInfo: string;
  toolsUsed: string[];
  externalRef?: string;
  isPublic: boolean;
}

export interface CreatorContentItemDto {
  id: string;
  title: string;
  genre: string | null;
  description: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  priceInfo: string | null;
  toolsUsed: string[];
  externalRef: string | null;
  isPublic: boolean;
  views: number;
  likes: number;
  createdAt: string;
}
