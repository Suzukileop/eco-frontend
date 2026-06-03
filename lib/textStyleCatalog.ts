import type { CSSProperties } from 'react';
import type { Clip, TextPreset } from '@/types/composition';

export type TextStyleGroup = 'basique' | 'tendance' | 'classique';

export interface TextStylePresetDef {
  id: TextPreset;
  label: string;
  group: TextStyleGroup;
  /** Appliqué en plus du preset lors du clic (police, espacement, etc.). */
  patch?: Partial<Clip>;
}

export const TEXT_STYLE_GROUP_LABELS: Record<TextStyleGroup, string> = {
  basique: 'Basique',
  tendance: 'Tendance',
  classique: 'Classique',
};

/** Presets visibles en raccourci (section repliée). */
export const TEXT_STYLE_QUICK_IDS: TextPreset[] = [
  'none',
  'neon',
  'shadow-soft',
  'gradient-gold',
];

export const TEXT_STYLE_PRESETS: TextStylePresetDef[] = [
  // ── Basique ─────────────────────────────────────────────────────────────
  { id: 'none', label: 'Aucun', group: 'basique' },
  { id: 'neon', label: 'Néon', group: 'basique' },
  { id: 'shadow-hard', label: 'Ombre dure', group: 'basique' },
  { id: 'shadow-soft', label: 'Ombre douce', group: 'basique' },
  { id: 'outline-white', label: 'Outline blanc', group: 'basique' },
  { id: 'outline-black', label: 'Outline noir', group: 'basique' },
  { id: 'subtitle', label: 'Sous-titre', group: 'basique', patch: { fontWeight: 'bold', fontSize: 18 } },
  { id: 'minimal', label: 'Minimal', group: 'basique', patch: { fontWeight: 'normal', letterSpacing: 1 } },
  // ── Tendance ────────────────────────────────────────────────────────────
  { id: 'gradient-gold', label: 'Or', group: 'tendance' },
  { id: 'gradient-fire', label: 'Feu', group: 'tendance' },
  { id: 'gradient-ocean', label: 'Océan', group: 'tendance' },
  { id: 'gradient-sunset', label: 'Coucher de soleil', group: 'tendance' },
  { id: 'gradient-mint', label: 'Menthe', group: 'tendance' },
  { id: 'gradient-purple', label: 'Violet', group: 'tendance' },
  { id: 'glow-warm', label: 'Lueur chaude', group: 'tendance' },
  { id: 'glow-pink', label: 'Lueur rose', group: 'tendance' },
  { id: 'retro-80s', label: 'Retro 80s', group: 'tendance' },
  { id: 'pop-bold', label: 'Pop', group: 'tendance', patch: { fontWeight: 'bold' } },
  // ── Classique ───────────────────────────────────────────────────────────
  { id: 'cinematic', label: 'Cinéma', group: 'classique', patch: { letterSpacing: 3, fontWeight: 'bold' } },
  { id: 'comic', label: 'Comic', group: 'classique', patch: { fontWeight: 'bold' } },
  { id: 'horror', label: 'Horreur', group: 'classique' },
  { id: 'ice', label: 'Glace', group: 'classique' },
  { id: 'vintage', label: 'Vintage', group: 'classique' },
  { id: 'double-outline', label: 'Double contour', group: 'classique' },
];

const GRADIENT = (from: string, to: string): CSSProperties => ({
  backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

type PresetStyleInput = Pick<Clip, 'textPreset' | 'fontColor' | 'strokeWidth'>;

/** Presets dont la couleur de remplissage est figée (dégradé ou teinte imposée). */
export function isColorLockedTextPreset(preset?: TextPreset): boolean {
  if (!preset || preset === 'none') return false;
  if (preset.startsWith('gradient-')) return true;
  return (
    preset === 'subtitle' ||
    preset === 'minimal' ||
    preset === 'glow-warm' ||
    preset === 'glow-pink' ||
    preset === 'retro-80s' ||
    preset === 'pop-bold' ||
    preset === 'cinematic' ||
    preset === 'comic' ||
    preset === 'horror' ||
    preset === 'ice' ||
    preset === 'vintage' ||
    preset === 'double-outline'
  );
}

/** Styles CSS appliqués à l’aperçu et au canvas pour un preset. */
export function resolveTextPresetStyle(clip: PresetStyleInput): CSSProperties {
  const preset: TextPreset = clip.textPreset ?? 'none';
  const color = clip.fontColor ?? '#ffffff';
  const stroke = clip.strokeWidth ?? 2;

  switch (preset) {
    case 'neon':
      return {
        color: color === '#ffffff' ? '#00ffff' : color,
        textShadow: `0 0 8px ${color}, 0 0 20px ${color}, 0 0 40px ${color}`,
      };
    case 'shadow-hard':
      return { textShadow: '2px 2px 0 #000, -2px -2px 0 #000' };
    case 'shadow-soft':
      return { textShadow: '0 4px 12px rgba(0,0,0,0.9)' };
    case 'outline-white':
      return {
        color: clip.fontColor ?? '#000000',
        WebkitTextStroke: `${stroke}px #ffffff`,
      } as CSSProperties;
    case 'outline-black':
      return {
        color: clip.fontColor ?? '#ffffff',
        WebkitTextStroke: `${stroke}px #000000`,
      } as CSSProperties;
    case 'gradient-gold':
      return GRADIENT('#f6d365', '#fda085');
    case 'gradient-fire':
      return GRADIENT('#ff4e50', '#f9d423');
    case 'gradient-ocean':
      return GRADIENT('#667eea', '#764ba2');
    case 'gradient-sunset':
      return GRADIENT('#f093fb', '#f5576c');
    case 'gradient-mint':
      return GRADIENT('#11998e', '#38ef7d');
    case 'gradient-purple':
      return GRADIENT('#a855f7', '#ec4899');
    case 'subtitle':
      return {
        color: '#ffffff',
        textShadow: '0 2px 8px rgba(0,0,0,0.85)',
      };
    case 'minimal':
      return {
        color: '#e5e5e5',
        fontWeight: 300,
        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
      } as CSSProperties;
    case 'glow-warm':
      return {
        color: '#ffb347',
        textShadow: '0 0 10px #ff8c00, 0 0 24px #ff6600',
      };
    case 'glow-pink':
      return {
        color: '#ff69b4',
        textShadow: '0 0 10px #ff1493, 0 0 24px #ff69b4',
      };
    case 'retro-80s':
      return {
        color: '#ff00ff',
        textShadow: '2px 2px 0 #00ffff, -2px -2px 0 #ffff00',
      };
    case 'pop-bold':
      return {
        color: '#ffffff',
        WebkitTextStroke: '3px #000000',
        textShadow: '4px 4px 0 #ff0066',
      } as CSSProperties;
    case 'cinematic':
      return {
        color: '#f5f5f5',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        textShadow: '0 2px 16px rgba(0,0,0,0.9)',
      } as CSSProperties;
    case 'comic':
      return {
        color: '#ffe566',
        WebkitTextStroke: '2px #1a1a1a',
        textShadow: '3px 3px 0 #e63946',
      } as CSSProperties;
    case 'horror':
      return {
        color: '#8b0000',
        textShadow: '0 0 12px #000, 2px 2px 4px #000',
      };
    case 'ice':
      return {
        color: '#a8e6ff',
        textShadow: '0 0 12px #4fc3f7, 0 0 28px #81d4fa',
      };
    case 'vintage':
      return {
        color: '#d4a574',
        textShadow: '1px 1px 0 #5c4033',
      };
    case 'double-outline':
      return {
        color: '#ffffff',
        WebkitTextStroke: '2px #000000',
        textShadow: '0 0 0 4px #22d3ee',
      } as CSSProperties;
    default:
      return {};
  }
}

/** Aperçu miniature dans la grille de presets (bouton « T »). */
export function getTextPresetPreviewStyle(preset: TextPreset): CSSProperties {
  return resolveTextPresetStyle({
    textPreset: preset,
    fontColor: preset === 'outline-white' ? '#000000' : '#ffffff',
    strokeWidth: 2,
  });
}

export function getTextStylePresetDef(id: TextPreset): TextStylePresetDef | undefined {
  return TEXT_STYLE_PRESETS.find((p) => p.id === id);
}

export function presetsByGroup(group: TextStyleGroup): TextStylePresetDef[] {
  return TEXT_STYLE_PRESETS.filter((p) => p.group === group);
}
