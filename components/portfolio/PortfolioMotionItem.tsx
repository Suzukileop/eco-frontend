'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  isMotionProfileActive,
  motionProfileDurationSeconds,
  motionProfileEntryOffset,
  motionProfileItemHoverClass,
  motionProfileStaggerSeconds,
  type PortfolioGlobalMotionProfile,
} from '@/components/portfolio/portfolio-motion-settings';

function isElementInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

export function PortfolioMotionItem({
  profile,
  index = 0,
  className = '',
  children,
}: {
  profile: PortfolioGlobalMotionProfile;
  index?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(!isMotionProfileActive(profile) || prefersReducedMotion === true);
  const active = isMotionProfileActive(profile) && !prefersReducedMotion;
  const hoverClass = motionProfileItemHoverClass(profile);

  useEffect(() => {
    if (!active) return;

    const el = ref.current;
    if (!el) return;

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setVisible(true);
    };

    if (isElementInViewport(el)) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) reveal();
      },
      { threshold: 0.01, rootMargin: '0px 0px 10% 0px' }
    );
    observer.observe(el);

    const onScroll = () => {
      if (isElementInViewport(el)) reveal();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    requestAnimationFrame(onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [active]);

  if (!active) {
    return <div className={className}>{children}</div>;
  }

  const y = motionProfileEntryOffset(profile);

  return (
    <div ref={ref} className={className}>
      <motion.div
        className={hoverClass}
        initial={{ y, opacity: 1 }}
        animate={visible ? { y: 0, opacity: 1 } : { y, opacity: 1 }}
        transition={{
          duration: motionProfileDurationSeconds(profile),
          delay: visible ? motionProfileStaggerSeconds(profile, index) : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
