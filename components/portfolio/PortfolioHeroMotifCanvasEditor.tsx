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

export type MotifCanvasPreviewLayout = 'desktop' | 'mobile';

type PortfolioHeroMotifCanvasEditorProps = {
  side: MotifEditorSide;
  points: MotifPoint[];
  color: string;
  position: MotifPanelPosition;
  size: MotifPanelSize;
  onChangePoints: (points: MotifPoint[]) => void;
  onChangeTransform: (patch: { position?: MotifPanelPosition; size?: MotifPanelSize }) => void;
  showTemplates?: boolean;
  /** Wireframe content mockup under the motif for surgical placement. */
  showLayoutMockup?: boolean;
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

/** Approximate editorial gutters (medium @ xl) as % of the hero frame. */
const DESKTOP_GUTTER = 12;
const MOBILE_GUTTER = 6;

function MotifCanvasLayoutMockup({ layout }: { layout: MotifCanvasPreviewLayout }) {
  if (layout === 'mobile') {
    const x = MOBILE_GUTTER;
    const w = 100 - MOBILE_GUTTER * 2;
    return (
      <g aria-hidden pointerEvents="none">
        <rect x="0" y="0" width="100" height="100" fill="#fafafa" />
        <rect
          x={x}
          y="0"
          width={w}
          height="100"
          fill="#f3f3f3"
          stroke="#d4d4d4"
          strokeWidth="0.35"
          strokeDasharray="1.2 1.2"
        />
        <rect x={x + 2} y="14" width={w * 0.72} height="4.2" rx="0.6" fill="#d4d4d4" />
        <rect x={x + 2} y="20" width={w * 0.55} height="3.2" rx="0.5" fill="#e5e5e5" />
        <rect x={x + 2} y="28" width={w * 0.88} height="1.6" rx="0.4" fill="#e5e5e5" />
        <rect x={x + 2} y="31" width={w * 0.78} height="1.6" rx="0.4" fill="#ebebeb" />
        <rect x={x + 2} y="34" width={w * 0.62} height="1.6" rx="0.4" fill="#ebebeb" />
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={`tool-${i}`}
            cx={x + 5 + i * 7}
            cy="42"
            r="2.2"
            fill="#e5e5e5"
            stroke="#d4d4d4"
            strokeWidth="0.3"
          />
        ))}
        <rect x={x + 2} y="48" width="22" height="5" rx="2.5" fill="#d4d4d4" />
        <rect
          x={x + w * 0.18}
          y="58"
          width={w * 0.64}
          height="22"
          rx="1.2"
          fill="#e8e8e8"
          stroke="#d4d4d4"
          strokeWidth="0.35"
        />
        <text
          x={x + w * 0.5}
          y="70"
          textAnchor="middle"
          fontSize="2.4"
          fill="#a3a3a3"
          fontFamily="system-ui,sans-serif"
        >
          Portrait
        </text>
        {[0, 1, 2].map((i) => (
          <rect
            key={`stat-${i}`}
            x={x + 2 + i * (w / 3.2)}
            y="84"
            width={w / 3.6}
            height="7"
            rx="1"
            fill="#ececec"
            stroke="#d4d4d4"
            strokeWidth="0.3"
          />
        ))}
        <text
          x="50"
          y="97.5"
          textAnchor="middle"
          fontSize="2.1"
          fill="#a3a3a3"
          fontFamily="system-ui,sans-serif"
        >
          ↓ sections below
        </text>
      </g>
    );
  }

  const g = DESKTOP_GUTTER;
  const contentW = 100 - g * 2;
  const copyW = contentW * 0.42;
  const portraitX = g + contentW * 0.55;
  const portraitW = contentW * 0.32;

  return (
    <g aria-hidden pointerEvents="none">
      <rect x="0" y="0" width="100" height="100" fill="#fafafa" />
      <rect x="0" y="0" width={g} height="100" fill="#f0f0f0" />
      <rect x={100 - g} y="0" width={g} height="100" fill="#f0f0f0" />
      <rect
        x={g}
        y="0"
        width={contentW}
        height="100"
        fill="#f5f5f5"
        stroke="#d4d4d4"
        strokeWidth="0.4"
        strokeDasharray="1.4 1.2"
      />
      <line x1={g} y1="0" x2={g} y2="100" stroke="#a3a3a3" strokeWidth="0.35" strokeOpacity="0.7" />
      <line
        x1={100 - g}
        y1="0"
        x2={100 - g}
        y2="100"
        stroke="#a3a3a3"
        strokeWidth="0.35"
        strokeOpacity="0.7"
      />
      <text x={g + 2} y="14" fontSize="2.2" fill="#a3a3a3" fontFamily="system-ui,sans-serif">
        Copy
      </text>
      <rect x={g + 2} y="18" width={copyW * 0.92} height="5" rx="0.7" fill="#d4d4d4" />
      <rect x={g + 2} y="25" width={copyW * 0.7} height="3.8" rx="0.6" fill="#e0e0e0" />
      <rect x={g + 2} y="34" width={copyW * 0.95} height="1.5" rx="0.35" fill="#e5e5e5" />
      <rect x={g + 2} y="37" width={copyW * 0.88} height="1.5" rx="0.35" fill="#ebebeb" />
      <rect x={g + 2} y="40" width={copyW * 0.72} height="1.5" rx="0.35" fill="#ebebeb" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={`d-tool-${i}`}
          cx={g + 5 + i * 6.5}
          cy="48"
          r="2"
          fill="#e5e5e5"
          stroke="#d4d4d4"
          strokeWidth="0.3"
        />
      ))}
      <rect x={g + 2} y="54" width="20" height="5" rx="2.5" fill="#d4d4d4" />
      <rect
        x={portraitX}
        y="22"
        width={portraitW}
        height="42"
        rx="1.4"
        fill="#e8e8e8"
        stroke="#d4d4d4"
        strokeWidth="0.4"
      />
      <text
        x={portraitX + portraitW / 2}
        y="44"
        textAnchor="middle"
        fontSize="2.4"
        fill="#a3a3a3"
        fontFamily="system-ui,sans-serif"
      >
        Portrait
      </text>
      {[0, 1, 2].map((i) => (
        <rect
          key={`d-stat-${i}`}
          x={portraitX - 4 + i * 12}
          y="78"
          width="10"
          height="9"
          rx="1"
          fill="#ececec"
          stroke="#d4d4d4"
          strokeWidth="0.3"
        />
      ))}
      <text
        x={portraitX + 12}
        y="94"
        textAnchor="middle"
        fontSize="2.1"
        fill="#a3a3a3"
        fontFamily="system-ui,sans-serif"
      >
        Stats
      </text>
      <text x="50" y="98.5" textAnchor="middle" fontSize="2" fill="#a3a3a3" fontFamily="system-ui,sans-serif">
        ↓ next sections
      </text>
    </g>
  );
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
  showLayoutMockup = true,
}: PortfolioHeroMotifCanvasEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<MotifEditorMode>('move');
  const [drag, setDrag] = useState<DragState | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [addPointMode, setAddPointMode] = useState(false);
  const [previewLayout, setPreviewLayout] = useState<MotifCanvasPreviewLayout>('desktop');
  const [mockupEnabled, setMockupEnabled] = useState(showLayoutMockup);
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

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMockupEnabled((current) => !current)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            mockupEnabled
              ? 'bg-neutral-900 text-white'
              : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          Layout mockup
        </button>
        {mockupEnabled ? (
          <>
            <button
              type="button"
              onClick={() => setPreviewLayout('desktop')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                previewLayout === 'desktop'
                  ? 'bg-orange-600 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewLayout('mobile')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                previewLayout === 'mobile'
                  ? 'bg-orange-600 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Mobile
            </button>
          </>
        ) : null}
      </div>

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
            ? mockupEnabled
              ? 'Wireframe shows copy, portrait, and stats — align the motif against these guides.'
              : 'Drag the orange center handle to move the motif freely on the hero.'
            : 'Drag a corner handle to resize the motif panel.'}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="h-auto w-full touch-none select-none"
          style={{ aspectRatio: previewLayout === 'mobile' ? '9 / 14' : '16 / 10' }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerDown={handleCanvasClick}
          role="img"
          aria-label={`${side} motif canvas editor`}
        >
          {mockupEnabled ? (
            <MotifCanvasLayoutMockup layout={previewLayout} />
          ) : (
            <>
              <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
              <rect
                x={side === 'left' ? 52 : 0}
                y="0"
                width={side === 'left' ? 48 : 52}
                height="100"
                fill="#f5f5f5"
              />
              <line
                x1="52"
                y1="0"
                x2="52"
                y2="100"
                stroke="#e5e5e5"
                strokeWidth="0.4"
                strokeDasharray="2 2"
              />
            </>
          )}

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
            <polygon points={localPolygon} fill={color} opacity="0.88" />
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
