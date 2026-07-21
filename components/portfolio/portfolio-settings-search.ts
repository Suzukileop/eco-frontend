import type { PortfolioSettingsSectionId } from '@/components/portfolio/portfolio-settings-types';
import { PORTFOLIO_SETTINGS_SECTIONS } from '@/components/portfolio/portfolio-settings-types';

export type PortfolioSettingsSearchEntry = {
  id: string;
  sectionId: PortfolioSettingsSectionId;
  subSection?: string;
  label: string;
  path: string;
  keywords: string[];
};

function entry(
  sectionId: PortfolioSettingsSectionId,
  label: string,
  keywords: string[],
  subSection?: string
): PortfolioSettingsSearchEntry {
  const sectionLabel =
    PORTFOLIO_SETTINGS_SECTIONS.find((section) => section.id === sectionId)?.label ?? sectionId;
  return {
    id: subSection ? `${sectionId}:${subSection}:${label}` : `${sectionId}:${label}`,
    sectionId,
    subSection,
    label,
    path: subSection ? `${sectionLabel} · ${label}` : sectionLabel,
    keywords: [...keywords, sectionLabel, sectionId],
  };
}

/** Searchable settings destinations (sections, subsections, and common controls). */
export const PORTFOLIO_SETTINGS_SEARCH_INDEX: PortfolioSettingsSearchEntry[] = [
  ...PORTFOLIO_SETTINGS_SECTIONS.map((section) =>
    entry(section.id, section.label, [section.description, section.label])
  ),

  // Global
  entry('theme', 'Theme & preferences', ['theme', 'preferences', 'shortcut', 'thème', 'préférences'], 'theme'),
  entry(
    'theme',
    'Dark / light mode',
    [
      'appearance',
      'dark',
      'light',
      'sombre',
      'clair',
      'mode',
      'palette',
      'color mode',
      'night',
      'day',
    ],
    'theme'
  ),
  entry('theme', 'Theme palette', ['theme', 'color', 'colors', 'palette', 'custom theme', 'thème', 'couleur'], 'theme'),
  entry('theme', 'Keyboard shortcut', ['shortcut', 'ctrl', 'cmd', 'raccourci', 'settings'], 'theme'),
  entry(
    'theme',
    'Page background',
    [
      'background',
      'page background',
      'arrière-plan',
      'fond',
      'image',
      'wallpaper',
      'library',
      'bibliothèque',
    ],
    'background'
  ),
  entry(
    'theme',
    'Background image library',
    ['library', 'upload', 'images', '5', 'bibliothèque', 'galerie'],
    'background'
  ),
  entry(
    'theme',
    'Background pattern',
    ['pattern', 'motif', 'arrows', 'cubes', 'hexagons', 'texture', 'flèches', 'hexagones'],
    'background'
  ),
  entry('theme', 'Section order', ['order', 'reorder', 'section order', 'ordre', 'sections'], 'order'),
  entry(
    'theme',
    'Titles & motion',
    [
      'title',
      'subtitle',
      'description',
      'typography',
      'font',
      'alignment',
      'orientation',
      'sticky',
      'motion',
      'scroll',
      'titre',
      'sous-titre',
      'alignement',
      'police',
    ],
    'titles'
  ),
  entry('theme', 'Title alignment', ['title', 'alignment', 'align', 'titre', 'alignement'], 'titles'),
  entry(
    'theme',
    'Section subtitle typography',
    ['subtitle', 'description', 'sous-titre', 'typography', 'font', 'color', 'size'],
    'titles'
  ),
  entry(
    'theme',
    'Layout & width',
    ['width', 'content width', 'gutter', 'margins', 'largeur', 'layout', 'responsive'],
    'layout'
  ),
  entry(
    'theme',
    'Typography & title box',
    [
      'typography',
      'font',
      'subtitle',
      'chrome',
      'title box',
      'typo',
      'police',
      'body font',
      'maison neue',
      'plus jakarta',
      'caractères',
    ],
    'typography'
  ),
  entry(
    'theme',
    'Police principale',
    [
      'body font',
      'site font',
      'police',
      'plus jakarta',
      'maison neue',
      'montserrat',
      'raleway',
      'roboto',
      'caractères',
      'texte',
    ],
    'typography'
  ),

  // Navigation
  entry(
    'navigation',
    'Use color palette',
    ['palette', 'manual', 'manuel', 'tokens', 'couleurs', 'désactiver palette'],
    'general'
  ),
  entry(
    'navigation',
    'Hover effect',
    ['hover', 'survol', 'item hover', 'hover color', 'palette'],
    'style'
  ),
  entry(
    'navigation',
    'Use color palette (Bar & buttons)',
    ['palette', 'manual', 'bar', 'buttons', 'style', 'manuel'],
    'style'
  ),
  entry(
    'navigation',
    'Palette',
    ['palette', 'color', 'couleur', 'tokens', 'semantic', 'bound colors'],
    'palette'
  ),
  entry('navigation', 'Contact button', ['contact', 'cta', 'bouton', 'vertical'], undefined),
  entry(
    'navigation',
    'Contact display',
    ['contact', 'icon', 'button', 'label', 'affichage', 'chat'],
    undefined
  ),
  entry(
    'navigation',
    'Contact icon',
    ['contact', 'phone', 'handset', 'smartphone', 'ringing', 'icone', 'telephone'],
    undefined
  ),
  entry(
    'navigation',
    'Detach Contact',
    ['detach', 'detacher', 'free space', 'right', 'split', 'extras'],
    undefined
  ),
  entry(
    'navigation',
    'Contact colors',
    ['contact', 'background', 'border', 'blur', 'glass', 'shadow', 'couleur'],
    undefined
  ),
  entry(
    'navigation',
    'Link icons',
    ['mail', 'youtube', 'instagram', 'social', 'icons', 'free space', 'liens'],
    undefined
  ),
  entry(
    'navigation',
    'Link icons position',
    ['left', 'right', 'auto', 'extras', 'position', 'deplacer'],
    undefined
  ),
  entry(
    'navigation',
    'Link icon colors',
    ['link icon', 'background', 'mail', 'youtube', 'couleur', 'fond'],
    undefined
  ),
  entry('navigation', 'Show navigation', ['menu', 'visibility', 'afficher', 'navigation']),
  entry('navigation', 'Handle colors', ['handle', 'menu', 'chevron', 'illisible', 'contrast'], undefined),
  entry('navigation', 'Navigation type', ['nav mode', 'per page', 'pages', 'default', 'type']),
  entry('navigation', 'When to appear', ['always', 'after scrolling', 'after hero', 'display', 'apparition']),
  entry('navigation', 'Glass / blur', ['glass', 'blur', 'frosted', 'flou', 'ombre'], undefined),
  entry('navigation', 'Bar shadow', ['shadow', 'halo', 'ombre', 'bar'], undefined),
  entry(
    'navigation',
    'Blur thickness',
    ['blur thickness', 'epaisseur', 'glass strength', 'intensity'],
    undefined
  ),
  entry(
    'navigation',
    'Shadow thickness',
    ['shadow thickness', 'epaisseur ombre', 'halo strength'],
    undefined
  ),
  entry('navigation', 'Button padding', ['button padding', 'pill', 'padding', 'bouton'], undefined),
  entry('navigation', 'Bar padding', ['bar padding', 'shell', 'padding'], undefined),

  // Hero
  entry('hero', 'General', ['visibility', 'title', 'subtitle', 'flip', 'division', 'layout', 'écran', 'général'], 'general'),
  entry(
    'hero',
    'Use color palette',
    ['palette', 'manual', 'manuel', 'tokens', 'couleurs', 'désactiver palette'],
    'general'
  ),
  entry(
    'hero',
    'Use color palette (Fond)',
    ['palette', 'manual', 'fond', 'background', 'manuel'],
    'background'
  ),
  entry(
    'hero',
    'Use color palette (elements)',
    [
      'palette',
      'manual',
      'manuel',
      'tokens',
      'titre',
      'description',
      'cta',
      'outils',
      'portrait',
      'stats',
      'disponibilité',
      'motifs',
    ],
    'title'
  ),
  entry(
    'hero',
    'Screen division',
    ['division', 'layout', 'flip', 'horizontal', 'vertical', 'stack', 'copy', 'visual', 'gauche', 'droite'],
    'general'
  ),
  entry(
    'hero',
    'Palette',
    ['palette', 'color', 'couleur', 'tokens', 'semantic', 'bound colors'],
    'palette'
  ),
  entry('hero', 'Background', ['fill', 'gradient', 'opacity', 'fond', 'arrière-plan'], 'background'),
  entry(
    'hero',
    'Motifs',
    [
      'motif',
      'motifs',
      'pattern',
      'patterns',
      'shape',
      'shapes',
      'geometric',
      'background pattern',
      'left',
      'right',
      'size',
      'placement',
      'responsive',
      'mobile',
      'desktop',
    ],
    'motifs'
  ),
  entry(
    'hero',
    'Availability badge',
    [
      'availability',
      'badge',
      'disponible',
      'disponibilité',
      'placement',
      'mobile',
      'tablet',
      'desktop',
      'top-center',
      'top left',
      'top right',
      'phrase',
      'dot',
      'typography',
    ],
    'availability'
  ),
  entry(
    'hero',
    'Titre',
    ['headline', 'title', 'prefix', 'accent', 'font', 'typography', 'titre', 'préfixe', 'free placement', 'alignment', 'desktop alignment', 'alignement'],
    'title'
  ),
  entry(
    'hero',
    'Description',
    ['description', 'pitch', 'paragraph', 'typography', 'alignment', 'desktop alignment', 'alignement'],
    'description'
  ),
  entry(
    'hero',
    'Outils',
    ['tools', 'tools label', 'preferred tools', 'outils', 'label', 'caption', 'icon', 'chip', 'alignment', 'desktop alignment', 'alignement'],
    'tools'
  ),
  entry(
    'hero',
    'CTA',
    ['contact button', 'cta', 'design', 'placement', 'surface', 'typography', 'bouton', 'alignment', 'desktop alignment', 'alignement'],
    'cta'
  ),
  entry(
    'hero',
    'Portrait',
    ['photo', 'image', 'frame', 'creator name', 'portrait', 'typography', 'status dot', 'blinking dot', 'point clignotant'],
    'portrait'
  ),
  entry(
    'hero',
    'Stat cards',
    ['stats', 'years', 'projects', 'location', 'badges', 'cartes', 'typography', 'accent'],
    'stats'
  ),

  // Portfolio / work
  entry(
    'work',
    'Use Hero color palette',
    ['palette', 'hero palette', 'sync colors', 'couleurs', 'palette hero'],
    'general'
  ),
  // Work
  entry(
    'work',
    'Use color palette',
    ['palette', 'manual', 'manuel', 'tokens', 'couleurs', 'désactiver palette'],
    'general'
  ),
  entry(
    'work',
    'Palette',
    ['palette', 'color', 'couleur', 'tokens', 'semantic', 'bound colors'],
    'palette'
  ),
  entry('work', 'General', ['visibility', 'marketplace', 'show portfolio'], 'general'),
  entry('work', 'Header', ['title', 'subtitle', 'fonts', 'colors'], 'header'),
  entry('work', 'Categories', ['filter', 'category', 'group', 'catégories', 'placement', 'typography'], 'categories'),
  entry(
    'work',
    'Cards',
    ['layout', 'grid', 'overlay', 'design', 'responsive', 'cards', 'cartes', 'columns', 'media', 'largeur', 'width'],
    'cards'
  ),
  entry(
    'work',
    'Titre',
    ['title', 'project title', 'typography', 'placement', 'titre', 'overlay'],
    'title'
  ),
  entry(
    'work',
    'Description',
    ['description', 'body', 'typography', 'placement', 'texte'],
    'description'
  ),
  entry(
    'work',
    'Outils',
    ['tools', 'logos', 'icons', 'outils', 'placement', 'typography'],
    'tools'
  ),
  entry(
    'work',
    'CTA',
    ['view project', 'button', 'cta', 'bouton', 'placement', 'typography'],
    'cta'
  ),
  entry(
    'work',
    'Cadre des informations',
    ['info frame', 'content frame', 'border', 'padding', 'gap', 'cadre info', 'informations'],
    'cards'
  ),
  entry('work', 'Background', ['fill', 'gradient', 'opacity', 'fond'], 'background'),

  // Services
  entry(
    'services',
    'Use Hero color palette',
    ['palette', 'hero palette', 'sync colors', 'couleurs', 'palette hero'],
    'general'
  ),
  entry(
    'services',
    'Use color palette',
    ['palette', 'manual', 'manuel', 'tokens', 'couleurs', 'désactiver palette'],
    'general'
  ),
  entry(
    'services',
    'Palette',
    ['palette', 'color', 'couleur', 'tokens', 'semantic', 'bound colors'],
    'palette'
  ),
  entry('services', 'General', ['visibility', 'layout mode', 'block order'], 'general'),
  entry('services', 'Header', ['title', 'subtitle', 'titre'], 'header'),
  entry('services', 'Designs & grille', ['grid', 'design', 'skills', 'services', 'per row'], 'layout'),
  entry('services', 'Cadre carte', ['frame', 'border', 'radius', 'padding', 'card'], 'frame'),
  entry('services', 'Ergonomie', ['alignment', 'placement', 'card layout'], 'ergonomics'),
  entry('services', 'Card content', ['show', 'hide', 'elements'], 'content'),
  entry('services', 'Skills', ['skill', 'tool', 'typography', 'icon size', 'title', 'body'], 'skills'),
  entry(
    'services',
    'Services',
    ['service', 'card title', 'price', 'delivery', 'typography', 'subheading'],
    'servicesText'
  ),
  entry('services', 'Background', ['fill', 'gradient', 'fond'], 'background'),

  // About
  entry(
    'about',
    'Use Hero color palette',
    ['palette', 'hero palette', 'sync colors', 'couleurs', 'palette hero'],
    'general'
  ),
  entry('about', 'General', ['visibility', 'stats', 'sidebar'], 'general'),
  entry('about', 'Palette', ['tokens', 'bindings', 'semantic colors'], 'palette'),
  entry('about', 'Header', ['title', 'subtitle'], 'header'),
  entry('about', 'Layout', ['sidebar', 'position', 'design'], 'layout'),
  entry('about', 'Cadre stats', ['stats frame', 'border', 'radius'], 'frame'),
  entry('about', 'Style stats', ['stats style', 'numbers', 'labels'], 'statsStyle'),
  entry('about', 'Panneau profil', ['profile', 'side panel', 'sidebar'], 'sidePanel'),
  entry('about', 'Why me', ['why work with me', 'pourquoi'], 'whyMe'),
  entry('about', 'Style side panel', ['typography', 'colors', 'profile rows'], 'styleSide'),
  entry('about', 'Style Why me', ['typography', 'colors', 'bullets'], 'styleWhyMe'),
  entry('about', 'Content blocks', ['show', 'hide', 'blocks'], 'content'),
  entry('about', 'Background', ['fill', 'gradient', 'fond'], 'background'),

  // Experience
  entry(
    'experience',
    'Use Hero color palette',
    ['palette', 'hero palette', 'sync colors', 'couleurs', 'palette hero'],
    'general'
  ),
  entry('experience', 'General', ['visibility', 'timeline', 'spacing'], 'general'),
  entry('experience', 'Palette', ['tokens', 'bindings', 'semantic colors'], 'palette'),
  entry('experience', 'Header', ['title', 'subtitle'], 'header'),
  entry('experience', 'Years', ['years', 'summary', 'années'], 'years'),
  entry('experience', 'Content', ['fields', 'labels', 'order', 'roles'], 'content'),
  entry('experience', 'Style entry', ['title', 'organization', 'meta', 'description'], 'styleEntry'),
  entry('experience', 'Style years', ['years color', 'highlight'], 'styleYears'),
  entry('experience', 'Style blocks', ['tasks', 'proof', 'skills', 'tools'], 'styleBlocks'),
  entry('experience', 'Frame', ['entry', 'story', 'details', 'card'], 'frame'),
  entry('experience', 'Background', ['fill', 'gradient', 'fond'], 'background'),

  // FAQ
  entry(
    'faq',
    'Use Hero color palette',
    ['palette', 'hero palette', 'sync colors', 'couleurs', 'palette hero'],
    'general'
  ),
  entry('faq', 'General', ['visibility', 'accordion', 'spacing'], 'general'),
  entry('faq', 'Palette', ['tokens', 'bindings', 'semantic colors'], 'palette'),
  entry('faq', 'Header', ['title', 'subtitle'], 'header'),
  entry('faq', 'Frame', ['card', 'border', 'radius'], 'frame'),
  entry('faq', 'Items', ['questions', 'answers', 'icons'], 'items'),
  entry('faq', 'Style question', ['question', 'typography'], 'styleQuestion'),
  entry('faq', 'Style answer', ['answer', 'typography'], 'styleAnswer'),
  entry('faq', 'Style number', ['number', 'typography'], 'styleNumber'),
  entry('faq', 'Background', ['fill', 'gradient', 'fond'], 'background'),

  // Contact
  entry(
    'contact',
    'Use Hero color palette',
    ['palette', 'hero palette', 'sync colors', 'couleurs', 'palette hero'],
    'general'
  ),
  entry('contact', 'General', ['visibility', 'cta', 'design'], 'general'),
  entry('contact', 'Header', ['title', 'subtitle'], 'header'),
  entry('contact', 'Typography', ['color', 'font', 'size', 'typography', 'channel', 'links', 'cta'], 'style'),
  entry('contact', 'Card frame', ['border', 'radius', 'frame'], 'frame'),
  entry('contact', 'Content', ['email', 'phone', 'social', 'channels'], 'content'),
  entry('contact', 'Background', ['fill', 'gradient', 'fond'], 'background'),

  // Footer
  entry(
    'footer',
    'Use Hero color palette',
    ['palette', 'hero palette', 'sync colors', 'couleurs', 'palette hero'],
    'general'
  ),
  entry('footer', 'General', ['visibility', 'design', 'colors'], 'general'),
  entry('footer', 'Content', ['brand', 'copyright', 'links', 'credit'], 'content'),
  entry('footer', 'Typography', ['color', 'font', 'size', 'typography', 'cta', 'meta'], 'typography'),
  entry('footer', 'Background', ['fill', 'gradient', 'pattern', 'fond'], 'background'),
];

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9&+\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ordered character match — rewards progressive typing even with skipped letters. */
function subsequenceScore(query: string, target: string): number {
  if (!query) return 0;
  let qi = 0;
  let streak = 0;
  let bestStreak = 0;
  let score = 0;
  for (let ti = 0; ti < target.length && qi < query.length; ti += 1) {
    if (target[ti] === query[qi]) {
      score += 2 + streak;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
      qi += 1;
    } else {
      streak = 0;
    }
  }
  if (qi < query.length) return 0;
  return score + bestStreak * 3;
}

function scoreEntry(queryRaw: string, item: PortfolioSettingsSearchEntry): number {
  const query = normalizeSearchText(queryRaw);
  if (!query) return 0;

  const label = normalizeSearchText(item.label);
  const path = normalizeSearchText(item.path);
  const blob = normalizeSearchText([item.label, item.path, ...item.keywords].join(' '));
  const tokens = query.split(' ').filter(Boolean);

  let score = 0;

  if (label === query) score += 200;
  else if (label.startsWith(query)) score += 140;
  else if (label.includes(query)) score += 90;

  if (path.startsWith(query)) score += 40;
  else if (path.includes(query)) score += 24;

  if (blob.includes(query)) score += 30;

  for (const token of tokens) {
    if (label.startsWith(token)) score += 28;
    else if (label.includes(token)) score += 16;
    else if (blob.includes(token)) score += 10;
    else {
      const sub = subsequenceScore(token, blob);
      if (sub === 0) return 0;
      score += Math.min(18, sub);
    }
  }

  score += Math.min(36, subsequenceScore(query.replace(/\s+/g, ''), label.replace(/\s+/g, '')));
  score += Math.min(20, subsequenceScore(query.replace(/\s+/g, ''), blob.replace(/\s+/g, '')));

  // Prefer deep links slightly when equally relevant
  if (item.subSection) score += 4;

  return score;
}

export function searchPortfolioSettings(
  query: string,
  limit = 8
): Array<PortfolioSettingsSearchEntry & { score: number }> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return PORTFOLIO_SETTINGS_SEARCH_INDEX.map((item) => ({
    ...item,
    score: scoreEntry(trimmed, item),
  }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, limit);
}
