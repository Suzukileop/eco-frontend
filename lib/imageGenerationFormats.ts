/** Catalogue formats image — aligné sur Nano Banana (aspectRatio) et l’éditeur. */
export interface ImageGenerationFormat {
  id: string;
  label: string;
  aspectRatio: string;
  description: string;
}

/** Formats affichés dans le sélecteur visuel (maquette). */
export const IMAGE_FORMAT_PICKER: ImageGenerationFormat[] = [
  { id: '1:1', label: '1:1', aspectRatio: '1:1', description: 'Carré' },
  { id: '9:16', label: '9:16', aspectRatio: '9:16', description: 'Vertical' },
  { id: '16:9', label: '16:9', aspectRatio: '16:9', description: 'Horizontal' },
  { id: '4:5', label: '4:5', aspectRatio: '4:5', description: 'Portrait' },
];

export const IMAGE_GENERATION_FORMATS: ImageGenerationFormat[] = [
  ...IMAGE_FORMAT_PICKER,
  {
    id: '3:4',
    label: '3:4',
    aspectRatio: '3:4',
    description: 'Portrait classique',
  },
];

export type ImageGenerationStyleId = 'creative' | 'realistic' | 'artistic' | '3d';

export interface ImageGenerationStyle {
  id: ImageGenerationStyleId;
  label: string;
  suffix: string;
}

export const IMAGE_GENERATION_STYLES: ImageGenerationStyle[] = [
  {
    id: 'creative',
    label: 'Créatif',
    suffix: '. Creative, imaginative composition, bold colors, social media aesthetic.',
  },
  {
    id: 'realistic',
    label: 'Réaliste',
    suffix: '. Photorealistic, high detail, natural lighting, lifelike.',
  },
  {
    id: 'artistic',
    label: 'Artistique',
    suffix: '. Artistic, painterly, expressive brushwork, fine art mood.',
  },
  {
    id: '3d',
    label: '3D',
    suffix: '. 3D render, soft studio lighting, clean CGI look.',
  },
];

export const IMAGE_PROMPT_MAX_LENGTH = 500;

export const IMAGE_COUNT_OPTIONS = [1, 2, 3, 4] as const;

export type ImageCountOption = (typeof IMAGE_COUNT_OPTIONS)[number];

/** Map format composition éditeur → ratio Nano Banana. */
export function compositionFormatToAspectRatio(
  format: string | undefined,
  customW?: number,
  customH?: number
): string {
  if (format === '16:9') return '16:9';
  if (format === '1:1') return '1:1';
  if (format === '4:5') return '4:5';
  if (format === 'custom' && customW && customH && customW > 0 && customH > 0) {
    const ratio = customW / customH;
    if (ratio > 1.5) return '16:9';
    if (ratio < 0.7) return '9:16';
    if (ratio < 0.9) return '4:5';
    return '1:1';
  }
  return '9:16';
}

export function creditsForImageGeneration(count: number): number {
  return count * 3;
}

export function buildImagePromptWithStyle(
  prompt: string,
  styleId: ImageGenerationStyleId
): string {
  const style = IMAGE_GENERATION_STYLES.find((s) => s.id === styleId);
  const base = prompt.trim();
  if (!style) return base;
  return base + style.suffix;
}
