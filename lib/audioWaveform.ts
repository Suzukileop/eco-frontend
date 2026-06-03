/** Analyse audio pour forme d’onde timeline (cache + décodage Web Audio). */

const FULL_PEAKS = 512;
const MAX_CACHE_ENTRIES = 48;

type FullWaveform = { peaks: number[]; duration: number };

const fullCache = new Map<string, FullWaveform>();
const inflight = new Map<string, Promise<FullWaveform>>();

let decodeChain: Promise<void> = Promise.resolve();

function queueDecode<T>(fn: () => Promise<T>): Promise<T> {
  const run = decodeChain.then(fn);
  decodeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function trimCache() {
  if (fullCache.size <= MAX_CACHE_ENTRIES) return;
  const drop = fullCache.size - MAX_CACHE_ENTRIES;
  const keys = Array.from(fullCache.keys()).slice(0, drop);
  for (const k of keys) fullCache.delete(k);
}

function resamplePeaks(peaks: number[], target: number): number[] {
  if (target <= 0) return [];
  if (peaks.length === 0) return Array.from({ length: target }, () => 0.08);
  if (peaks.length === target) return peaks;
  const out: number[] = [];
  for (let i = 0; i < target; i++) {
    const t0 = Math.floor((i / target) * peaks.length);
    const t1 = Math.max(t0 + 1, Math.floor(((i + 1) / target) * peaks.length));
    let max = 0;
    for (let j = t0; j < t1; j++) max = Math.max(max, peaks[j] ?? 0);
    out.push(max);
  }
  const peak = Math.max(...out, 0.001);
  return out.map((v) => v / peak);
}

async function decodeUrlToFullWaveform(url: string): Promise<FullWaveform> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`waveform fetch ${res.status}`);
  const buf = await res.arrayBuffer();

  const ctx = new AudioContext();
  try {
    const audioBuffer = await ctx.decodeAudioData(buf.slice(0));
    const duration = audioBuffer.duration;
    const data = audioBuffer.getChannelData(0);
    const second = data.length > 1 ? audioBuffer.getChannelData(1) : null;
    const block = Math.max(1, Math.floor(data.length / FULL_PEAKS));
    const peaks: number[] = [];

    for (let i = 0; i < FULL_PEAKS; i++) {
      const start = i * block;
      const end = Math.min(start + block, data.length);
      let max = 0;
      for (let j = start; j < end; j++) {
        const a = Math.abs(data[j]);
        const b = second ? Math.abs(second[j]) : 0;
        max = Math.max(max, a, b);
      }
      peaks.push(max);
    }

    const top = Math.max(...peaks, 0.001);
    return { peaks: peaks.map((p) => p / top), duration };
  } finally {
    await ctx.close().catch(() => undefined);
  }
}

async function getFullWaveform(url: string): Promise<FullWaveform> {
  const hit = fullCache.get(url);
  if (hit) return hit;

  let pending = inflight.get(url);
  if (!pending) {
    pending = queueDecode(() => decodeUrlToFullWaveform(url));
    inflight.set(url, pending);
  }

  try {
    const result = await pending;
    fullCache.set(url, result);
    trimCache();
    return result;
  } finally {
    inflight.delete(url);
  }
}

/**
 * Pics normalisés (0–1) pour la fenêtre visible du clip sur la timeline.
 */
export async function getWaveformPeaksForWindow(
  url: string,
  barCount: number,
  trimStart: number,
  visibleDuration: number
): Promise<number[]> {
  const { peaks, duration } = await getFullWaveform(url);
  if (duration <= 0 || barCount < 1) return Array.from({ length: barCount }, () => 0.1);

  const startSec = Math.max(0, trimStart);
  const endSec = Math.min(duration, startSec + Math.max(0.05, visibleDuration));
  const startIdx = Math.floor((startSec / duration) * peaks.length);
  const endIdx = Math.max(startIdx + 1, Math.ceil((endSec / duration) * peaks.length));
  return resamplePeaks(peaks.slice(startIdx, endIdx), barCount);
}

/** Placeholder déterministe si l’analyse échoue. */
export function pseudoWaveformPeaks(clipId: string, barCount: number): number[] {
  let h = 0;
  for (let i = 0; i < clipId.length; i++) h = ((h << 5) - h + clipId.charCodeAt(i)) | 0;
  const seed = Math.abs(h);
  const out: number[] = [];
  for (let i = 0; i < barCount; i++) {
    const v =
      Math.abs(Math.sin(seed * 0.13 + i * 0.7)) * 0.65 +
      Math.abs(Math.cos(seed * 0.27 + i * 1.3)) * 0.35;
    out.push(v);
  }
  const top = Math.max(...out, 0.001);
  return out.map((x) => x / top);
}
