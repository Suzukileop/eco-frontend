import type { GlTransitionSpec } from 'gl-transitions';
import { isCustomGlTransitionName } from '@/lib/customGlTransitions';

export type GlTransitionCategoryId =
  | 'all'
  | 'custom'
  | 'fade'
  | 'wipe'
  | 'zoom'
  | 'slide'
  | 'glitch'
  | 'blur'
  | 'shape'
  | 'other';

export interface GlTransitionCategoryDef {
  id: GlTransitionCategoryId;
  label: string;
}

export const GL_TRANSITION_CATEGORIES: GlTransitionCategoryDef[] = [
  { id: 'all', label: 'Tous' },
  { id: 'custom', label: 'Sur mesure' },
  { id: 'fade', label: 'Fondu' },
  { id: 'wipe', label: 'Wipe' },
  { id: 'zoom', label: 'Zoom' },
  { id: 'slide', label: 'Glissement' },
  { id: 'glitch', label: 'Glitch' },
  { id: 'blur', label: 'Flou' },
  { id: 'shape', label: 'Formes' },
  { id: 'other', label: 'Autre' },
];

/** Classe une transition GL pour les filtres du catalogue. */
export function categorizeGlTransition(name: string): GlTransitionCategoryId {
  if (isCustomGlTransitionName(name)) return 'custom';
  const l = name.toLowerCase();

  if (
    /glitch|rgb|static|noise|pixelize|tvstatic|randomnoise|parametric|displace|fragment|swap/i.test(
      name
    ) ||
    l.includes('multiply_blend')
  ) {
    return 'glitch';
  }
  if (/blur|defocus|motionblur/i.test(l)) return 'blur';
  if (
    /wipe|window|curtain|blinds|doorway|bowtie|starwipe|rolls|slice|horizontalclose|horizontalopen|verticalclose|verticalopen|leftright|topbottom|static_wipe|invertedpagecurl|fold/i.test(
      l
    )
  ) {
    return 'wipe';
  }
  if (
    /slide|split|directional|translation|push|swipe|angular|coord-from/i.test(l) &&
    !l.includes('blur')
  ) {
    return 'slide';
  }
  if (
    /zoom|scale|rotate|bounce|cube|crosszoom|circles|squeeze|flyeye|pinwheel|stereoviewer/i.test(
      l
    )
  ) {
    return 'zoom';
  }
  if (
    /fade|dissolve|dreamy|morph|grayscale|hsv|luma|melt|burn|overexposure|colourdistance|colour|colorphase|linearblur/i.test(
      l
    ) &&
    !l.includes('glitch')
  ) {
    return 'fade';
  }
  if (
    /circle|square|hex|kaleido|mosaic|grid|book|puzzle|heart|water|perlin|polar|chess|ripple|swirl|warp|radial|rectangle|box|tile|polka|cannabis|wind|blinds|edge|colour|colorphase|advancedmosaic|blockdissolve|film/i.test(
      l
    )
  ) {
    return 'shape';
  }
  return 'other';
}

export function buildCategoryCounts(
  transitions: GlTransitionSpec[]
): Record<GlTransitionCategoryId, number> {
  const counts: Record<GlTransitionCategoryId, number> = {
    all: transitions.length,
    custom: 0,
    fade: 0,
    wipe: 0,
    zoom: 0,
    slide: 0,
    glitch: 0,
    blur: 0,
    shape: 0,
    other: 0,
  };
  for (const t of transitions) {
    counts[categorizeGlTransition(t.name)] += 1;
  }
  return counts;
}

export function filterTransitionsByCategory(
  transitions: GlTransitionSpec[],
  category: GlTransitionCategoryId
): GlTransitionSpec[] {
  if (category === 'all') return transitions;
  return transitions.filter((t) => categorizeGlTransition(t.name) === category);
}
