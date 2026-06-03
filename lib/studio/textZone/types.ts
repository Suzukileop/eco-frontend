/** États zone texte — alignés sur text-zone-simulator.html */
export type TextZoneInteractionState = 'normal' | 'selected' | 'editing';

export type TextZoneHandleDir = 'tl' | 'tr' | 'bl' | 'br' | 'ml' | 'mr';

export interface TextZoneRect {
  leftPx: number;
  topPx: number;
  widthPx: number;
  heightPx: number;
}

export interface TextZoneModel extends TextZoneRect {
  fontSize: number;
  content: string;
  rotationDeg: number;
}

export interface TextZoneMoveDrag {
  type: 'move';
  startClientX: number;
  startClientY: number;
  startLeftPx: number;
  startTopPx: number;
  startWidthPx: number;
  startHeightPx: number;
}

export interface TextZoneResizeDrag {
  type: 'resize';
  dir: TextZoneHandleDir;
  startClientX: number;
  startClientY: number;
  startLeftPx: number;
  startTopPx: number;
  startWidthPx: number;
  startHeightPx: number;
  startFontSize: number;
  anchorXPx: number;
  anchorYPx: number;
}

export type TextZoneDrag = TextZoneMoveDrag | TextZoneResizeDrag;
