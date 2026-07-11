import type { Clip } from '@/types/composition';
import {
  STUDIO_TEXT_BASE_FONT_SIZE_MAX,
  STUDIO_TEXT_BASE_FONT_SIZE_MIN,
} from '@/lib/studio/textZone/textZoneGeometry';

export const FONT_FAMILIES = [
  { label: 'Par défaut', value: 'inherit' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Oswald', value: 'Oswald, sans-serif' },
  { label: 'Bebas Neue', value: "'Bebas Neue', sans-serif" },
  { label: 'Anton', value: 'Anton, sans-serif' },
  { label: 'Righteous', value: 'Righteous, sans-serif' },
  { label: 'Raleway', value: 'Raleway, sans-serif' },
  { label: 'Dancing Script', value: "'Dancing Script', cursive" },
  { label: 'Pacifico', value: 'Pacifico, cursive' },
  { label: 'Lobster', value: 'Lobster, cursive' },
  { label: 'Permanent Marker', value: "'Permanent Marker', cursive" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Impact', value: 'Impact, fantasy' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Bangers', value: 'Bangers, cursive' },
  { label: 'Archivo Black', value: "'Archivo Black', sans-serif" },
  { label: 'Caveat', value: 'Caveat, cursive' },
  { label: 'Satisfy', value: 'Satisfy, cursive' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
];

export const COLOR_PRESETS = [
  '#ffffff', '#000000', '#ffff00', '#ff0000', '#ff6b00',
  '#00ff00', '#00ffff', '#0080ff', '#ff00ff', '#ff69b4',
  '#a855f7', '#10b981', '#f59e0b', '#6b7280', '#1f2937',
];

export const FONT_SIZE_OPTIONS = Array.from(
  { length: STUDIO_TEXT_BASE_FONT_SIZE_MAX - STUDIO_TEXT_BASE_FONT_SIZE_MIN + 1 },
  (_, i) => i + STUDIO_TEXT_BASE_FONT_SIZE_MIN
);

/** Valeurs d’aperçu quand aucun clip texte n’est éditable. */
export const TEXT_PANEL_DEFAULTS: Clip = {
  id: '__text-panel-preview__',
  trackType: 'text',
  type: 'text',
  startTime: 0,
  endTime: 1,
  content: '',
  textPreset: 'none',
  fontFamily: 'inherit',
  fontSize: 24,
  fontWeight: 'bold',
  fontStyle: 'normal',
  textDecoration: 'none',
  textAlign: 'center',
  position: 'center',
  x: 50,
  y: 50,
  fontColor: '#ffffff',
  backgroundOpacity: 0,
  backgroundColor: '#000000',
  opacity: 1,
  letterSpacing: 0,
  lineHeight: 1.3,
  textShadow: false,
  strokeWidth: 0,
};
