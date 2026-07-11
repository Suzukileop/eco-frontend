'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLandingEntrance } from '@/components/landing/LandingEntranceContext';
import {
  HERO_PROBLEME_CLASS,
  IDEA_SLOT_CLASS,
  NO_CIRCLE_CLASS,
  NO_HANDOFF_DURATION,
  NO_TEXT_CLASS,
} from '@/components/landing/landingEntranceNo';
import { toEntranceRect } from '@/components/landing/landingEntranceTypes';

import {
  BRAND_ORANGE,
  brandGradientBg,
  brandShadow,
} from '@/components/landing/landingBrand';
const WORD_INTERVAL_MS = 2500;
const WORDS = ['IDEA?', 'PROBLEM'] as const;

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

const avatars = [
  { init: 'MD', bg: '#d4d4d4' },
  { init: 'RJ', bg: '#a3a3a3' },
  { init: 'FM', bg: '#737373' },
  { init: 'TA', bg: '#525252' },
  { init: 'SR', bg: '#404040' },
];

function HeroDecorations({
  problemeRef,
  showProbleme,
  showExtras,
}: {
  problemeRef: React.RefObject<HTMLSpanElement>;
  showProbleme: boolean;
  showExtras: boolean;
}) {
  const cardClass =
    'absolute h-[11.5rem] w-[9.25rem] rounded-[1.75rem] sm:h-[12.5rem] sm:w-[9.75rem]';

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <AnimatePresence>
        {showExtras && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.08, ease: REVEAL_EASE }}
            className="absolute right-[6%] top-[18%] hidden sm:block lg:right-[9%]"
          >
            <div className="relative h-[26rem] w-[13.5rem]">
              <div className={`${cardClass} left-[4.5rem] top-0 bg-[#FFEDD5]/90`} />
              <div className={`${cardClass} left-[2.25rem] top-[7.25rem] bg-[#FED7AA]/85`} />
              <div className={`${cardClass} left-0 top-[14.5rem] bg-neutral-200/80`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-0 right-0 px-6 sm:bottom-8 sm:px-10 md:px-16 lg:px-20">
        <motion.div
          initial={false}
          animate={{ opacity: showExtras ? 1 : 0, y: showExtras ? 0 : 12 }}
          transition={{ duration: 0.55, delay: showExtras ? 0.18 : 0, ease: REVEAL_EASE }}
          className="absolute bottom-0 left-6 flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-neutral-200 bg-neutral-50/90 sm:left-10 sm:h-24 sm:w-24 md:left-16 lg:left-20"
        >
          <span className="text-xl font-bold lowercase leading-none text-neutral-300 sm:text-2xl">zero</span>
        </motion.div>
        <motion.span
          ref={problemeRef}
          initial={false}
          animate={{ opacity: showProbleme ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className={`absolute bottom-0 right-6 pb-1 text-neutral-300 sm:right-10 md:right-16 lg:right-20 ${HERO_PROBLEME_CLASS}`}
        >
          problem
        </motion.span>
      </div>
    </div>
  );
}

export function Hero() {
  const { phase, problemeReady, reportTargetRects } = useLandingEntrance();
  const isSettled = phase === 'settled';
  const isRevealed = phase === 'revealed';
  const [wordIndex, setWordIndex] = useState(0);
  const [circleVisible, setCircleVisible] = useState(false);

  const noTextRef = useRef<HTMLSpanElement>(null);
  const problemeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isSettled) {
      const timer = window.setTimeout(
        () => setCircleVisible(true),
        NO_HANDOFF_DURATION * 1000 + 60,
      );
      return () => window.clearTimeout(timer);
    }
    if (!isSettled && !isRevealed) {
      setCircleVisible(false);
    }
  }, [isSettled, isRevealed]);

  useLayoutEffect(() => {
    if (phase !== 'flying') return;

    const measure = () => {
      if (!noTextRef.current || !problemeRef.current) return;
      reportTargetRects({
        no: toEntranceRect(noTextRef.current.getBoundingClientRect()),
        probleme: toEntranceRect(problemeRef.current.getBoundingClientRect()),
      });
    };

    measure();
    const frame1 = requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });
    void document.fonts?.ready?.then(measure);

    return () => cancelAnimationFrame(frame1);
  }, [phase, reportTargetRects]);

  useEffect(() => {
    if (!isRevealed) return;
    const timer = window.setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, WORD_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isRevealed]);

  const activeWord = WORDS[wordIndex];

  return (
    <section
      className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden lp-bg pt-24 pb-28 sm:pb-32"
    >
      <HeroDecorations
        problemeRef={problemeRef}
        showProbleme={problemeReady}
        showExtras={isRevealed}
      />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6 text-center sm:px-10">
        <div className="mb-7 flex items-center justify-center gap-3 sm:mb-8 sm:gap-4">
          <span
            className={`${NO_CIRCLE_CLASS} ${circleVisible ? 'border-black' : 'border-transparent'}`}
          >
            <motion.span
              ref={noTextRef}
              className={NO_TEXT_CLASS}
              initial={false}
              animate={{ opacity: isSettled || isRevealed ? 1 : 0 }}
              transition={{
                duration: NO_HANDOFF_DURATION,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              NO
            </motion.span>
          </span>

          {isRevealed ? (
            <motion.span
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.06, ease: REVEAL_EASE }}
              className={IDEA_SLOT_CLASS}
            >
              <span className="invisible" aria-hidden="true">
                PROBLEM
              </span>
              <span className="absolute left-0 top-1/2 -translate-y-1/2">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={activeWord}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.32, ease: REVEAL_EASE }}
                    className="inline-block"
                    style={{ color: BRAND_ORANGE }}
                  >
                    {activeWord}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.span>
          ) : (
            <span className={`${IDEA_SLOT_CLASS} invisible select-none`} aria-hidden="true">
              PROBLEM
            </span>
          )}
        </div>

        {/* Toujours dans le DOM (opacity 0) pour réserver la hauteur — évite le saut vertical au reveal */}
        <motion.h1
          initial={false}
          animate={{ opacity: isRevealed ? 1 : 0, y: isRevealed ? 0 : 18 }}
          transition={{ delay: isRevealed ? 0.16 : 0, duration: 0.55, ease: REVEAL_EASE }}
          aria-hidden={!isRevealed}
          className="pointer-events-none mb-9 max-w-xl text-base font-bold leading-snug lp-text sm:mb-10 sm:text-lg md:text-xl"
        >
          Your next viral content starts here,
          <br />
          the world is waiting.
        </motion.h1>

        <motion.div
          initial={false}
          animate={{ opacity: isRevealed ? 1 : 0, y: isRevealed ? 0 : 18 }}
          transition={{ delay: isRevealed ? 0.28 : 0, duration: 0.55, ease: REVEAL_EASE }}
          aria-hidden={!isRevealed}
          className={`mb-9 flex flex-col items-center gap-3 sm:mb-10 sm:flex-row sm:justify-center ${!isRevealed ? 'pointer-events-none' : ''}`}
        >
          <Link
            href="/register"
            tabIndex={isRevealed ? 0 : -1}
            className={`inline-flex min-w-[220px] items-center justify-center rounded-lg px-8 py-3 text-sm font-semibold text-white transition-all sm:text-base ${brandGradientBg} ${brandShadow} hover:-translate-y-0.5`}
          >
            Start for free
          </Link>
          <a
            href="#demo"
            tabIndex={isRevealed ? 0 : -1}
            className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-8 py-3 text-sm font-semibold lp-text transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:hover:bg-neutral-800 sm:text-base"
          >
            <svg className="h-3 w-3 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch the demo
          </a>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: isRevealed ? 1 : 0, y: isRevealed ? 0 : 12 }}
          transition={{ delay: isRevealed ? 0.4 : 0, duration: 0.55, ease: REVEAL_EASE }}
          aria-hidden={!isRevealed}
          className="pointer-events-none flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
        >
          <div className="flex -space-x-2.5">
            {avatars.map((a) => (
              <div
                key={a.init}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                style={{ backgroundColor: a.bg }}
              >
                {a.init}
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-3">
            <span className="text-sm lp-muted">Join 2,400+ active creators</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-4 w-4 fill-[#F97316] text-[#F97316]" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
