'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NO_TEXT_CLASS } from '@/components/landing/landingEntranceNo';
import { landingRoboto } from '@/components/landing/landingFont';
import { toEntranceRect, type EntranceAnchorRects } from '@/components/landing/landingEntranceTypes';

const MIN_LOAD_MS = 5000;
const TRACK_COLOR = '#e5e5e5';
const FILL_COLOR = '#F97316';
const BAR_FADE_MS = 320;

function setBarProgress(el: HTMLDivElement, progress: number) {
  const p = Math.min(100, Math.max(0, progress));
  el.style.background = `linear-gradient(to right, ${FILL_COLOR} 0%, ${FILL_COLOR} ${p}%, ${TRACK_COLOR} ${p}%, ${TRACK_COLOR} 100%)`;
}

type LandingPreloaderProps = {
  onBarComplete: (rects: EntranceAnchorRects) => void;
};

export function LandingPreloader({ onBarComplete }: LandingPreloaderProps) {
  const [activeWord, setActiveWord] = useState<'Idea' | 'Problem'>('Idea');
  const [barVisible, setBarVisible] = useState(true);
  const [blockWidth, setBlockWidth] = useState<number | null>(null);

  const measureRef = useRef<HTMLSpanElement>(null);
  const noRef = useRef<HTMLSpanElement>(null);
  const problemeRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const wordSwitchedRef = useRef(false);
  const pageReadyRef = useRef(false);
  const progressRef = useRef(0);
  const completedRef = useRef(false);

  const measureBlock = () => {
    if (!measureRef.current) return;
    const w = measureRef.current.getBoundingClientRect().width;
    setBlockWidth(Math.round(w));
  };

  useLayoutEffect(() => {
    measureBlock();
    void document.fonts?.ready?.then(measureBlock);
  }, []);

  useEffect(() => {
    pageReadyRef.current = document.readyState === 'complete';
    if (!pageReadyRef.current) {
      const onLoad = () => {
        pageReadyRef.current = true;
      };
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  const triggerComplete = useCallback(() => {
    if (completedRef.current) return;
    if (!noRef.current || !problemeRef.current) return;
    completedRef.current = true;

    const rects = {
      no: toEntranceRect(noRef.current.getBoundingClientRect()),
      probleme: toEntranceRect(problemeRef.current.getBoundingClientRect()),
    };

    setBarVisible(false);
    window.setTimeout(() => onBarComplete(rects), BAR_FADE_MS);
  }, [onBarComplete]);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;

    const tryComplete = () => {
      if (progressRef.current >= 100 && pageReadyRef.current) {
        triggerComplete();
      }
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      const linear = Math.min(1, elapsed / MIN_LOAD_MS);
      const eased = 1 - (1 - linear) ** 2;
      const progress = eased * 100;
      progressRef.current = progress;

      if (barRef.current) {
        setBarProgress(barRef.current, progress);
      }

      if (progress >= 50 && !wordSwitchedRef.current) {
        wordSwitchedRef.current = true;
        setActiveWord('Problem');
      }

      if (linear >= 1) {
        tryComplete();
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    if (barRef.current) {
      setBarProgress(barRef.current, 0);
    }

    frame = requestAnimationFrame(tick);

    const onLoad = () => {
      pageReadyRef.current = true;
      tryComplete();
    };
    if (!pageReadyRef.current) {
      window.addEventListener('load', onLoad);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('load', onLoad);
    };
  }, [triggerComplete]);

  const widthStyle =
    blockWidth != null
      ? { width: blockWidth, minWidth: blockWidth, maxWidth: blockWidth }
      : undefined;

  return (
    <div
      className={`${landingRoboto.className} fixed inset-0 z-[200] bg-white`}
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute whitespace-nowrap leading-none"
      >
        <span className={NO_TEXT_CLASS}>NO</span>
        <span className="ml-3 inline-block font-medium capitalize text-[1.6rem] sm:text-[1.9rem]">Problem</span>
      </span>

      <div
        className="absolute left-1/2 top-1/2 flex flex-col gap-10"
        style={{
          ...widthStyle,
          transform: 'translate3d(-50%, -50%, 0)',
        }}
      >
        <p className="m-0 flex items-baseline whitespace-nowrap leading-none">
          <span ref={noRef} className={NO_TEXT_CLASS}>
            NO
          </span>
          <span className="relative ml-3 inline-block align-baseline">
            <span className="invisible font-medium capitalize text-[1.6rem] sm:text-[1.9rem]" aria-hidden="true">
              Problem
            </span>
            <span className="absolute left-0 top-0">
              <span
                ref={problemeRef}
                className="inline-block font-medium capitalize text-[#F97316] text-[1.6rem] sm:text-[1.9rem]"
              >
                {activeWord}
              </span>
            </span>
          </span>
        </p>

        <motion.div
          ref={barRef}
          animate={{ opacity: barVisible ? 1 : 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="h-3 w-full shrink-0 rounded-full"
          style={{ background: `linear-gradient(to right, ${FILL_COLOR} 0%, ${TRACK_COLOR} 0%)` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={100}
        />
      </div>
    </div>
  );
}
