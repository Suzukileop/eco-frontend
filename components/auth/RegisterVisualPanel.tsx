'use client';

import type { ReactNode } from 'react';
import { brandGradientText } from '@/components/landing/landingBrand';

const ORANGE_RGB = '249,115,22';

function MetricCard({
  title,
  value,
  children,
  className = '',
}: {
  title: string;
  value?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-neutral-700/80 dark:bg-neutral-900 ${className}`}
    >
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
      {value ? <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">{value}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function RegisterVisualPanel() {
  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-2xl bg-[#F8F9FC] px-10 py-10 dark:bg-neutral-950 lg:px-14 lg:py-12 xl:px-16 xl:py-14">
      <div className="pointer-events-none absolute -right-20 top-1/4 h-64 w-64 rounded-full bg-[#F97316]/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-12 bottom-1/4 h-48 w-48 rounded-full bg-[#FB923C]/10 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-[28rem] flex-col gap-8 lg:max-w-[30rem] lg:gap-10 xl:max-w-[32rem]">
        <div className="px-1">
          <h2 className="text-3xl font-bold leading-[1.12] tracking-tight text-neutral-900 dark:text-white lg:text-4xl xl:text-[2.65rem]">
            <span className={brandGradientText}>Viral videos.</span>
            <br />
            AI templates.
            <br />
            On autopilot.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 lg:mt-5 lg:text-base">
            Join NoProbleme and turn any trending clip into a publish-ready template in under 30 seconds.
            Analyze, generate, and schedule across TikTok, Instagram, and YouTube.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md px-2 lg:px-4">
          <div className="relative h-[min(18rem,34vh)] w-full lg:h-[min(21rem,40vh)]">
          <MetricCard title="Templates ready" value="40" className="absolute left-0 top-0 w-[58%] -rotate-2">
            <div className="flex h-16 items-end gap-1.5">
              {[35, 55, 40, 70, 48, 62].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md"
                  style={{
                    height: `${h}%`,
                    background: `rgba(${ORANGE_RGB},${0.25 + i * 0.1})`,
                  }}
                />
              ))}
            </div>
          </MetricCard>

          <MetricCard title="Platforms covered" className="absolute bottom-0 left-[8%] w-[52%] rotate-1">
            <div className="flex items-center gap-4">
              <div
                className="relative h-16 w-16 shrink-0 rounded-full"
                style={{
                  background: `conic-gradient(rgba(${ORANGE_RGB},0.9) 0deg 130deg, rgba(${ORANGE_RGB},0.45) 130deg 230deg, rgba(${ORANGE_RGB},0.2) 230deg 360deg)`,
                }}
              >
                <div className="absolute inset-2 rounded-full bg-white dark:bg-neutral-900" />
              </div>
              <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                <p>TikTok</p>
                <p>Instagram</p>
                <p>YouTube</p>
              </div>
            </div>
          </MetricCard>

          <MetricCard title="Videos analyzed" value="72" className="absolute right-0 top-[18%] w-[48%] rotate-2">
            <div className="flex h-20 items-end justify-center gap-3">
              {[
                { year: '2024', h: 45 },
                { year: '2025', h: 62 },
                { year: '2026', h: 88 },
              ].map((bar) => (
                <div key={bar.year} className="flex flex-col items-center gap-1">
                  <div
                    className="w-7 rounded-t-lg"
                    style={{
                      height: `${bar.h}%`,
                      background: `linear-gradient(180deg, rgba(${ORANGE_RGB},0.85), rgba(${ORANGE_RGB},0.35))`,
                    }}
                  />
                  <span className="text-[10px] text-neutral-500">{bar.year}</span>
                </div>
              ))}
            </div>
          </MetricCard>
        </div>
        </div>
      </div>
    </div>
  );
}
