import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { SocialProofMarquee, SocialProofStats } from '@/components/landing/SocialProofBand';
import { LandingRevealSections } from '@/components/landing/LandingRevealSections';
import { landingRoboto } from '@/components/landing/landingFont';

const ScrollProgress = dynamic(() => import('@/components/landing/ScrollProgress'), { ssr: false });

const ProblemSolution = dynamic(() =>
  import('@/components/landing/ProblemSolution').then((m) => ({ default: m.ProblemSolution }))
);
const Features = dynamic(() =>
  import('@/components/landing/Features').then((m) => ({ default: m.Features }))
);
const HowItWorks = dynamic(() =>
  import('@/components/landing/HowItWorks').then((m) => ({ default: m.HowItWorks }))
);
const DemoSection = dynamic(() =>
  import('@/components/landing/DemoSection').then((m) => ({ default: m.DemoSection }))
);
const Testimonials = dynamic(() =>
  import('@/components/landing/Testimonials').then((m) => ({ default: m.Testimonials }))
);
const Pricing = dynamic(() =>
  import('@/components/landing/Pricing').then((m) => ({ default: m.Pricing }))
);
const FAQ = dynamic(() => import('@/components/landing/FAQ').then((m) => ({ default: m.FAQ })));
const FinalCTA = dynamic(() =>
  import('@/components/landing/FinalCTA').then((m) => ({ default: m.FinalCTA }))
);
const Footer = dynamic(() =>
  import('@/components/landing/Footer').then((m) => ({ default: m.Footer }))
);

export const metadata: Metadata = {
  title: 'NoProbleme — Create viral videos with AI',
  description:
    'Analyze any viral video, generate AI templates, and automate your presence on TikTok, Instagram, and YouTube.',
  openGraph: {
    title: 'NoProbleme — Create viral videos with AI',
    description:
      'Analyze any viral video, generate AI templates, and automate your presence on TikTok, Instagram, and YouTube.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function LandingPage() {
  return (
    <main className={`min-h-screen overflow-x-hidden ${landingRoboto.variable}`}>
      <div className="lp-brand-zone">
        <ScrollProgress brand />
        <div className={`lp-roboto-zone ${landingRoboto.className}`}>
          <Navbar brand />
          <Hero />
          <LandingRevealSections>
            <SocialProofMarquee />
            <SocialProofStats />
            <ProblemSolution />
            <Features withAnchor />
            <HowItWorks />
          </LandingRevealSections>
        </div>
        <LandingRevealSections>
          <DemoSection />
          <Testimonials />
          <Pricing />
          <FAQ />
          <FinalCTA />
          <Footer />
        </LandingRevealSections>
      </div>
    </main>
  );
}
