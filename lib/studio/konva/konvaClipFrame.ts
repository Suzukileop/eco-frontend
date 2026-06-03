import type Konva from 'konva';

export function applyKonvaTextFrame(
  node: Konva.Group,
  widthPx: number,
  heightPx: number
): void {
  const rect = node.findOne('Rect[name="frame"]') as Konva.Rect | undefined;
  const hit = node.findOne('Rect[name="hit"]') as Konva.Rect | undefined;
  const bg = node.findOne('Rect[name="text-bg"]') as Konva.Rect | undefined;

  hit?.width(widthPx);
  hit?.height(heightPx);
  hit?.x(-widthPx / 2);
  hit?.y(-heightPx / 2);

  rect?.width(widthPx);
  rect?.height(heightPx);
  rect?.x(-widthPx / 2);
  rect?.y(-heightPx / 2);

  if (bg) {
    bg.width(widthPx + 24);
    bg.height(heightPx + 12);
    bg.x(-(widthPx + 24) / 2);
    bg.y(-(heightPx + 12) / 2);
  }
}

export function applyKonvaMediaFrame(
  node: Konva.Group,
  widthPx: number,
  heightPx: number
): void {
  const rect = node.findOne('Rect[name="frame"]') as Konva.Rect | undefined;
  const hit = node.findOne('Rect[name="hit"]') as Konva.Rect | undefined;
  const image = node.findOne('Image') as Konva.Image | undefined;

  hit?.width(widthPx);
  hit?.height(heightPx);
  hit?.x(-widthPx / 2);
  hit?.y(-heightPx / 2);

  rect?.width(widthPx);
  rect?.height(heightPx);
  rect?.x(-widthPx / 2);
  rect?.y(-heightPx / 2);

  image?.width(widthPx);
  image?.height(heightPx);
  image?.x(-widthPx / 2);
  image?.y(-heightPx / 2);
}
