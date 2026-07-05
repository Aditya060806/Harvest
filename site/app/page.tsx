import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import ScanDemo from '@/components/ScanDemo';
import Plugins from '@/components/Plugins';
import Install from '@/components/Install';
import Footer from '@/components/Footer';
import { Reveal, SectionLabel } from '@/components/ui';

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />

      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal className="mb-12 text-center">
          <SectionLabel>Live output</SectionLabel>
          <h2 className="mt-5 text-4xl font-bold text-white sm:text-5xl">
            Actionable feedback, not a wall of noise
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Grouped by file, colour-coded by severity, with a score bar and a trend since your last run.
          </p>
        </Reveal>
        <Reveal>
          <ScanDemo />
        </Reveal>
      </section>

      <Features />
      <HowItWorks />
      <Plugins />
      <Install />
      <Footer />
    </main>
  );
}
