import { LandingHeader } from '../components/layout/LandingHeader.tsx';
import { HeroSection } from '../components/landing/HeroSection.tsx';
import { ProductIntro } from '../components/landing/ProductIntro.tsx';
import { HowItWorks } from '../components/landing/HowItWorks.tsx';
import { ArchitectureOverview } from '../components/landing/ArchitectureOverview.tsx';
import { CapabilitiesSection } from '../components/landing/CapabilitiesSection.tsx';
import { UseCasesSection } from '../components/landing/UseCasesSection.tsx';
import { CtaSection } from '../components/landing/CtaSection.tsx';
import { LandingFooter } from '../components/layout/LandingFooter.tsx';

export function LandingPage() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#08090D',
        color: '#F5F5F7',
        overflowX: 'hidden',
      }}
    >
      {/* Fixed Cinematic Navigation */}
      <LandingHeader />

      {/* Main Landing Sections */}
      <main>
        {/* 1. Hero Section with 3D Quantum Network Hub */}
        <HeroSection />

        {/* 2. Product Introduction */}
        <ProductIntro />

        {/* 3. Step-by-Step Autonomous Lifecycle */}
        <HowItWorks />

        {/* 4. 5-Agent Cooperative Architecture */}
        <ArchitectureOverview />

        {/* 5. Complete Platform Capabilities */}
        <CapabilitiesSection />

        {/* 6. Production Impact & Enterprise Use Cases */}
        <UseCasesSection />

        {/* 7. Conversion Call to Action */}
        <CtaSection />
      </main>

      {/* 8. Full Cinematic Footer */}
      <LandingFooter />
    </div>
  );
}
