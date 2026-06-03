'use client';

import { Line } from 'react-konva';
import { useEditorUiStore } from '@/stores/editorUiStore';

interface KonvaSnapGuidesLayerProps {
  canvasWidth: number;
  canvasHeight: number;
}

export function KonvaSnapGuidesLayer({ canvasWidth, canvasHeight }: KonvaSnapGuidesLayerProps) {
  const guides = useEditorUiStore((s) => s.konvaSnapGuides);

  return (
    <>
      {guides.vertical.map((x) => (
        <Line
          key={`v-${x}`}
          points={[x, 0, x, canvasHeight]}
          stroke="#22d3ee"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      ))}
      {guides.horizontal.map((y) => (
        <Line
          key={`h-${y}`}
          points={[0, y, canvasWidth, y]}
          stroke="#22d3ee"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      ))}
    </>
  );
}
