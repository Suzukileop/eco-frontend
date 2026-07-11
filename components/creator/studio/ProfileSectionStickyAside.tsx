'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

const STICKY_OFFSET_PX = 12;
const STATIC_EPSILON_PX = 1;
const SCROLL_END_MS = 120;

function getStickyTop(): number {
  const header = document.querySelector('[data-dashboard-main] > header');
  if (header instanceof HTMLElement) {
    return header.getBoundingClientRect().height + STICKY_OFFSET_PX;
  }
  return 80;
}

function resetAsideStyles(aside: HTMLElement) {
  aside.style.position = '';
  aside.style.top = '';
  aside.style.left = '';
  aside.style.right = '';
  aside.style.width = '';
  aside.style.bottom = '';
  aside.style.zIndex = '';
  aside.style.maxHeight = '';
  aside.style.overflowY = '';
}

type ProfileSectionStickyAsideProps = {
  children: ReactNode;
  className?: string;
};

export function ProfileSectionStickyAside({ children, className = '' }: ProfileSectionStickyAsideProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const pinModeRef = useRef<'static' | 'fixed' | 'bottom'>('static');
  const scrollActiveRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const scrollEndTimerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const column = columnRef.current;
    const aside = asideRef.current;
    if (!column || !aside) return;

    const update = () => {
      const columnRect = column.getBoundingClientRect();
      const asideHeight = aside.offsetHeight;
      const stickyTop = getStickyTop();

      if (columnRect.top > stickyTop + STATIC_EPSILON_PX) {
        if (pinModeRef.current !== 'static') {
          resetAsideStyles(aside);
          pinModeRef.current = 'static';
        }
        return;
      }

      if (columnRect.bottom <= stickyTop + asideHeight) {
        if (pinModeRef.current !== 'bottom') {
          resetAsideStyles(aside);
          aside.style.position = 'absolute';
          aside.style.bottom = '0';
          aside.style.left = '0';
          aside.style.right = '0';
          aside.style.zIndex = '10';
          pinModeRef.current = 'bottom';
        }
        return;
      }

      aside.style.position = 'fixed';
      aside.style.top = `${stickyTop}px`;
      aside.style.left = `${columnRect.left}px`;
      aside.style.width = `${columnRect.width}px`;
      aside.style.right = '';
      aside.style.bottom = '';
      aside.style.zIndex = '30';
      aside.style.maxHeight = `calc(100vh - ${stickyTop}px - ${STICKY_OFFSET_PX}px)`;
      aside.style.overflowY = 'auto';
      pinModeRef.current = 'fixed';
    };

    const tick = () => {
      update();
      if (scrollActiveRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const stopScrollLoop = () => {
      scrollActiveRef.current = false;
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      update();
    };

    const onScroll = () => {
      update();

      if (!scrollActiveRef.current) {
        scrollActiveRef.current = true;
        rafRef.current = requestAnimationFrame(tick);
      }

      if (scrollEndTimerRef.current != null) {
        window.clearTimeout(scrollEndTimerRef.current);
      }
      scrollEndTimerRef.current = window.setTimeout(stopScrollLoop, SCROLL_END_MS);
    };

    update();

    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.addEventListener('wheel', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll, { passive: true });

    const ro = new ResizeObserver(onScroll);
    ro.observe(column);
    ro.observe(aside);

    const header = document.querySelector('[data-dashboard-main] > header');
    const headerRo = header instanceof HTMLElement ? new ResizeObserver(onScroll) : null;
    headerRo?.observe(header!);

    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      document.removeEventListener('wheel', onScroll, { capture: true });
      window.removeEventListener('resize', onScroll);
      ro.disconnect();
      headerRo?.disconnect();
      if (scrollEndTimerRef.current != null) {
        window.clearTimeout(scrollEndTimerRef.current);
      }
      stopScrollLoop();
      resetAsideStyles(aside);
      pinModeRef.current = 'static';
    };
  }, [children]);

  return (
    <div
      ref={columnRef}
      className={`relative hidden w-60 shrink-0 md:col-start-2 md:row-start-1 md:block md:self-stretch ${className}`}
    >
      <aside
        ref={asideRef}
        className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        {children}
      </aside>
    </div>
  );
}
