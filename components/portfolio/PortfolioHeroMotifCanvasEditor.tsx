'use client';

import { useCallback, useRef, useState } from 'react';
import {
  clampMotifPanelPosition,
  clampMotifPanelSize,
  type MotifPanelPosition,
  type MotifPanelSize,
} from '@/components/portfolio/portfolio-hero-motif-panel';
import {
  clampMotifPoint,
  getMotifTemplatePoints,
  insertMotifPointOnEdge,
  MOTIF_SHAPE_TEMPLATES,
  pointsToLocalPolygonAttribute,
  removeMotifPoint,
  type MotifEditorSide,
  type MotifPoint,
  type MotifShapeTemplateId,
} from '@/components/portfolio/portfolio-hero-motif-geometry';

export type MotifEditorMode = 'move' | 'shape' | 'resize';

type PortfolioHeroMotifCanvasEditorProps = {
  side: MotifEditorSide;
  points: MotifPoint[];
  color: string;
  position: MotifPanelPosition;
  size: MotifPanelSize;
  onChangePoints: (points: MotifPoint[]) => void;
  onChangeTransform: (patch: { position?: MotifPanelPosition; size?: MotifPanelSize }) => void;
  showTemplates?: boolean;
};

type DragState =
  | { kind: 'move' }
  | { kind: 'shape'; index: number }
  | { kind: 'resize'; corner: 'nw' | 'ne' | 'sw' | 'se' };

function svgToLocalPoint(
  svgPoint: MotifPoint,
  position: MotifPanelPosition,
  size: MotifPanelSize
): MotifPoint {
  const left = position.x - size.width / 2;
  const top = position.y - size.height / 2;
  return clampMotifPoint({
    x: ((svgPoint.x - left) / size.width) * 100,
    y: ((svgPoint.y - top) / size.height) * 100,
  });
}

export function PortfolioHeroMotifCanvasEditor({
  side,
  points,
  color,
  position,
  size,
  onChangePoints,
  onChangeTransform,
  showTemplates = true,
}: PortfolioHeroMotifCanvasEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<MotifEditorMode>('move');
  const [drag, setDrag] = useState<DragState | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [addPointMode, setAddPointMode] = useState(false);
  const dragOrigin = useRef<{ position: MotifPanelPosition; size: MotifPanelSize; pointer: MotifPoint } | null>(
    null
  );

  const clientToSvg = useCallback((clientX: number, clientY: number): MotifPoint | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }, []);

  const panelLeft = position.x - size.width / 2;
  const panelTop = position.y - size.height / 2;
  const localPolygon = pointsToLocalPolygonAttribute(points, size.width, size.height);

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!drag || !dragOrigin.current) return;
    const next = clientToSvg(event.clientX, event.clientY);
    if (!next) return;

    if (drag.kind === 'move') {
      const dx = next.x - dragOrigin.current.pointer.x;
      const dy = next.y - dragOrigin.current.pointer.y;
      onChangeTransform({
        position: clampMotifPanelPosition(
          {
            x: dragOrigin.current.position.x + dx,
            y: dragOrigin.current.position.y + dy,
          },
          side,
          size
        ),
      });
      return;
    }

    if (drag.kind === 'shape') {
      const local = svgToLocalPoint(next, dragOrigin.current.position, dragOrigin.current.size);
      onChangePoints(points.map((point, index) => (index === drag.index ? local : point)));
      return;
    }

    if (drag.kind === 'resize') {
      const halfW = Math.max(5, Math.abs(next.x - dragOrigin.current.position.x));
      const halfH = Math.max(5, Math.abs(next.y - dragOrigin.current.position.y));
      onChangeTransform({
        size: clampMotifPanelSize({ width: halfW * 2, height: halfH * 2 }, side),
      });
    }
  };

  const handlePointerUp = () => {
    setDrag(null);
    dragOrigin.current = null;
  };

  const handleCanvasClick = (event: React.PointerEvent<SVGSVGElement>) => {
    if (drag) return;
    if (mode !== 'shape') return;
    const click = clientToSvg(event.clientX, event.clientY);
    if (!click) return;

    if (addPointMode) {
      const local = svgToLocalPoint(click, position, size);
      onChangePoints(insertMotifPointOnEdge(points, local));
      return;
    }

    setSelectedIndex(null);
  };

  const startDrag = (event: React.PointerEvent, state: DragState) => {
    event.stopPropagation();
    const pointer = clientToSvg(event.clientX, event.clientY);
    if (!pointer) return;
    dragOrigin.current = { position: { ...position }, size: { ...size }, pointer };
    setDrag(state);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const applyTemplate = (template: MotifShapeTemplateId) => {
    onChangePoints(getMotifTemplatePoints(template, side));
    setSelectedIndex(null);
  };

  const deleteSelected = () => {
    if (selectedIndex === null) return;
    onChangePoints(removeMotifPoint(points, selectedIndex));
    setSelectedIndex(null);
  };

  const corners: { id: 'nw' | 'ne' | 'sw' | 'se'; x: number; y: number }[] = [
    { id: 'nw', x: panelLeft, y: panelTop },
    { id: 'ne', x: panelLeft + size.width, y: panelTop },
    { id: 'sw', x: panelLeft, y: panelTop + size.height },
    { id: 'se', x: panelLeft + size.width, y: panelTop + size.height },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'move' as const, label: 'Move motif' },
            { id: 'resize' as const, label: 'Resize' },
            { id: 'shape' as const, label: 'Edit shape' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setMode(item.id);
              setAddPointMode(false);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              mode === item.id
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {showTemplates ? (
        <div className="flex flex-wrap gap-2">
          {MOTIF_SHAPE_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => applyTemplate(template.id)}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              {template.label}
            </button>
          ))}
        </div>
      ) : null}

      {mode === 'shape' ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAddPointMode((current) => !current)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              addPointMode
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {addPointMode ? 'Click edge to add point' : 'Add point on edge'}
          </button>
          <button
            type="button"
            onClick={deleteSelected}
            disabled={selectedIndex === null || points.length <= 3}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Remove point
          </button>
          <span className="text-xs text-neutral-500">{points.length} points</span>
        </div>
      ) : (
        <p className="text-xs text-neutral-500">
          {mode === 'move'
            ? 'Drag the orange center handle to move the motif freely on the hero.'
            : 'Drag a corner handle to resize the motif panel.'}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="h-auto w-full touch-none select-none"
          style={{ aspectRatio: '16 / 10' }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerDown={handleCanvasClick}
          role="img"
          aria-label={`${side} motif canvas editor`}
        >
          <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
          <rect x={side === 'left' ? 52 : 0} y="0" width={side === 'left' ? 48 : 52} height="100" fill="#f5f5f5" />
          <line
            x1="52"
            y1="0"
            x2="52"
            y2="100"
            stroke="#e5e5e5"
            strokeWidth="0.4"
            strokeDasharray="2 2"
          />

          <rect
            x={panelLeft}
            y={panelTop}
            width={size.width}
            height={size.height}
            fill="none"
            stroke="#171717"
            strokeWidth="0.35"
            strokeOpacity="0.25"
            strokeDasharray="1.5 1.5"
          />

          <g transform={`translate(${panelLeft}, ${panelTop})`}>
            <polygon points={localPolygon} fill={color} opacity="0.95" />
            <polygon
              points={localPolygon}
              fill="none"
              stroke="#171717"
              strokeWidth="0.45"
              strokeOpacity="0.35"
            />
          </g>

          {mode === 'shape'
            ? points.map((point, index) => {
                const absX = panelLeft + (point.x / 100) * size.width;
                const absY = panelTop + (point.y / 100) * size.height;
                const selected = selectedIndex === index;
                return (
                  <circle
                    key={`motif-vertex-${index}`}
                    cx={absX}
                    cy={absY}
                    r={selected ? 3 : 2.4}
                    fill={selected ? '#ea580c' : '#ffffff'}
                    stroke={selected ? '#c2410c' : '#171717'}
                    strokeWidth="0.65"
                    className="cursor-grab active:cursor-grabbing"
                    onPointerDown={(event) => {
                      setSelectedIndex(index);
                      startDrag(event, { kind: 'shape', index });
                    }}
                  />
                );
              })
            : null}

          {mode === 'resize'
            ? corners.map((corner) => (
                <rect
                  key={`resize-${corner.id}`}
                  x={corner.x - 1.6}
                  y={corner.y - 1.6}
                  width={3.2}
                  height={3.2}
                  rx="0.6"
                  fill="#ffffff"
                  stroke="#171717"
                  strokeWidth="0.55"
                  className="cursor-nwse-resize"
                  onPointerDown={(event) => startDrag(event, { kind: 'resize', corner: corner.id })}
                />
              ))
            : null}

          <circle
            cx={position.x}
            cy={position.y}
            r={mode === 'move' ? 3.2 : 2.8}
            fill="#ea580c"
            stroke="#ffffff"
            strokeWidth="0.85"
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={(event) => {
              setMode('move');
              startDrag(event, { kind: 'move' });
            }}
          />
        </svg>
      </div>
    </div>
  );
}
