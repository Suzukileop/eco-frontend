'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'How does AI video analysis work?',
    a: 'Our AI analyzes your video frame by frame across multiple dimensions: hook patterns, transition pacing, narrative structure, on-screen text, emotional tone, color palette, and format. It then generates variants tailored to your niche.',
  },
  {
    q: 'Which video formats are supported?',
    a: 'We support MP4 files up to 500 MB, as well as direct URLs from YouTube, TikTok, and Instagram. Analysis usually takes less than 3 minutes.',
  },
  {
    q: 'What is a credit and how do I use it?',
    a: '1 credit = 1 generated image. A full analysis uses 10 credits (1 analysis credit + 9 images). Free actions include browsing, downloading templates, and using the basic editor.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes! You can create a free account and explore the platform with no credit card required.',
  },
  {
    q: 'Is the service available in Madagascar?',
    a: 'Absolutely. NoProbleme is built for Madagascar and French-speaking Africa. You can pay via Voaray (MVola, Orange Money, Visa, and Mastercard). Our servers are optimized for African connections.',
  },
  {
    q: 'Can I use my own images and videos?',
    a: 'Yes. In the video editor, go to "My assets" to import your own media (images, videos, audio). They integrate seamlessly with generated templates.',
  },
  {
    q: 'How does the creator marketplace work?',
    a: 'Post a brief describing your project, budget, and expectations. Verified creators apply. You choose, pay in escrow, track delivery, and review the result. Payment is released only after your approval.',
  },
  {
    q: 'Are my videos stored securely?',
    a: 'All videos are hosted on Cloudflare R2, encrypted at rest and in transit. Files inactive for more than 30 days are automatically deleted to protect your privacy.',
  },
  {
    q: 'Can I cancel my credit subscription?',
    a: 'There is no subscription. NoProbleme uses pay-as-you-go: buy credits when you need them, with no commitment or recurring fees. Your credits never expire.',
  },
  {
    q: 'How do I contact support?',
    a: 'Via in-app chat (available 7 days a week) or email at support@noprobleme.ai. Average response time: 2 hours for Pro and Elite plans, 24 hours for Starter.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="lp-bg lp-container-x py-24 transition-colors duration-300 lg:py-32">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold lp-text md:text-5xl">Frequently asked questions</h2>
          <p className="lp-muted">Everything you need to know before getting started.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="overflow-hidden rounded-xl border border-neutral-200 transition-colors hover:border-[#F97316]/25 dark:border-neutral-700"
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between bg-white p-5 text-left transition-colors hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800/80"
              >
                <span className="pr-4 font-medium lp-text">{faq.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-xl text-[#F97316]"
                >
                  +
                </motion.span>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-neutral-100 bg-neutral-50 px-5 pb-5 pt-2 text-sm leading-relaxed lp-muted dark:border-neutral-800 dark:bg-neutral-900/80">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
