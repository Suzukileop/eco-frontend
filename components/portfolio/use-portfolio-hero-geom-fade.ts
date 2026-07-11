'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/** Fades the black geom motif as the hero scrolls toward the portfolio section. */
export function usePortfolioHeroGeomFade(enabled: boolean): {
  sectionRef: RefObject<HTMLElement>;
  opacity: number;
} {
  const sectionRef = useRef<HTMLElement>(null);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!enabled) {
      setOpacity(1);
      return;
    }

    let raf = 0;

    const update = () => {
      const el = sectionRef.current;
      if (!el) return;

      const fadeEnd = Math.max(el.offsetHeight * 0.5, window.innerHeight * 0.4);
      const scrolled = Math.max(0, -el.getBoundingClientRect().top);
      const progress = Math.min(1, scrolled / fadeEnd);
      setOpacity(1 - progress);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [enabled]);

  return { sectionRef, opacity };
}
