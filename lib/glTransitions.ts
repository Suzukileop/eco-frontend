import type { Transition, TransitionType } from '@/types/composition';
import type { GlTransitionSpec } from 'gl-transitions';
import GLTransitions from 'gl-transitions';
import { CUSTOM_GL_TRANSITIONS } from '@/lib/customGlTransitions';

const ALL_GL_TRANSITIONS: GlTransitionSpec[] = [
  ...(GLTransitions as GlTransitionSpec[]),
  ...CUSTOM_GL_TRANSITIONS,
];

export const GL_TRANSITION_CUT = 'basic-cut';

/** Raccourcis timeline + panneau (noms gl-transitions). */
export const QUICK_GL_TRANSITION_NAMES = [
  GL_TRANSITION_CUT,
  'fade',
  'crossZoom',
  'cube',
  'GlitchMemories',
  'DreamyZoom',
  'directionalwarp',
  'burn',
  'circleopen',
] as const;

/** Anciens presetId CSS → nom GL (données existantes). */
const LEGACY_PRESET_TO_GL: Record<string, string> = {
  'basic-fade': 'fade',
  'basic-fade-soft': 'fadegrayscale',
  'basic-dissolve': 'Dreamy',
  'basic-flash': 'burn',
  'basic-blur': 'LinearBlur',
  'basic-zoom-in': 'crossZoom',
  'basic-zoom-out': 'SimpleZoom',
  'basic-zoom-pop': 'ZoomInCircles',
  'basic-spin': 'rotate_scale_fade',
  'basic-flip': 'cube',
  'basic-glitch-soft': 'GlitchDisplace',
  'basic-glitch': 'GlitchMemories',
  'basic-slide-left': 'slide_uniform',
  'basic-slide-right': 'slide_uniform',
  'basic-slide-up': 'slide_uniform',
  'basic-slide-down': 'slide_uniform',
  'tend-projecteur': 'crossZoom',
  'tend-choc': 'GlitchMemories',
  'tend-decoupe': 'directionalwarp',
  'clas-fondu': 'fade',
  'clas-dissous': 'Dreamy',
  '3d-cube': 'cube',
  'lum-ebloui': 'burn',
};

const DEFAULT_GL_BY_TYPE: Record<TransitionType, string> = {
  cut: GL_TRANSITION_CUT,
  fade: 'fade',
  zoom: 'crossZoom',
  glitch: 'GlitchMemories',
  slide: 'slide_uniform',
};

export function getAllGlTransitions(): GlTransitionSpec[] {
  return ALL_GL_TRANSITIONS;
}

export function getGlTransitionByName(name: string): GlTransitionSpec | undefined {
  if (name === GL_TRANSITION_CUT) return undefined;
  return ALL_GL_TRANSITIONS.find((t) => t.name === name);
}

export function getCustomGlTransitions(): GlTransitionSpec[] {
  return CUSTOM_GL_TRANSITIONS;
}

export function isCutTransitionName(name: string | null | undefined): boolean {
  return !name || name === GL_TRANSITION_CUT;
}

export function resolveGlTransitionName(tr: Transition | undefined): string | null {
  if (!tr || tr.type === 'cut') return null;
  if (tr.glTransitionName && !isCutTransitionName(tr.glTransitionName)) {
    return tr.glTransitionName;
  }
  if (tr.presetId) {
    if (isCutTransitionName(tr.presetId)) return null;
    if (getGlTransitionByName(tr.presetId)) return tr.presetId;
    const legacy = LEGACY_PRESET_TO_GL[tr.presetId];
    if (legacy && getGlTransitionByName(legacy)) return legacy;
  }
  const fallback = DEFAULT_GL_BY_TYPE[tr.type];
  return getGlTransitionByName(fallback) ? fallback : 'fade';
}

export function inferTransitionTypeFromGlName(glName: string): TransitionType {
  if (glName.startsWith('np-')) return 'slide';
  const lower = glName.toLowerCase();
  if (lower.includes('glitch')) return 'glitch';
  if (lower.includes('slide') || lower.includes('warp') || lower.includes('swipe')) return 'slide';
  if (lower.includes('zoom') || lower.includes('cube') || lower.includes('rotate')) return 'zoom';
  if (lower.includes('fade') || lower.includes('dissolve') || lower.includes('blur')) return 'fade';
  return 'fade';
}

export function formatGlTransitionLabel(name: string): string {
  if (name === GL_TRANSITION_CUT) return 'Coupe sèche';
  if (name === 'np-geometric-colorful-swipe') {
    return 'Swipe géométrique coloré';
  }
  return name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/^np /, '');
}

export function getQuickGlTransitions(): { name: string; label: string; isCut: boolean }[] {
  return QUICK_GL_TRANSITION_NAMES.map((name) => ({
    name,
    label: formatGlTransitionLabel(name),
    isCut: name === GL_TRANSITION_CUT,
  }));
}
