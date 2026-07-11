'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLandingEntrance } from '@/components/landing/LandingEntranceContext';
import { useTheme } from './ThemeProvider';

import { brandGradientBg, brandShadow } from '@/components/landing/landingBrand';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#marketplace', label: 'Marketplace' },
  { href: '#faq', label: 'FAQ' },
];

function ThemeToggle({ brand = false }: { brand?: boolean }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative h-9 w-16 rounded-full border transition-all duration-300 focus:outline-none ${
        brand
          ? 'border-neutral-300 bg-neutral-100 hover:border-[#F97316]/40 focus:ring-2 focus:ring-[#F97316]/30 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-[#F97316]/50'
          : 'border-black/10 bg-black/5 hover:border-black/20 focus:ring-2 focus:ring-[#7C3AED]/50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20'
      }`}
    >
      <span
        className={`absolute inset-0.5 rounded-full transition-all duration-300 ${
          brand ? 'bg-neutral-200 dark:bg-neutral-700' : 'bg-[#E8E8F8] dark:bg-[#13131F]'
        }`}
      />
      <motion.span
        animate={{ x: isDark ? 28 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`absolute left-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-colors duration-300 ${
          brand
            ? isDark
              ? 'bg-[#F97316] text-white'
              : 'bg-black text-white dark:bg-white dark:text-black'
            : 'bg-white dark:bg-[#7C3AED]'
        }`}
        style={
          brand
            ? { boxShadow: isDark ? '0 0 12px rgba(249,115,22,0.45)' : '0 2px 8px rgba(0,0,0,0.12)' }
            : { boxShadow: isDark ? '0 0 12px rgba(124,58,237,0.6)' : '0 2px 8px rgba(0,0,0,0.15)' }
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.svg
              key="moon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`h-4 w-4 ${brand ? 'text-[#F97316]' : 'text-[#7C3AED]'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.span>
    </button>
  );
}

export function Navbar({ brand = false, mono = false }: { brand?: boolean; mono?: boolean }) {
  const isBrand = brand || mono;
  const { phase } = useLandingEntrance();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const entranceHidden = phase === 'flying' || phase === 'settled';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <motion.nav
        initial={false}
        animate={{
          opacity: entranceHidden ? 0 : 1,
          y: entranceHidden ? -8 : 0,
        }}
        transition={{ duration: 0.45, delay: entranceHidden ? 0 : 0.05, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={entranceHidden}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          entranceHidden ? 'pointer-events-none' : ''
        } ${
          scrolled
            ? isBrand
              ? 'border-b border-neutral-200 bg-white/90 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90'
              : 'border-b border-black/5 bg-white/90 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-[#06060F]/90 dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex w-full items-center justify-between px-10 sm:px-12 md:px-16 lg:px-20 py-4">
          {/* Logo */}
          <Link
            href="/"
            className={`text-lg font-bold tracking-tight transition-colors lp-text ${
              isBrand ? 'hover:text-[#F97316]' : 'hover:text-[#7C3AED]'
            }`}
          >
            NoProbleme
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`group relative px-4 py-2 text-sm transition-colors duration-200 ${
                  isBrand
                    ? 'lp-muted hover:lp-text'
                    : 'text-gray-500 hover:text-gray-900 dark:text-[#9CA3AF] dark:hover:text-white'
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100 ${
                    isBrand ? 'bg-[#F97316]' : 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]'
                  }`}
                />
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle brand={isBrand} />
            <Link
              href="/login"
              className={`rounded-lg border border-transparent px-4 py-2 text-sm transition-colors duration-200 ${
                isBrand
                  ? 'lp-muted hover:lp-text hover:border-neutral-300 dark:hover:border-neutral-600'
                  : 'text-gray-600 hover:border-black/10 hover:text-gray-900 dark:text-[#9CA3AF] dark:hover:border-white/10 dark:hover:text-white'
              }`}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                isBrand
                  ? `${brandGradientBg} text-white ${brandShadow} hover:-translate-y-0.5`
                  : 'bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(124,58,237,0.7)]'
              }`}
            >
              Sign up
            </Link>
          </div>

          {/* Mobile: toggle + burger */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle brand={isBrand} />
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col gap-1.5 p-2"
              aria-label="Menu"
            >
              <span className={`block h-0.5 w-6 dark:bg-white bg-gray-800 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-6 dark:bg-white bg-gray-800 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-6 dark:bg-white bg-gray-800 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 h-full w-72 dark:bg-[#0D0D1A] bg-white dark:border-l dark:border-white/8 border-l border-black/8 p-6 flex flex-col gap-6 md:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold dark:text-white text-gray-900 text-lg">NoProbleme</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className={isBrand ? 'lp-muted hover:text-[#F97316]' : 'text-gray-500 hover:text-[#7C3AED] dark:text-gray-400'}
                >
                  ✕
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 dark:text-[#9CA3AF] text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-50 rounded-xl transition-all"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-3">
                <Link href="/login" className="w-full text-center px-4 py-3 text-sm dark:text-white text-gray-800 dark:border-white/10 border border-gray-200 rounded-xl dark:hover:bg-white/5 hover:bg-gray-50 transition-all">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className={`w-full rounded-xl px-4 py-3 text-center text-sm font-semibold ${
                    isBrand
                      ? `${brandGradientBg} text-white ${brandShadow}`
                      : 'bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]'
                  }`}
                >
                  Sign up
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
