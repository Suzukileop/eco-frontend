import type { Clip } from '@/types/composition';
import type { TransitionWindow } from '@/lib/transitionApply';
import { clipLocalTimeAtTransition } from '@/lib/transitionApply';
import { loadMediaSource } from '@/lib/glTransitionRenderer';
import { getPlaceholderSources } from '@/lib/glTransitionThumbnails';

/** Charge depuis des URLs brutes (miniatures bibliothèque). */
export async function loadGlSourcesFromUrls(
  fromUrl?: string,
  toUrl?: string
): Promise<{ from: TexImageSource; to: TexImageSource }> {
  if (!fromUrl || !toUrl) return getPlaceholderSources();
  try {
    const [from, to] = await Promise.all([
      loadMediaSource(fromUrl),
      loadMediaSource(toUrl),
    ]);
    return { from, to };
  } catch {
    return getPlaceholderSources();
  }
}

/** URL préférée : vidéo → flux réel ; image → url ou miniature. */
export function resolveClipMediaUrl(clip: Clip): string | undefined {
  if (clip.type === 'video' && clip.url) return clip.url;
  return clip.url ?? clip.thumbnail;
}

function isVideoClip(clip: Clip, url: string): boolean {
  return clip.type === 'video' && /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

async function loadVideoElement(url: string): Promise<HTMLVideoElement> {
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error('video load failed'));
    video.src = url;
  });
  return video;
}

async function seekVideo(video: HTMLVideoElement, timeSec: number): Promise<void> {
  const t = Math.max(0, timeSec);
  if (Math.abs(video.currentTime - t) < 0.008) return;
  video.pause();
  await new Promise<void>((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    video.onseeked = done;
    try {
      video.currentTime = t;
    } catch {
      done();
      return;
    }
    if ('requestVideoFrameCallback' in video) {
      video.requestVideoFrameCallback(() => done());
    }
    window.setTimeout(done, 64);
  });
}

/** Paire vidéo réutilisable — seek à chaque frame de transition. */
export class TransitionVideoPair {
  private fromVideo: HTMLVideoElement | null = null;
  private toVideo: HTMLVideoElement | null = null;
  private fromIsVideo = false;
  private toIsVideo = false;
  private fromImage: TexImageSource | null = null;
  private toImage: TexImageSource | null = null;

  async load(fromClip: Clip, toClip: Clip): Promise<void> {
    await this.dispose();
    const fromUrl = resolveClipMediaUrl(fromClip);
    const toUrl = resolveClipMediaUrl(toClip);
    if (!fromUrl || !toUrl) throw new Error('missing media url');

    if (isVideoClip(fromClip, fromUrl)) {
      this.fromIsVideo = true;
      this.fromVideo = await loadVideoElement(fromUrl);
    } else {
      this.fromImage = await loadMediaSource(fromUrl);
    }

    if (isVideoClip(toClip, toUrl)) {
      this.toIsVideo = true;
      this.toVideo = await loadVideoElement(toUrl);
    } else {
      this.toImage = await loadMediaSource(toUrl);
    }
  }

  async seekToTime(
    fromClip: Clip,
    toClip: Clip,
    window: TransitionWindow,
    currentTime: number
  ): Promise<{ from: TexImageSource; to: TexImageSource }> {
    const fromLocal = clipLocalTimeAtTransition(fromClip, 'from', window, currentTime);
    const toLocal = clipLocalTimeAtTransition(toClip, 'to', window, currentTime);

    const seeks: Promise<void>[] = [];
    if (this.fromIsVideo && this.fromVideo) {
      seeks.push(seekVideo(this.fromVideo, fromLocal));
    }
    if (this.toIsVideo && this.toVideo) {
      seeks.push(seekVideo(this.toVideo, toLocal));
    }
    if (seeks.length > 0) await Promise.all(seeks);

    return {
      from: (this.fromIsVideo ? this.fromVideo : this.fromImage) as TexImageSource,
      to: (this.toIsVideo ? this.toVideo : this.toImage) as TexImageSource,
    };
  }

  /** Pré-positionne les vidéos au début de la fenêtre CapCut (évite le blink à l'entrée). */
  async warmAtTransitionStart(
    fromClip: Clip,
    toClip: Clip,
    window: TransitionWindow
  ): Promise<void> {
    await this.seekToTime(fromClip, toClip, window, window.startTime);
  }

  async dispose(): Promise<void> {
    this.fromVideo = null;
    this.toVideo = null;
    this.fromImage = null;
    this.toImage = null;
    this.fromIsVideo = false;
    this.toIsVideo = false;
  }
}

const pairCache = new Map<string, TransitionVideoPair>();
const warmedAtKey = new Set<string>();

function transitionPairKey(fromId: string, toId: string): string {
  return `${fromId}:${toId}`;
}

function warmKey(fromId: string, toId: string, startTime: number): string {
  return `${fromId}:${toId}:${startTime.toFixed(4)}`;
}

/** Paire vidéo partagée — évite un rechargement lourd à l'approche du raccord. */
export async function acquireTransitionVideoPair(
  fromClip: Clip,
  toClip: Clip
): Promise<TransitionVideoPair> {
  const key = transitionPairKey(fromClip.id, toClip.id);
  let pair = pairCache.get(key);
  if (!pair) {
    pair = new TransitionVideoPair();
    await pair.load(fromClip, toClip);
    pairCache.set(key, pair);
  }
  return pair;
}

export function isTransitionPairWarmed(
  fromId: string,
  toId: string,
  startTime: number
): boolean {
  return warmedAtKey.has(warmKey(fromId, toId, startTime));
}

/** Charge + positionne au début CapCut (idempotent). */
export async function warmTransitionVideoPair(
  fromClip: Clip,
  toClip: Clip,
  window: TransitionWindow
): Promise<TransitionVideoPair> {
  const wKey = warmKey(fromClip.id, toClip.id, window.startTime);
  const pair = await acquireTransitionVideoPair(fromClip, toClip);
  if (!warmedAtKey.has(wKey)) {
    await pair.warmAtTransitionStart(fromClip, toClip, window);
    warmedAtKey.add(wKey);
  }
  return pair;
}

export function releaseTransitionVideoPairCache(fromId?: string, toId?: string): void {
  if (fromId && toId) {
    pairCache.delete(transitionPairKey(fromId, toId));
    return;
  }
  pairCache.clear();
  warmedAtKey.clear();
}

/** Sources GL à un instant t (CapCut : M1 fin + M2 début). */
export async function loadJunctionGlSourcesAtTime(
  fromClip: Clip,
  toClip: Clip,
  window: TransitionWindow,
  currentTime: number,
  videoPair?: TransitionVideoPair
): Promise<{ from: TexImageSource; to: TexImageSource }> {
  const fromUrl = resolveClipMediaUrl(fromClip);
  const toUrl = resolveClipMediaUrl(toClip);
  if (!fromUrl || !toUrl) return getPlaceholderSources();

  try {
    if (videoPair) {
      return videoPair.seekToTime(fromClip, toClip, window, currentTime);
    }

    const fromLocal = clipLocalTimeAtTransition(fromClip, 'from', window, currentTime);
    const toLocal = clipLocalTimeAtTransition(toClip, 'to', window, currentTime);

    const [from, to] = await Promise.all([
      loadClipSourceAtLocalTime(fromClip, fromUrl, fromLocal),
      loadClipSourceAtLocalTime(toClip, toUrl, toLocal),
    ]);
    return { from, to };
  } catch {
    return getPlaceholderSources();
  }
}

/** @deprecated Préférer loadJunctionGlSourcesAtTime — poster fixe au raccord. */
export async function loadJunctionGlSources(
  fromClip: Clip,
  toClip: Clip
): Promise<{ from: TexImageSource; to: TexImageSource }> {
  const junction = (fromClip.endTime + toClip.startTime) / 2;
  const window: TransitionWindow = {
    junction,
    duration: 0.5,
    startTime: junction - 0.25,
    endTime: junction + 0.25,
  };
  return loadJunctionGlSourcesAtTime(fromClip, toClip, window, junction);
}

async function loadClipSourceAtLocalTime(
  clip: Clip,
  url: string,
  localTimeSec: number
): Promise<TexImageSource> {
  if (!isVideoClip(clip, url)) {
    return loadMediaSource(url);
  }
  const video = await loadVideoElement(url);
  await seekVideo(video, localTimeSec);
  return video;
}
