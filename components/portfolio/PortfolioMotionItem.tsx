'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  isMotionProfileActive,
  motionProfileDurationSeconds,
  motionProfileEntryOffset,
  motionProfileStaggerSeconds,
  type PortfolioGlobalMotionProfile,
} from '@/components/portfolio/portfolio-motion-settings';

function isElementInView(el: HTMLElement, root: Element | null): boolean {
  const rect = el.getBoundingClientRect();
  if (root && root instanceof HTMLElement) {
    const rootRect = root.getBoundingClientRect();
    return rect.top < rootRect.bottom && rect.bottom > rootRect.top;
  }
  return rect.top < window.innerHeight && rect.bottom > 0;
}

/** Nearest scrollable ancestor (pages mode uses nested overflow-y-auto). */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

export function PortfolioMotionItem({
  profile,
  index = 0,
  className = '',
  revealKey,
  children,
}: {
  profile: PortfolioGlobalMotionProfile;
  index?: number;
  className?: string;
  /** Change this (e.g. active page id) to re-run the entry animation. */
  revealKey?: string | number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const active = isMotionProfileActive(profile) && prefersReducedMotion !== true;
  const [visible, setVisible] = useState(!active);
  const hoverEnabled = profile === 'dynamic' && active;

  useEffect(() => {
    if (!active) {
      setVisible(true);
      return;
    }

    setVisible(false);
    const el = ref.current;
    if (!el) return;

    let revealed = false;
    let observer: IntersectionObserver | null = null;
    let scrollRoot: HTMLElement | null = null;
    let raf = 0;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setVisible(true);
      observer?.disconnect();
      observer = null;
      if (scrollRoot) {
        scrollRoot.removeEventListener('scroll', onScroll);
      } else {
        window.removeEventListener('scroll', onScroll);
      }
      window.removeEventListener('resize', onScroll);
    };

    const onScroll = () => {
      if (isElementInView(el, scrollRoot)) reveal();
    };

    raf = requestAnimationFrame(() => {
      scrollRoot = getScrollParent(el);

      if (isElementInView(el, scrollRoot)) {
        reveal();
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) reveal();
        },
        {
          root: scrollRoot,
          threshold: 0.08,
          rootMargin: '0px 0px -4% 0px',
        }
      );
      observer.observe(el);

      if (scrollRoot) {
        scrollRoot.addEventListener('scroll', onScroll, { passive: true });
      } else {
        window.addEventListener('scroll', onScroll, { passive: true });
      }
      window.addEventListener('resize', onScroll, { passive: true });
    });

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      if (scrollRoot) {
        scrollRoot.removeEventListener('scroll', onScroll);
      } else {
        window.removeEventListener('scroll', onScroll);
      }
      window.removeEventListener('resize', onScroll);
    };
  }, [active, revealKey, index, profile]);

  if (!active) {
    return <div className={`h-full min-h-0 ${className}`.trim()}>{children}</div>;
  }

  const y = motionProfileEntryOffset(profile);

  return (
    <div ref={ref} className={`h-full min-h-0 ${className}`.trim()}>
      <motion.div
        initial={{ y, opacity: 0 }}
        animate={visible ? { y: 0, opacity: 1 } : { y, opacity: 0 }}
        whileHover={hoverEnabled ? { y: -4 } : undefined}
        transition={{
          duration: motionProfileDurationSeconds(profile),
          delay: visible ? motionProfileStaggerSeconds(profile, index) : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={
          hoverEnabled
            ? 'h-full min-h-0 w-full min-w-0 rounded-[inherit] will-change-transform hover:shadow-[0_18px_40px_-24px_rgba(249,115,22,0.35)]'
            : 'h-full min-h-0 w-full min-w-0 will-change-transform'
        }
        style={{ pointerEvents: visible ? undefined : 'none' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
