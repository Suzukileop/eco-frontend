'use client';

import Image from 'next/image';
import Link from 'next/link';
import { brandGradientBg, brandGradientText, brandShadow } from '@/components/landing/landingBrand';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

function Icon({ children, className = 'w-5 h-5' }: { children: ReactNode; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      {children}
    </svg>
  );
}

const icons = {
  clock: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
    </Icon>
  ),
  lightbulb: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6M10 18h4M12 3a6 6 0 00-3 11v1h6v-1a6 6 0 00-3-11z" />
    </Icon>
  ),
  target: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 0v3m0 12v3M3 12h3m12 0h3" />
    </Icon>
  ),
  search: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
    </Icon>
  ),
  folder: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </Icon>
  ),
  eyeOff: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58M9.88 4.24A10.94 10.94 0 0112 4c5 0 9.27 3.11 11 7-1.02 2.28-2.78 4.18-5 5.32M6.1 6.1C4.22 7.28 2.78 9.02 2 11c1.73 3.89 6 7 10 7 1.13 0 2.22-.2 3.24-.57" />
    </Icon>
  ),
  bolt: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </Icon>
  ),
  chart: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5m0 14h16M8 17V9m4 8V7m4 10v-4" />
    </Icon>
  ),
  calendar: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4m8-4v4M4 8h16M5 6h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z" />
    </Icon>
  ),
  users: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-1a4 4 0 00-4-4h-1M9 20H2v-1a4 4 0 014-4h1m8-5a4 4 0 11-8 0 4 4 0 018 0zm6 1a3 3 0 10-6 0" />
    </Icon>
  ),
  rocket: (
    <Icon className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
    </Icon>
  ),
  shield: (
    <Icon className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 3v6c0 5-3.5 9-8 9s-8-4-8-9V6l8-3z" />
    </Icon>
  ),
};

const problems = [
  { icon: icons.clock, text: '5 hours to create a single video' },
  { icon: icons.lightbulb, text: 'No inspiration, bland results' },
  { icon: icons.target, text: 'No publishing strategy' },
  { icon: icons.search, text: 'Hard to find the right creators' },
  { icon: icons.folder, text: 'Templates that cost a fortune' },
  { icon: icons.eyeOff, text: 'Zero visibility on new videos' },
];

const solutions = [
  { icon: icons.bolt, text: 'AI-ready template in 30 seconds' },
  { icon: icons.chart, text: 'Analysis of viral videos in your niche' },
  { icon: icons.calendar, text: 'Automatic publishing on your schedule' },
  { icon: icons.users, text: 'Marketplace of verified creators' },
  { icon: icons.target, text: 'AI-guided content strategy' },
  { icon: icons.rocket, text: 'Guaranteed views boost and growth' },
];

const slideEase = [0.22, 1, 0.36, 1] as const;
const TRANSITION_DURATION = 0.95;

const SLIDE_LABELS = ['Title 1', 'Before', 'Title 2', 'After'] as const;
const SLIDE_COUNT = SLIDE_LABELS.length;
const SLIDE_DURATIONS_MS = [1000, 3000, 1000, 3000] as const;

const slideVariants = {
  enter: { opacity: 0, scale: 0.84 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.07, filter: 'blur(6px)' },
};

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.35 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.42, ease: slideEase },
  },
};

function ComparisonRow({
  icon,
  text,
  badge,
  isLast,
}: {
  icon: ReactNode;
  text: string;
  badge: '✕' | '✓';
  isLast: boolean;
}) {
  const isPositive = badge === '✓';
  return (
    <motion.li
      variants={rowVariants}
      className={`flex items-center gap-4 py-3 md:py-4 ${!isLast ? 'border-b border-neutral-200 dark:border-neutral-700' : ''}`}
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center ${isPositive ? 'text-[#F97316]' : 'lp-text'}`}>
        {icon}
      </span>
      <span className="flex-1 text-sm leading-snug lp-text md:text-[15px]">{text}</span>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium ${
          isPositive
            ? 'border-[#F97316] bg-[#F97316] text-white'
            : 'border-neutral-400 lp-text dark:border-neutral-500'
        }`}
        aria-hidden="true"
      >
        {badge}
      </span>
    </motion.li>
  );
}

const WAVE_VIEW_W = 80;
const WAVE_VIEW_H = 1000;
const WAVE_AMPLITUDE = 30;
const WAVE_CYCLES = 2.15;
const WAVE_STEPS = 300;

function buildSeamWavePath(): string {
  let path = `M ${WAVE_VIEW_W} 0 L ${WAVE_VIEW_W} ${WAVE_VIEW_H} L 0 ${WAVE_VIEW_H}`;
  for (let i = WAVE_STEPS; i >= 0; i -= 1) {
    const t = i / WAVE_STEPS;
    const y = t * WAVE_VIEW_H;
    const x = WAVE_AMPLITUDE + WAVE_AMPLITUDE * Math.sin(t * WAVE_CYCLES * Math.PI * 2);
    path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${path} Z`;
}

const SEAM_WAVE_PATH = buildSeamWavePath();

function SeamWave({ intoImage }: { intoImage: 'left' | 'right' }) {
  const mirror = intoImage === 'right';

  return (
    <svg
      className="pointer-events-none absolute top-0 z-10 hidden h-full md:block"
      style={{
        width: WAVE_VIEW_W,
        left: '50%',
        transform: mirror ? undefined : 'translateX(-100%)',
      }}
      viewBox={`0 0 ${WAVE_VIEW_W} ${WAVE_VIEW_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="fill-white dark:fill-neutral-900"
        d={SEAM_WAVE_PATH}
        transform={mirror ? `scale(-1, 1) translate(-${WAVE_VIEW_W}, 0)` : undefined}
      />
    </svg>
  );
}

function AfterCtaOverlay({ active }: { active: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ delay: 0.15, duration: 0.45, ease: slideEase }}
      className="text-center"
    >
      <Link
        href="/register"
        className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 sm:px-8 sm:py-4 sm:text-base ${brandGradientBg} ${brandShadow}`}
      >
        {icons.rocket}
        I want to stop wasting time →
      </Link>
      <p className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs text-white/90 sm:mt-3 sm:text-sm">
        <span>{icons.shield}</span>
        Free trial
        <span className="opacity-60">•</span>
        No credit card
        <span className="opacity-60">•</span>
        Cancel anytime
      </p>
    </motion.div>
  );
}

function WavySplitCard({
  imageSrc,
  imageAlt,
  imageSide,
  grayscale = false,
  priority = false,
  imageOverlay,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  imageSrc: string;
  imageAlt: string;
  imageSide: 'left' | 'right';
  grayscale?: boolean;
  priority?: boolean;
  imageOverlay?: ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children: ReactNode;
}) {
  const imageOnLeft = imageSide === 'left';

  const imageBlock = (
    <div
      className={`relative min-h-[11rem] w-full shrink-0 overflow-hidden sm:min-h-[12rem] md:min-h-[28rem] md:w-1/2 ${imageOverlay ? 'group/image' : ''}`}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className={`object-cover object-center transition-all duration-300 ${
          grayscale ? 'grayscale' : ''
        } ${imageOverlay ? 'group-hover/image:scale-105 group-hover/image:blur-[4px]' : ''}`}
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority}
      />
      {imageOverlay ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover/image:bg-black/30 max-md:bg-black/25"
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 opacity-0 transition-opacity duration-300 group-hover/image:opacity-100 max-md:opacity-100">
            <div className="pointer-events-auto">{imageOverlay}</div>
          </div>
        </>
      ) : null}
    </div>
  );

  const panelBlock = (
    <div className="relative z-[1] flex flex-1 flex-col justify-center overflow-y-auto bg-white px-5 py-5 dark:bg-neutral-900 md:w-1/2 md:px-10 md:py-8 lg:px-14 lg:py-10">
      {children}
    </div>
  );

  return (
    <div
      className="relative flex min-h-[22rem] w-full flex-col overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_8px_40px_rgba(0,0,0,0.35)] sm:min-h-[24rem] md:min-h-[28rem] md:flex-row md:rounded-[2rem]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {imageOnLeft ? (
        <>
          {imageBlock}
          {panelBlock}
          <SeamWave intoImage="left" />
        </>
      ) : (
        <>
          {panelBlock}
          {imageBlock}
          <SeamWave intoImage="right" />
        </>
      )}
    </div>
  );
}

function TitleContent({ text, gradient = false }: { text: string; gradient?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center px-4">
      <h2
        className={`max-w-6xl text-center text-[2rem] font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem] ${
          gradient ? brandGradientText : 'lp-text'
        }`}
      >
        {text}
      </h2>
    </div>
  );
}

function ComparisonSlideFrame({ card }: { card: ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col px-4 py-4 md:py-6">
      <div className="mx-auto w-full max-w-5xl shrink-0">{card}</div>
    </div>
  );
}

function BeforeContent({
  active,
  onCardHoverStart,
  onCardHoverEnd,
}: {
  active: boolean;
  onCardHoverStart: () => void;
  onCardHoverEnd: () => void;
}) {
  return (
    <ComparisonSlideFrame
      card={
        <WavySplitCard
          imageSrc="/landing/before-stressed-creator.jpg"
          imageAlt="Stressed content creator at their computer"
          imageSide="left"
          grayscale
          priority
          onMouseEnter={onCardHoverStart}
          onMouseLeave={onCardHoverEnd}
        >
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] lp-muted md:mb-6 md:text-sm">
            Without our platform
          </h3>
          <motion.ul
            initial="hidden"
            animate={active ? 'visible' : 'hidden'}
            variants={listVariants}
          >
            {problems.map((item, index) => (
              <ComparisonRow
                key={item.text}
                icon={item.icon}
                text={item.text}
                badge="✕"
                isLast={index === problems.length - 1}
              />
            ))}
          </motion.ul>
        </WavySplitCard>
      }
    />
  );
}

function AfterContent({
  active,
  onCardHoverStart,
  onCardHoverEnd,
}: {
  active: boolean;
  onCardHoverStart: () => void;
  onCardHoverEnd: () => void;
}) {
  return (
    <ComparisonSlideFrame
      card={
        <WavySplitCard
          imageSrc="/landing/after-happy-creator.jpg"
          imageAlt="Happy content creator using the platform"
          imageSide="right"
          imageOverlay={<AfterCtaOverlay active={active} />}
          onMouseEnter={onCardHoverStart}
          onMouseLeave={onCardHoverEnd}
        >
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#F97316] md:mb-6 md:text-sm">
            With our platform
          </h3>
          <motion.ul
            initial="hidden"
            animate={active ? 'visible' : 'hidden'}
            variants={listVariants}
          >
            {solutions.map((item, index) => (
              <ComparisonRow
                key={item.text}
                icon={item.icon}
                text={item.text}
                badge="✓"
                isLast={index === solutions.length - 1}
              />
            ))}
          </motion.ul>
        </WavySplitCard>
      }
    />
  );
}

export function ProblemSolution() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.45 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const wasInViewRef = useRef(false);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(((index % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDE_COUNT);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  const handleCardHoverStart = useCallback(() => setPaused(true), []);
  const handleCardHoverEnd = useCallback(() => setPaused(false), []);

  useEffect(() => {
    if (isInView && !wasInViewRef.current) {
      setCurrentSlide(0);
      setPaused(false);
    }
    wasInViewRef.current = isInView;
  }, [isInView]);

  useEffect(() => {
    if (currentSlide !== 1 && currentSlide !== 3) {
      setPaused(false);
    }
  }, [currentSlide]);

  useEffect(() => {
    if (!isInView || paused) return;

    const holdMs = SLIDE_DURATIONS_MS[currentSlide];
    const timer = window.setTimeout(goNext, Math.round(TRANSITION_DURATION * 1000) + holdMs);
    return () => window.clearTimeout(timer);
  }, [currentSlide, goNext, isInView, paused]);

  const variants = slideVariants;

  const renderSlide = (index: number) => {
    switch (index) {
      case 0:
        return <TitleContent text="Stop wasting time." />;
      case 1:
        return (
          <BeforeContent
            active={currentSlide === 1}
            onCardHoverStart={handleCardHoverStart}
            onCardHoverEnd={handleCardHoverEnd}
          />
        );
      case 2:
        return <TitleContent text="Take action." gradient />;
      case 3:
        return (
          <AfterContent
            active={currentSlide === 3}
            onCardHoverStart={handleCardHoverStart}
            onCardHoverEnd={handleCardHoverEnd}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Before and after journey"
      className="relative flex w-full flex-col overflow-hidden lp-bg pt-16 transition-colors duration-300 md:pt-24"
    >
      <div
        className="relative mx-auto min-h-[28rem] w-full max-w-6xl lp-container-x sm:min-h-[30rem] md:min-h-[32rem] lg:min-h-[34rem]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentSlide}
            className="absolute inset-0"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: TRANSITION_DURATION, ease: slideEase }}
          >
            {renderSlide(currentSlide)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-40 -mt-2 shrink-0 pb-8 pt-3 md:-mt-4 md:pb-10 md:pt-4">
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/90 text-sm lp-text transition hover:bg-white dark:border-white/15 dark:bg-white/10"
            aria-label="Previous slide"
          >
            ‹
          </button>

          <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-3 py-2 dark:border-white/15 dark:bg-white/10">
            {SLIDE_LABELS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => goToSlide(index)}
                className="group flex flex-col items-center gap-1"
                aria-label={`Go to ${label}`}
                aria-current={currentSlide === index ? 'step' : undefined}
              >
                <span
                  className={`block h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? `w-7 ${brandGradientBg}`
                      : 'w-2 bg-neutral-300 group-hover:bg-neutral-400 dark:bg-neutral-600 dark:group-hover:bg-neutral-500'
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/90 text-sm lp-text transition hover:bg-white dark:border-white/15 dark:bg-white/10"
            aria-label="Next slide"
          >
            ›
          </button>
          </div>
        </div>
      </div>
    </section>
  );
}
