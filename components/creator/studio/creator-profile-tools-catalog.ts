export type CreatorToolPreset = {
  id: string;
  name: string;
  simpleIconSlug?: string;
  iconColor?: string;
  iconUrl?: string;
  iconLocal?: boolean;
  iconMonochrome?: boolean;
  aliases?: string[];
  category: 'video' | 'design' | 'audio' | 'ai' | 'social' | 'dev' | 'other';
};

const SI9 = (slug: string) => `https://cdn.jsdelivr.net/npm/simple-icons@9.21.0/icons/${slug}.svg`;
const LOCAL = (file: string) => `/creator-tools/${file}.svg`;

export const CREATOR_TOOL_PRESETS: CreatorToolPreset[] = [
  {
    id: 'premiere-pro',
    name: 'Adobe Premiere Pro',
    simpleIconSlug: 'adobepremierepro',
    iconColor: '9999FF',
    iconUrl: SI9('adobepremierepro'),
    iconMonochrome: true,
    category: 'video',
    aliases: ['premiere pro', 'adobe premier pro'],
  },
  {
    id: 'after-effects',
    name: 'Adobe After Effects',
    simpleIconSlug: 'adobeaftereffects',
    iconColor: '9999FF',
    iconUrl: SI9('adobeaftereffects'),
    iconMonochrome: true,
    category: 'video',
  },
  {
    id: 'photoshop',
    name: 'Adobe Photoshop',
    simpleIconSlug: 'adobephotoshop',
    iconColor: '31A8FF',
    iconUrl: SI9('adobephotoshop'),
    iconMonochrome: true,
    category: 'design',
  },
  {
    id: 'illustrator',
    name: 'Adobe Illustrator',
    simpleIconSlug: 'adobeillustrator',
    iconColor: 'FF9A00',
    iconUrl: SI9('adobeillustrator'),
    iconMonochrome: true,
    category: 'design',
  },
  {
    id: 'lightroom',
    name: 'Adobe Lightroom',
    simpleIconSlug: 'adobelightroom',
    iconColor: '31A8FF',
    iconUrl: SI9('adobelightroom'),
    iconMonochrome: true,
    category: 'design',
  },
  { id: 'capcut', name: 'CapCut', iconUrl: LOCAL('capcut'), iconLocal: true, category: 'video', aliases: ['cap cut'] },
  { id: 'davinci-resolve', name: 'DaVinci Resolve', simpleIconSlug: 'davinciresolve', iconColor: 'FF6B35', category: 'video' },
  { id: 'final-cut-pro', name: 'Final Cut Pro', iconUrl: LOCAL('final-cut-pro'), iconLocal: true, category: 'video', aliases: ['final cut'] },
  { id: 'filmora', name: 'Filmora', iconUrl: LOCAL('filmora'), iconLocal: true, category: 'video' },
  { id: 'obs', name: 'OBS Studio', iconUrl: LOCAL('obs-studio'), iconLocal: true, category: 'video' },
  { id: 'blender', name: 'Blender', simpleIconSlug: 'blender', iconColor: 'E87D0D', category: 'video' },
  { id: 'cinema-4d', name: 'Cinema 4D', simpleIconSlug: 'cinema4d', iconColor: '011A6A', category: 'video' },
  {
    id: 'canva',
    name: 'Canva',
    simpleIconSlug: 'canva',
    iconColor: '00C4CC',
    iconUrl: SI9('canva'),
    iconMonochrome: true,
    category: 'design',
  },
  { id: 'figma', name: 'Figma', simpleIconSlug: 'figma', iconColor: 'F24E1E', category: 'design' },
  { id: 'sketch', name: 'Sketch', simpleIconSlug: 'sketch', iconColor: 'F7B500', category: 'design' },
  { id: 'framer', name: 'Framer', simpleIconSlug: 'framer', iconColor: '0055FF', category: 'design' },
  { id: 'notion', name: 'Notion', simpleIconSlug: 'notion', iconColor: '000000', category: 'other' },
  { id: 'logic-pro', name: 'Logic Pro', iconUrl: LOCAL('logic-pro'), iconLocal: true, category: 'audio' },
  {
    id: 'ableton',
    name: 'Ableton Live',
    simpleIconSlug: 'abletonlive',
    iconColor: '000000',
    iconUrl: SI9('abletonlive'),
    iconMonochrome: true,
    category: 'audio',
  },
  { id: 'fl-studio', name: 'FL Studio', iconUrl: LOCAL('fl-studio'), iconLocal: true, category: 'audio', aliases: ['flstudio'] },
  { id: 'audacity', name: 'Audacity', simpleIconSlug: 'audacity', iconColor: '0000CC', category: 'audio' },
  {
    id: 'pro-tools',
    name: 'Pro Tools',
    simpleIconSlug: 'protools',
    iconColor: '7ACB00',
    iconUrl: SI9('protools'),
    iconMonochrome: true,
    category: 'audio',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    simpleIconSlug: 'openai',
    iconColor: '412991',
    iconUrl: SI9('openai'),
    iconMonochrome: true,
    category: 'ai',
  },
  { id: 'midjourney', name: 'Midjourney', iconUrl: LOCAL('midjourney'), iconLocal: true, category: 'ai' },
  { id: 'runway', name: 'Runway', iconUrl: LOCAL('runway'), iconLocal: true, category: 'ai' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', iconUrl: LOCAL('stable-diffusion'), iconLocal: true, category: 'ai' },
  { id: 'elevenlabs', name: 'ElevenLabs', simpleIconSlug: 'elevenlabs', iconColor: '000000', category: 'ai' },
  { id: 'youtube', name: 'YouTube', simpleIconSlug: 'youtube', iconColor: 'FF0000', category: 'social' },
  { id: 'tiktok', name: 'TikTok', simpleIconSlug: 'tiktok', iconColor: '000000', category: 'social' },
  { id: 'instagram', name: 'Instagram', simpleIconSlug: 'instagram', iconColor: 'E4405F', category: 'social' },
  { id: 'linkedin', name: 'LinkedIn', simpleIconSlug: 'linkedin', iconColor: '0A66C2', category: 'social' },
  { id: 'x', name: 'X (Twitter)', simpleIconSlug: 'x', iconColor: '000000', category: 'social', aliases: ['twitter'] },
  { id: 'twitch', name: 'Twitch', simpleIconSlug: 'twitch', iconColor: '9146FF', category: 'social' },
  { id: 'discord', name: 'Discord', simpleIconSlug: 'discord', iconColor: '5865F2', category: 'social' },
  { id: 'wordpress', name: 'WordPress', simpleIconSlug: 'wordpress', iconColor: '21759B', category: 'other' },
  { id: 'webflow', name: 'Webflow', simpleIconSlug: 'webflow', iconColor: '146EF5', category: 'dev' },
  { id: 'vscode', name: 'VS Code', simpleIconSlug: 'visualstudiocode', iconColor: '007ACC', category: 'dev' },
  { id: 'react', name: 'React', simpleIconSlug: 'react', iconColor: '61DAFB', category: 'dev' },
  { id: 'nextjs', name: 'Next.js', simpleIconSlug: 'nextdotjs', iconColor: '000000', category: 'dev', aliases: ['next js'] },
  { id: 'python', name: 'Python', simpleIconSlug: 'python', iconColor: '3776AB', category: 'dev' },
  { id: 'javascript', name: 'JavaScript', simpleIconSlug: 'javascript', iconColor: 'F7DF1E', category: 'dev', aliases: ['js'] },
  { id: 'typescript', name: 'TypeScript', simpleIconSlug: 'typescript', iconColor: '3178C6', category: 'dev', aliases: ['ts'] },
  { id: 'unity', name: 'Unity', simpleIconSlug: 'unity', iconColor: 'FFFFFF', category: 'dev' },
  { id: 'unreal', name: 'Unreal Engine', simpleIconSlug: 'unrealengine', iconColor: '0E1128', category: 'dev' },
  { id: 'google-analytics', name: 'Google Analytics', simpleIconSlug: 'googleanalytics', iconColor: 'E37400', category: 'other' },
  { id: 'mailchimp', name: 'Mailchimp', simpleIconSlug: 'mailchimp', iconColor: 'FFE01B', category: 'other' },
  { id: 'shopify', name: 'Shopify', simpleIconSlug: 'shopify', iconColor: '7AB55C', category: 'other' },
  { id: 'stripe', name: 'Stripe', simpleIconSlug: 'stripe', iconColor: '635BFF', category: 'other' },
];

const CATEGORY_LABELS: Record<CreatorToolPreset['category'], string> = {
  video: 'Video editing',
  design: 'Design',
  audio: 'Audio',
  ai: 'AI',
  social: 'Social',
  dev: 'Development',
  other: 'Other',
};

export function getCreatorToolCategories(): Array<{ id: CreatorToolPreset['category']; label: string }> {
  const seen = new Set<CreatorToolPreset['category']>();
  const ordered: CreatorToolPreset['category'][] = ['video', 'design', 'audio', 'ai', 'social', 'dev', 'other'];
  return ordered
    .filter((category) => {
      const hasItems = CREATOR_TOOL_PRESETS.some((preset) => preset.category === category);
      if (!hasItems || seen.has(category)) return false;
      seen.add(category);
      return true;
    })
    .map((category) => ({ id: category, label: CATEGORY_LABELS[category] }));
}

function normalizeToolKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function findCreatorToolPreset(value: string): CreatorToolPreset | undefined {
  const key = normalizeToolKey(value);
  if (!key) return undefined;
  return CREATOR_TOOL_PRESETS.find((preset) => {
    if (normalizeToolKey(preset.id) === key) return true;
    if (normalizeToolKey(preset.name) === key) return true;
    return preset.aliases?.some((alias) => normalizeToolKey(alias) === key);
  });
}

export function getCreatorToolIconCandidates(preset: CreatorToolPreset): { urls: string[]; monochrome: boolean } {
  const urls: string[] = [];

  if (preset.iconUrl) {
    urls.push(preset.iconUrl);
    if (preset.iconLocal) {
      return { urls, monochrome: false };
    }
  }

  if (preset.simpleIconSlug) {
    urls.push(`https://cdn.simpleicons.org/${preset.simpleIconSlug}/${preset.iconColor ?? '6B7280'}`);
    urls.push(SI9(preset.simpleIconSlug));
  }

  const uniqueUrls = Array.from(new Set(urls));
  const primary = uniqueUrls[0];
  const monochrome =
    preset.iconMonochrome ?? (primary?.includes('jsdelivr.net/npm/simple-icons') ?? false);

  return { urls: uniqueUrls, monochrome };
}

/** @deprecated Use getCreatorToolIconCandidates */
export function getCreatorToolIconUrl(preset: CreatorToolPreset): string | null {
  return getCreatorToolIconCandidates(preset).urls[0] ?? null;
}
