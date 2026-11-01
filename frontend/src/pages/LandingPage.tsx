import { useState, useEffect } from 'react';
import { CanvasContainer } from '../scenes3d/CanvasContainer';
import { IntroSequence } from '../scenes3d/IntroSequence';
import { Navbar } from '../components/navigation/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { GlobeSection } from '../components/landing/GlobeSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { FiveAgentsSection } from '../components/landing/FiveAgentsSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { FaultSimulationSection } from '../components/landing/FaultSimulationSection';
import { AboutSection } from '../components/landing/AboutSection';
import { Footer } from '../components/landing/Footer';
import { NodeDetailModal } from '../components/landing/NodeDetailModal';
import type { NetworkNode, AgentInfo } from '../types';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const prefersReducedMotion = useReducedMotion();
  const [introComplete, setIntroComplete] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [introScene, setIntroScene] = useState<number>(1);
  const [introProgress, setIntroProgress] = useState<number>(0);

  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('telemetry-performance');
  const [faultSimulated, setFaultSimulated] = useState<boolean>(false);
  const [activeNavSection, setActiveNavSection] = useState<string>('hero');

  const scrollProgress = useScrollProgress();

  // Section observer for updating active navbar link
  useEffect(() => {
    const sections = ['hero', 'globe', 'features', 'agents', 'how-it-works', 'about'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
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

  const handleIntroComplete = () => {
    setIntroComplete(true);
  };

  const handleIntroSceneChange = (scene: number, progress: number) => {
    setIntroScene(scene);
    setIntroProgress(progress);
  };

  const handleNavigate = (sectionId: string) => {
    setActiveNavSection(sectionId);
  };

  return (
    <div className="relative min-h-screen bg-[#080B10] text-[#F4F6FA] selection:bg-[#FF8A24] selection:text-[#080B10]">
      {/* --- CINEMATIC 3D BACKGROUND CANVAS --- */}
      <CanvasContainer
        scrollProgress={scrollProgress}
        introComplete={introComplete}
        introScene={introScene}
        introProgress={introProgress}
        onSelectNode={(node) => setSelectedNode(node)}
        selectedNodeId={selectedNode?.id}
        selectedAgentId={selectedAgentId}
        onSelectAgent={(agent: AgentInfo) => setSelectedAgentId(agent.id)}
        faultSimulated={faultSimulated}
      />

      {/* --- INTRO EXPERIENCE OVERLAY --- */}
      {!introComplete && (
        <IntroSequence
          onComplete={handleIntroComplete}
          onSceneChange={handleIntroSceneChange}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}

      {/* --- MAIN PAGE CONTENT (REVEALED AFTER INTRO OR SKIP) --- */}
      <div
        className={`relative z-10 transition-opacity duration-1000 ${
          introComplete ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Transparent Glass Navbar */}
        <Navbar
          onNavigate={handleNavigate}
          activeSection={activeNavSection}
        />

        {/* Section 1: Hero */}
        <HeroSection
          onExploreClick={() => {
            document.getElementById('globe')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onLaunchDiagnosisClick={() => {
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Section 2: 3D Network Globe & Topology Explorer */}
        <GlobeSection
          onSelectNode={(node) => setSelectedNode(node)}
          selectedNode={selectedNode}
        />

        {/* Section 3: Platform Capabilities & Features */}
        <FeaturesSection />

        {/* Section 4: Five Specialized AI Agents */}
        <FiveAgentsSection
          selectedAgentId={selectedAgentId}
          onSelectAgent={(agent) => setSelectedAgentId(agent.id)}
        />

        {/* Section 5: Diagnostic Workflow Pipeline */}
        <HowItWorksSection />

        {/* Section 6: Real-Time Diagnostic Fault Simulator */}
        <FaultSimulationSection
          onSimulateFault={(active) => setFaultSimulated(active)}
        />

        {/* Section 7: About the Problem & Architecture */}
        <AboutSection />

        {/* Footer */}
        <Footer onNavigate={handleNavigate} />

        {/* Node Detail Inspection Modal (when a 3D node is clicked) */}
        <NodeDetailModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}
