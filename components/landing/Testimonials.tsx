'use client';

import { motion } from 'framer-motion';

const avatarTones = [
  { from: '#F97316', to: '#FB923C' },
  { from: '#EA580C', to: '#F97316' },
  { from: '#FB923C', to: '#FDBA74' },
  { from: '#C2410C', to: '#EA580C' },
  { from: '#F97316', to: '#EA580C' },
  { from: '#EA580C', to: '#FB923C' },
];

const testimonials = [
  {
    quote: "I stopped spending my nights editing. In 30 seconds, I get a template that performs. My account grew 3× in 2 weeks.",
    name: 'Marie D.',
    niche: 'Fitness coach',
    initials: 'MD',
    stars: 5,
    badge: '3× views in 2 weeks',
  },
  {
    quote: "The AI bot opened my eyes to my niche. Now I know exactly what to create and when to publish. Immediate results.",
    name: 'Rakoto J.',
    niche: 'Digital business',
    initials: 'RJ',
    stars: 5,
    badge: '+180% engagement',
  },
  {
    quote: "The marketplace found me the perfect creator in under an hour. Polished delivery, great communication.",
    name: 'Fara M.',
    niche: 'Lifestyle',
    initials: 'FM',
    stars: 5,
    badge: 'Project delivered in 48h',
  },
  {
    quote: "The AI pipeline is mind-blowing. 30 images generated in one click, all tailored to my tech style. I'm never going back.",
    name: 'Tom A.',
    niche: 'Tech & AI',
    initials: 'TA',
    stars: 5,
    badge: '30 images in 1 click',
  },
  {
    quote: "My Instagram account exploded since I started using viral templates. +800 followers in a month with no paid boost.",
    name: 'Soa R.',
    niche: 'Food',
    initials: 'SR',
    stars: 5,
    badge: '+800 followers/month',
  },
  {
    quote: "I use viral templates every week for my music. The AI analysis catches patterns I would never spot on my own.",
    name: 'Chris N.',
    niche: 'Music',
    initials: 'CN',
    stars: 5,
    badge: 'Top music creator',
  },
];

export function Testimonials() {
  return (
    <section className="lp-bg lp-container-x border-y border-black/5 py-24 transition-colors duration-300 dark:border-white/5 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold lp-text md:text-5xl">They already blew up their views</h2>
          <p className="text-lg lp-muted">2,400+ creators trust us</p>
        </motion.div>

        <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
          {testimonials.map((t, i) => {
            const tone = avatarTones[i % avatarTones.length];
            return (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="break-inside-avoid rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#F97316]/25 hover:shadow-[0_4px_24px_rgba(249,115,22,0.1)] dark:border-neutral-700 dark:bg-neutral-900"
              >
                <svg className="mb-3 h-8 w-8 opacity-30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"
                    className="fill-[#F97316]"
                  />
                  <path
                    d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"
                    className="fill-[#F97316]"
                  />
                </svg>

                <p className="mb-4 text-sm italic leading-relaxed lp-text">&ldquo;{t.quote}&rdquo;</p>

                <div className="flex items-center gap-3 border-t border-black/5 pt-4 dark:border-white/5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${tone.from}, ${tone.to})` }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold lp-text">{t.name}</div>
                    <div className="text-xs lp-muted">{t.niche}</div>
                  </div>
                  <div className="ml-auto flex flex-col items-end gap-1">
                    <div className="flex gap-0.5">
                      {[...Array(t.stars)].map((_, si) => (
                        <svg key={si} className="h-3 w-3 fill-[#F97316] text-[#F97316]" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="rounded-full border border-[#F97316]/20 bg-[#FFF7ED] px-2 py-0.5 text-xs font-medium text-[#EA580C] dark:border-[#F97316]/30 dark:bg-[#431407]/40 dark:text-[#FB923C]">
                      {t.badge}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
