import type Konva from 'konva';
import { anchorNameIncludes } from '@/lib/studio/konva/transformAnchors';

/** Style des poignées : coins ronds blancs, côtés gauche/droite en pilule, rotation en dessous. */
export function styleKonvaTransformerAnchor(anchor: Konva.Rect): void {
  const name = anchor.name();

  if (anchorNameIncludes(name, 'rotater')) {
    anchor.width(22);
    anchor.height(22);
    anchor.offsetX(11);
    anchor.offsetY(11);
    anchor.cornerRadius(11);
    anchor.fill('#ffffff');
    anchor.stroke('#cbd5e1');
    anchor.strokeWidth(1);
    return;
  }

  const isSide =
    anchorNameIncludes(name, 'middle-left') || anchorNameIncludes(name, 'middle-right');
  const isHorizontal =
    anchorNameIncludes(name, 'top-center') || anchorNameIncludes(name, 'bottom-center');

  if (isSide) {
    anchor.width(6);
    anchor.height(16);
    anchor.offsetX(3);
    anchor.offsetY(8);
    anchor.cornerRadius(3);
    anchor.fill('#ffffff');
    anchor.stroke('#22d3ee');
    anchor.strokeWidth(1);
    return;
  }

  if (isHorizontal) {
    anchor.width(14);
    anchor.height(6);
    anchor.offsetX(7);
    anchor.offsetY(3);
    anchor.cornerRadius(3);
    anchor.fill('#ffffff');
    anchor.stroke('#22d3ee');
    anchor.strokeWidth(1);
    return;
  }

  // Coins
  anchor.width(10);
  anchor.height(10);
  anchor.offsetX(5);
  anchor.offsetY(5);
  anchor.cornerRadius(5);
  anchor.fill('#ffffff');
  anchor.stroke('#22d3ee');
  anchor.strokeWidth(1);
}
