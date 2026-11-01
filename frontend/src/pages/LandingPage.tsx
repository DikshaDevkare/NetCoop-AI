import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalEarthBackground3D } from '../scenes3d/GlobalEarthBackground3D';
import { IntroSequence } from '../scenes3d/IntroSequence';
import { Navbar } from '../components/navigation/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { FiveAgentsSection } from '../components/landing/FiveAgentsSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { FinalCtaSection } from '../components/landing/FinalCtaSection';
import { Footer } from '../components/landing/Footer';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function LandingPage() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Intro runs at most once per session (1.8s) unless skipIntro or reducedMotion
  const [introComplete, setIntroComplete] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    if (sessionStorage.getItem('netcoop_intro_seen') === 'true') return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('skipIntro') === 'true') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [selectedAgentId, setSelectedAgentId] = useState<string>('telemetry-agent');
  const [activeNavSection, setActiveNavSection] = useState<string>('hero');

  // Scroll spy to update active navbar section
  useEffect(() => {
    const sections = ['hero', 'features', 'agents', 'how-it-works'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 220;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveNavSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleIntroComplete = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('netcoop_intro_seen', 'true');
    }
    setIntroComplete(true);
  }, []);

  const handleNavigate = (sectionId: string) => {
    setActiveNavSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#05080D] text-[#F4F6FA] selection:bg-[#FF8A24] selection:text-[#05080D] overflow-x-hidden">
      {/* --- CINEMATIC SHORT INTRO EXPERIENCE (SCREEN 1: 1.8 SECONDS) --- */}
      {!introComplete && (
        <IntroSequence
          onComplete={handleIntroComplete}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}

      {/* --- RESTORED 3D EARTH / NETWORK GLOBE BACKGROUND (LAYER 2 & 3) --- */}
      <GlobalEarthBackground3D
        opacity={0.45}
        positionOffset={[1.2, -0.4, -3.2]}
        scale={1.1}
      />

      {/* --- STREAMLINED 5-SECTION LANDING PAGE (SCREEN 2) --- */}
      <div
        className={`relative z-10 transition-opacity duration-700 ${
          introComplete ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Transparent Blur Navbar */}
        <Navbar onNavigate={handleNavigate} activeSection={activeNavSection} />

        {/* Section 1: Hero / Overview (3-Zone Composition + Center 3D Viewport + Metrics Strip) */}
        <HeroSection
          onLaunchDiagnosisClick={() => navigate('/dashboard/diagnosis')}
          onExploreClick={() => {
            const el = document.getElementById('how-it-works');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else navigate('/dashboard');
          }}
        />

        {/* Section 2: How NetCoop AI Works (6-Stage Pipeline with Inputs & Outputs) */}
        <HowItWorksSection />

        {/* Section 3: Five-Agent Architecture (Interactive Council Dossier) */}
        <FiveAgentsSection
          selectedAgentId={selectedAgentId}
          onSelectAgent={(agent) => setSelectedAgentId(agent.id)}
        />

        {/* Section 4: Key Capabilities (6 Core Technological Pillars) */}
        <FeaturesSection />

        {/* Section 5: Final Call to Action (High-Impact Next Steps) */}
        <FinalCtaSection />

        {/* Footer */}
        <Footer onNavigate={handleNavigate} />
      </div>
    </div>
  );
}
