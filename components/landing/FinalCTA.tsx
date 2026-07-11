'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { brandGradientBg, brandGradientText, brandShadow } from '@/components/landing/landingBrand';

export function FinalCTA() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) router.push(`/register?email=${encodeURIComponent(email)}`);
  };

  return (
    <section className="relative overflow-hidden lp-bg lp-container-x py-32 transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#F97316]/12 via-[#FB923C]/6 to-transparent opacity-60 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="mb-6 text-4xl font-bold leading-tight lp-text md:text-6xl">
            Your next viral video
            <br />
            <span className={brandGradientText}>starts here.</span>
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg lp-muted">
            Join 2,400+ creators blowing up their views with our AI.
            <br />
            <span className="font-medium lp-text">No credit card required.</span>
          </p>

          <form onSubmit={handleSubmit} className="mx-auto mb-6 flex max-w-lg flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-5 py-4 lp-text transition-all placeholder:lp-muted focus:border-[#F97316]/50 focus:outline-none focus:ring-1 focus:ring-[#F97316]/30 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <button
              type="submit"
              className={`whitespace-nowrap rounded-xl px-6 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 ${brandGradientBg} ${brandShadow}`}
            >
              Get started now →
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm lp-muted">
            {['Free', 'No commitment', 'Local payment via Voaray'].map((text) => (
              <span key={text} className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {text}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
