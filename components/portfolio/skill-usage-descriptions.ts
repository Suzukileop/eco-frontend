import {
  findCreatorToolPreset,
  type CreatorToolPreset,
} from '@/components/creator/studio/creator-profile-tools-catalog';

const CATEGORY_USAGE: Record<CreatorToolPreset['category'], string> = {
  video: 'Cutting, pacing, and polishing footage into stories people actually want to watch.',
  design: 'Building visuals that feel cohesive, on-brand, and ready for any platform.',
  audio: 'Cleaning up sound and mixing levels so every project feels professional.',
  ai: 'Speeding up creative workflows while keeping quality and control in your hands.',
  social: 'Shaping content that fits each platform and speaks to the right audience.',
  dev: 'Technical work behind the scenes — reliable setups that keep projects moving.',
  other: 'A trusted part of my day-to-day workflow when quality and speed both matter.',
};

const TOOL_USAGE_OVERRIDES: Record<string, string> = {
  'premiere-pro': 'My main editing suite for narrative cuts, color, and export-ready deliverables.',
  'after-effects': 'Motion graphics, titles, and visual effects that add energy to the story.',
  'photoshop': 'Photo retouching, compositing, and asset prep before anything goes live.',
  'illustrator': 'Vector graphics and brand elements that scale cleanly across formats.',
  'lightroom': 'Color grading and photo consistency across an entire shoot or campaign.',
  capcut: 'Fast social-first edits when turnaround needs to be quick without looking rushed.',
  'davinci-resolve': 'Professional color grading and finishing for a cinematic look.',
  figma: 'UI layouts and design systems I use to align visuals before production starts.',
  canva: 'Quick branded assets and social templates when speed is part of the brief.',
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getSkillUsageDescription(label: string): string {
  const preset = findCreatorToolPreset(label);
  if (preset) {
    const override = TOOL_USAGE_OVERRIDES[preset.id];
    if (override) return override;
    return CATEGORY_USAGE[preset.category];
  }

  const key = normalizeKey(label);
  const aliasMatch = Object.entries(TOOL_USAGE_OVERRIDES).find(([id]) => id === key);
  if (aliasMatch) return aliasMatch[1];

  return 'Part of my everyday toolkit — used to deliver consistent, high-quality results.';
}
