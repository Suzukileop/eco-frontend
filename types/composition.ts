export type TrackType = 'background' | 'text' | 'audio' | 'overlay' | 'voiceover';
export type ClipType = 'image' | 'video' | 'text' | 'audio' | 'sticker';
export type Format = '9:16' | '16:9' | '1:1' | '4:5' | 'custom';
export type TransitionType = 'cut' | 'fade' | 'zoom' | 'glitch' | 'slide';
export type TextPosition = 'top' | 'center' | 'bottom';
export type TextAlign = 'left' | 'center' | 'right';
export type TextPreset =
  | 'none'
  | 'neon'
  | 'shadow-hard'
  | 'shadow-soft'
  | 'outline-white'
  | 'outline-black'
  | 'gradient-gold'
  | 'gradient-fire'
  | 'subtitle'
  | 'minimal'
  | 'gradient-ocean'
  | 'gradient-sunset'
  | 'gradient-mint'
  | 'gradient-purple'
  | 'glow-warm'
  | 'glow-pink'
  | 'retro-80s'
  | 'pop-bold'
  | 'cinematic'
  | 'comic'
  | 'horror'
  | 'ice'
  | 'vintage'
  | 'double-outline';

export interface Clip {
  id: string;
  trackType: TrackType;
  type: ClipType;
  startTime: number;
  endTime: number;
  url?: string;
  trimStart?: number;
  trimEnd?: number;
  volume?: number;       // 0–2 (200%)
  fadeIn?: number;
  fadeOut?: number;
  opacity?: number;
  muted?: boolean;
  playbackRate?: number; // 0.25–4
  filterPreset?: string; // CSS-filter preset name

  // ── Text clip properties ─────────────────────────────────────────────────
  content?: string;
  position?: TextPosition;
  // Free canvas position (percent of canvas width/height). Overrides position when set.
  x?: number; // 0–100 %
  y?: number; // 0–100 %
  /** Largeur de la zone texte (% de la largeur du cadre vidéo). */
  boxWidthPct?: number;
  /** Coin ancré (px canvas) lors d'un resize par coin — reste immobile. */
  textAnchorCorner?: 'nw' | 'ne' | 'sw' | 'se';
  textAnchorXPx?: number;
  textAnchorYPx?: number;
  /** Hauteur du cadre en px (resize par coin, suit la souris en Y). */
  textFrameHeightPx?: number;
  /** Rotation du bloc texte (degrés). */
  textRotation?: number;
  /** Échelle uniforme image/vidéo dans le cadre (1 = 100 %, peut déborder). */
  mediaScale?: number;
  /** Décalage horizontal du média dans le cadre (% de la largeur du cadre). */
  mediaOffsetX?: number;
  /** Décalage vertical du média dans le cadre (% de la hauteur du cadre). */
  mediaOffsetY?: number;
  /** Rotation du média dans le cadre (degrés). */
  mediaRotation?: number;
  /** Dimensions source (px) — conserve le ratio à l'insertion et au rendu. */
  mediaNaturalWidth?: number;
  mediaNaturalHeight?: number;
  textAlign?: TextAlign;
  /** Transformation CSS de casse (optionnel, le contenu peut aussi être modifié). */
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  letterSpacing?: number; // in px
  lineHeight?: number; // multiplier, e.g. 1.4

  // Color
  fontColor?: string;

  // Background
  backgroundColor?: string;
  backgroundOpacity?: number; // 0–1

  // Shadow
  textShadow?: boolean;
  textShadowColor?: string;
  textShadowBlur?: number;
  textShadowX?: number;
  textShadowY?: number;

  // Stroke / outline
  strokeColor?: string;
  strokeWidth?: number;

  // Style preset (shortcut to apply multiple styles at once)
  textPreset?: TextPreset;

  /** Modèle texte multi-lignes (éditeur Pro / Remotion). */
  textTemplateId?: string;
  textTemplateSlots?: Record<string, string>;

  // ── Metadata ─────────────────────────────────────────────────────────────
  segmentId?: string;
  sequenceLabel?: string;
  isFromAI?: boolean;
  thumbnail?: string;

  /**
   * Piste vidéo dans la timeline (0 = V1 séquence principale, contiguë ;
   * ≥ 1 = superposition libre, indépendante de V1).
   */
  backgroundLane?: number;
}

export interface Transition {
  id: string;
  fromClipId: string;
  toClipId: string;
  type: TransitionType;
  duration: number;
  /** Nom gl-transitions / custom (miroir de glTransitionName pour persistance). */
  presetId?: string;
  /** Nom de transition WebGL — source de vérité pour l’aperçu. */
  glTransitionName?: string;
}

export interface Composition {
  id?: string;
  analysisId: string;
  title: string;
  duration: number;
  fps: 30 | 60;
  format: Format;
  /** Ratio personnalisé (largeur × hauteur) lorsque format === 'custom'. */
  customAspectW?: number;
  customAspectH?: number;
  /** Fond du cadre format (zones letterbox / sous le média). */
  canvasBackgroundColor?: string;
  /** Bordure du cadre format (0 = aucune). */
  frameBorderWidth?: number;
  frameBorderColor?: string;
  tracks: {
    background: Clip[];
    text: Clip[];
    audio: Clip[];
    overlay: Clip[];
    /** Voix off (narration) — même logique audio que la piste musique, piste timeline séparée */
    voiceover: Clip[];
  };
  transitions: Transition[];
  updatedAt?: string;
}
