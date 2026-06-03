import { createGlRenderer, loadMediaSource } from '@/lib/glTransitionRenderer';
import { isCutTransitionName } from '@/lib/glTransitions';

const THUMB_W = 96;
const THUMB_H = 54;
const THUMB_PROGRESS = 0.5;

let placeholderFrom: HTMLCanvasElement | null = null;
let placeholderTo: HTMLCanvasElement | null = null;

function makeGradientCanvas(c0: string, c1: string, w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let x = 0; x < w; x += 14) {
    ctx.fillRect(x, 0, 7, h);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.font = 'bold 11px system-ui,sans-serif';
  ctx.fillText('A', 10, h - 12);
  return canvas;
}

export function getPlaceholderSources(): { from: TexImageSource; to: TexImageSource } {
  if (!placeholderFrom || !placeholderTo) {
    placeholderFrom = makeGradientCanvas('#1e3a5f', '#2c5282', THUMB_W, THUMB_H);
    placeholderTo = makeGradientCanvas('#c05621', '#9b2c2c', THUMB_W, THUMB_H);
    const ctxTo = placeholderTo.getContext('2d');
    if (ctxTo) {
      ctxTo.fillStyle = 'rgba(0,0,0,0.12)';
      ctxTo.font = 'bold 11px system-ui,sans-serif';
      ctxTo.fillText('B', 10, THUMB_H - 12);
    }
  }
  return { from: placeholderFrom, to: placeholderTo };
}

function cacheKey(glName: string, fromUrl?: string, toUrl?: string): string {
  if (fromUrl && toUrl) return `${glName}|${fromUrl}|${toUrl}`;
  return `${glName}|placeholder`;
}

const dataUrlCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

let workerCanvas: HTMLCanvasElement | null = null;
let workerRenderer: ReturnType<typeof createGlRenderer> | null = null;
const queue: Array<() => void> = [];
let draining = false;

function drainQueue() {
  if (draining || queue.length === 0) return;
  draining = true;
  const job = queue.shift()!;
  job();
}

function enqueue(job: () => void) {
  queue.push(job);
  drainQueue();
}

async function resolveSources(
  fromUrl?: string,
  toUrl?: string
): Promise<{ from: TexImageSource; to: TexImageSource }> {
  if (fromUrl && toUrl) {
    const [from, to] = await Promise.all([
      loadMediaSource(fromUrl),
      loadMediaSource(toUrl),
    ]);
    return { from, to };
  }
  return getPlaceholderSources();
}

function renderToDataUrl(
  glName: string,
  from: TexImageSource,
  to: TexImageSource
): string | null {
  if (!workerCanvas) {
    workerCanvas = document.createElement('canvas');
    workerRenderer = createGlRenderer(workerCanvas);
  }
  if (!workerRenderer) return null;
  workerRenderer.draw(THUMB_PROGRESS, glName, from, to, THUMB_W, THUMB_H);
  try {
    return workerCanvas.toDataURL('image/jpeg', 0.82);
  } catch {
    return null;
  }
}

export function getCachedGlThumbnail(
  glName: string,
  fromUrl?: string,
  toUrl?: string
): string | undefined {
  return dataUrlCache.get(cacheKey(glName, fromUrl, toUrl));
}

/** Génère une miniature WebGL (file d’attente unique pour limiter les contextes). */
export function requestGlThumbnail(
  glName: string,
  fromUrl?: string,
  toUrl?: string
): Promise<string | null> {
  if (typeof document === 'undefined' || isCutTransitionName(glName)) {
    return Promise.resolve(null);
  }

  const key = cacheKey(glName, fromUrl, toUrl);
  const hit = dataUrlCache.get(key);
  if (hit) return Promise.resolve(hit);

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = new Promise<string | null>((resolve) => {
    enqueue(async () => {
      try {
        const sources = await resolveSources(fromUrl, toUrl);
        const dataUrl = renderToDataUrl(glName, sources.from, sources.to);
        if (dataUrl) dataUrlCache.set(key, dataUrl);
        resolve(dataUrl);
      } catch {
        resolve(null);
      } finally {
        inflight.delete(key);
        draining = false;
        drainQueue();
      }
    });
  });

  inflight.set(key, promise);
  return promise;
}

export const GL_THUMB_WIDTH = THUMB_W;
export const GL_THUMB_HEIGHT = THUMB_H;
