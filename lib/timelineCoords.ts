import { LABEL_COL_WIDTH } from '@/lib/timelineTheme';

/** Convertit une position souris (clientX) en temps (s) sur la zone clips de la timeline. */
export function clientXToTimelineTime(
  clientX: number,
  pps: number,
  scrollLeft = 0
): number {
  const scroll = document.querySelector('[data-timeline-scroll]');
  if (!scroll || pps <= 0) return 0;
  const rect = scroll.getBoundingClientRect();
  const xInTracks = clientX - rect.left - LABEL_COL_WIDTH + scrollLeft;
  return Math.max(0, xInTracks / pps);
}
