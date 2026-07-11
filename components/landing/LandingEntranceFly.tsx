'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  HERO_PROBLEME_CLASS,
  NO_FLY_DURATION,
  NO_FLY_EASE,
  NO_HANDOFF_DURATION,
  NO_TEXT_CLASS,
  PROBLEME_FLY_DURATION,
  PROBLEME_HANDOFF_DURATION,
} from '@/components/landing/landingEntranceNo';
import { landingRoboto } from '@/components/landing/landingFont';
import type { EntranceAnchorRects } from '@/components/landing/landingEntranceTypes';
import { boxMotionStyle } from '@/components/landing/landingEntranceTypes';

type FlyStage = 'hold' | 'fly' | 'handoff' | 'done';

type LandingEntranceFlyProps = {
  startRects: EntranceAnchorRects;
  endRects: EntranceAnchorRects | null;
  onNoLanded: () => void;
  onProblemeLanded: () => void;
  onHandoffComplete: () => void;
};

export function LandingEntranceFly({
  startRects,
  endRects,
  onNoLanded,
  onProblemeLanded,
  onHandoffComplete,
}: LandingEntranceFlyProps) {
  const [noStage, setNoStage] = useState<FlyStage>('hold');
  const [problemeStage, setProblemeStage] = useState<FlyStage>('hold');
  const noLandedRef = useRef(false);
  const problemeLandedRef = useRef(false);
  const handoffRef = useRef(false);

  useEffect(() => {
    if (!endRects || noStage !== 'hold') return;
    const timer = window.setTimeout(() => {
      setNoStage('fly');
      setProblemeStage('fly');
    }, 100);
    return () => window.clearTimeout(timer);
  }, [endRects, noStage]);

  useEffect(() => {
    if (problemeStage !== 'fly' || !endRects) return;
    const timer = window.setTimeout(() => {
      if (problemeLandedRef.current) return;
      problemeLandedRef.current = true;
      setProblemeStage('handoff');
      onProblemeLanded();
      window.setTimeout(() => setProblemeStage('done'), PROBLEME_HANDOFF_DURATION * 1000);
    }, PROBLEME_FLY_DURATION * 1000);
    return () => window.clearTimeout(timer);
  }, [problemeStage, endRects, onProblemeLanded]);

  useEffect(() => {
    if (noStage !== 'fly' || !endRects) return;
    const timer = window.setTimeout(() => {
      if (noLandedRef.current) return;
      noLandedRef.current = true;
      setNoStage('handoff');
      onNoLanded();
    }, NO_FLY_DURATION * 1000);
    return () => window.clearTimeout(timer);
  }, [noStage, endRects, onNoLanded]);

  useEffect(() => {
    if (noStage !== 'handoff') return;
    const timer = window.setTimeout(() => {
      if (handoffRef.current) return;
      handoffRef.current = true;
      setNoStage('done');
      onHandoffComplete();
    }, NO_HANDOFF_DURATION * 1000);
    return () => window.clearTimeout(timer);
  }, [noStage, onHandoffComplete]);

  const noEndBox = endRects ? boxMotionStyle(endRects.no) : boxMotionStyle(startRects.no);
  const noStartBox = boxMotionStyle(startRects.no);
  const noBox = noStage === 'hold' ? noStartBox : noEndBox;
  const noOpacity = noStage === 'handoff' || noStage === 'done' ? 0 : 1;

  const problemeEndBox = endRects
    ? boxMotionStyle(endRects.probleme)
    : boxMotionStyle(startRects.probleme);
  const problemeStartBox = boxMotionStyle(startRects.probleme);
  const problemeBox = problemeStage === 'hold' ? problemeStartBox : problemeEndBox;
  const problemeOpacity = problemeStage === 'handoff' || problemeStage === 'done' ? 0 : 1;
  const problemeColor = problemeStage === 'fly' && endRects ? '#d4d4d4' : '#F97316';

  return (
    <div
      className={`${landingRoboto.className} pointer-events-none fixed inset-0 z-[260]`}
      aria-hidden="true"
    >
      <motion.div
        className="fixed z-[262] flex items-center justify-center"
        initial={false}
        animate={{ ...noBox, opacity: noOpacity }}
        transition={{
          left: { duration: NO_FLY_DURATION, ease: NO_FLY_EASE },
          top: { duration: NO_FLY_DURATION, ease: NO_FLY_EASE },
          width: { duration: NO_FLY_DURATION, ease: NO_FLY_EASE },
          height: { duration: NO_FLY_DURATION, ease: NO_FLY_EASE },
          opacity: { duration: NO_HANDOFF_DURATION, ease: [0.4, 0, 0.2, 1] },
        }}
      >
        <span className={NO_TEXT_CLASS}>NO</span>
      </motion.div>

      {problemeStage !== 'done' && (
        <motion.div
          className="fixed z-[261] flex items-center justify-center"
          initial={false}
          animate={{ ...problemeBox, opacity: problemeOpacity }}
          transition={{
            left: { duration: PROBLEME_FLY_DURATION, ease: NO_FLY_EASE },
            top: { duration: PROBLEME_FLY_DURATION, ease: NO_FLY_EASE },
            width: { duration: PROBLEME_FLY_DURATION, ease: NO_FLY_EASE },
            height: { duration: PROBLEME_FLY_DURATION, ease: NO_FLY_EASE },
            opacity: { duration: PROBLEME_HANDOFF_DURATION, ease: [0.4, 0, 0.2, 1] },
          }}
        >
          <span className={HERO_PROBLEME_CLASS} style={{ color: problemeColor }}>
            problem
          </span>
        </motion.div>
      )}
    </div>
  );
}
