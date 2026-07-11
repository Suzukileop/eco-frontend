import api from '@/lib/api';
import type { CreatorContentItemDto } from '@/types/creator-content';
import type { CreatorProfileDto, CreatorProfileUpdateBody } from '@/types/ecosystem';

export async function getCreatorPortfolio(): Promise<CreatorContentItemDto[]> {
  const res = await api.get<CreatorContentItemDto[]>('/api/creator/profile/portfolio');
  return res.data;
}

export async function updateCreatorPortfolio(contentPostIds: string[]): Promise<CreatorContentItemDto[]> {
  const res = await api.put<CreatorContentItemDto[]>('/api/creator/profile/portfolio', { contentPostIds });
  return res.data;
}

export async function updateCreatorProfile(body: CreatorProfileUpdateBody): Promise<CreatorProfileDto> {
  const res = await api.put<CreatorProfileDto>('/api/creator/profile', body);
  return res.data;
}
