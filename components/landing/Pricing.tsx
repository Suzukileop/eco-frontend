'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { brandGradientBg, brandGradientText, brandShadow } from '@/components/landing/landingBrand';

const plans = [
  {
    name: 'Starter',
    credits: 50,
    priceMonthly: 4.9,
    priceAnnual: 3.9,
    badge: null,
    highlighted: false,
    features: ['5 full video analyses', '150 generated images', '30 premium lessons', 'Email support'],
    cta: 'Choose Starter',
    saving: null,
  },
  {
    name: 'Pro',
    credits: 150,
    priceMonthly: 12.9,
    priceAnnual: 10.3,
    badge: '⭐ Most popular',
    highlighted: true,
    features: ['15 video analyses', '450 generated images', 'Full video editor', 'Priority marketplace access', 'Priority support'],
    cta: 'Start with Pro',
    saving: '-20% annual',
  },
  {
    name: 'Elite',
    credits: 400,
    priceMonthly: 29.9,
    priceAnnual: 23.9,
    badge: null,
    highlighted: false,
    features: ['40 video analyses', '1,200 generated images', 'Animated video backgrounds (fal.ai)', 'Direct API access', 'Dedicated account manager'],
    cta: 'Choose Elite',
    saving: '-25% vs Starter',
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="lp-bg-card border-y border-black/5 py-24 transition-colors duration-300 dark:border-white/5 lg:py-32">
      <div className="lp-container-x mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold leading-tight lp-text md:text-5xl">
            Start for free,
            <br />
            <span className={brandGradientText}>scale when you&apos;re ready</span>
          </h2>
          <p className="mb-8 text-lg lp-muted">No subscription. Buy credits as you need them.</p>

          <div className="inline-flex items-center gap-1 rounded-full border border-black/5 bg-white px-2 py-2 dark:border-white/5 dark:bg-neutral-900">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !annual ? `${brandGradientBg} text-white` : 'lp-muted hover:lp-text'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                annual ? `${brandGradientBg} text-white` : 'lp-muted hover:lp-text'
              }`}
            >
              Annual
              <span className="rounded-full bg-[#FFF7ED] px-1.5 py-0.5 text-xs text-[#EA580C] dark:bg-[#431407]/50 dark:text-[#FB923C]">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid items-center gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`relative flex flex-col gap-4 rounded-2xl border p-6 transition-colors duration-300 md:p-8 ${
                plan.highlighted
                  ? 'scale-100 border-[#F97316]/35 bg-white shadow-[0_0_40px_rgba(249,115,22,0.12)] md:scale-105 dark:bg-neutral-900'
                  : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-4 py-1 text-xs font-bold text-white ${brandGradientBg} ${brandShadow}`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <h3 className="mb-1 text-xl font-bold lp-text">{plan.name}</h3>
                <div className="text-sm lp-muted">{plan.credits} credits</div>
              </div>

              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold lp-text">
                  ${annual ? plan.priceAnnual.toFixed(2) : plan.priceMonthly.toFixed(2)}
                </span>
                <span className="mb-1 text-sm lp-muted">/mo</span>
              </div>

              {plan.saving && (
                <div className="self-start rounded-full border border-[#F97316]/20 bg-[#FFF7ED] px-3 py-1 text-xs text-[#EA580C] dark:border-[#F97316]/30 dark:bg-[#431407]/40 dark:text-[#FB923C]">
                  {plan.saving}
                </div>
              )}

              <ul className="flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm lp-text">
                    <span className="mt-0.5 text-[#F97316]">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? `${brandGradientBg} text-white ${brandShadow} hover:-translate-y-0.5`
                    : 'border border-neutral-200 lp-text hover:border-[#F97316]/30 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10 text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['Visa', 'Mastercard', 'MVola', 'Orange Money', 'Voaray'].map((method) => (
              <span
                key={method}
                className="rounded-lg border border-black/8 bg-white px-3 py-1.5 text-xs lp-muted dark:border-white/10 dark:bg-neutral-900"
              >
                {method}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
