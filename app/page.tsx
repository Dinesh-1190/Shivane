import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { About } from '@/components/sections/About';
import { Brands } from '@/components/sections/Brands';
import { Companies } from '@/components/sections/Companies';
import { Contact } from '@/components/sections/Contact';
import { CreativeWork } from '@/components/sections/CreativeWork';
import { EarlyLifeEducation } from '@/components/sections/EarlyLifeEducation';
import { Hero } from '@/components/sections/Hero';
import { Investing } from '@/components/sections/Investing';
import { GlobeStageLoader } from '@/components/three/GlobeStageLoader';
import { Nav } from '@/components/ui/Nav';
import { Preloader } from '@/components/ui/Preloader';

export default function Page() {
  return (
    <SmoothScroll>
      <Preloader />

      {/* The 3D layer sits behind everything at z-0; content runs above it at
          z-10 with transparent section backgrounds so the globe reads through. */}
      <GlobeStageLoader />

      <Nav />

      {/*
        Section order: About, Brands Worked With, Company Portfolio,
        Angel Investing, Early Life & Education, Creative Work, Contact.
      */}
      <main id="main" className="relative z-10">
        <Hero />
        <About />
        <Brands />
        <Companies />
        <Investing />
        <EarlyLifeEducation />
        <CreativeWork />
        <Contact />
      </main>
    </SmoothScroll>
  );
}
