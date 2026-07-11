/** Éléments audio de la timeline — pause immédiate pendant l’aperçu panneau. */
const engineClips = new Map<string, HTMLAudioElement>();

export function registerTimelineAudio(clipId: string, el: HTMLAudioElement): void {
  engineClips.set(clipId, el);
}

export function unregisterTimelineAudio(clipId: string): void {
  engineClips.delete(clipId);
}

export function pauseTimelineAudioForClip(clipId: string): void {
  engineClips.get(clipId)?.pause();
}

export function pauseAllTimelineAudio(): void {
  engineClips.forEach((el) => el.pause());
}
