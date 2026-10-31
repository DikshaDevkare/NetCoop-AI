import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Layers,
  Sparkles,
  Cpu,
  Radio,
  Search,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.tsx';
import { Header } from '../components/layout/Header.tsx';
import { SectionHeading } from '../components/ui/SectionHeading.tsx';
import { GlassCard } from '../components/ui/GlassCard.tsx';
import { GlowButton } from '../components/ui/GlowButton.tsx';
import { StatusBadge } from '../components/ui/StatusBadge.tsx';
import { MetricCard } from '../components/ui/MetricCard.tsx';
import { FormInput } from '../components/ui/FormInput.tsx';
import { ProgressBar } from '../components/ui/ProgressBar.tsx';
import { LoadingScreen } from '../components/ui/LoadingScreen.tsx';
import { Global3DEnvironment } from '../components/three/Global3DEnvironment.tsx';
import { OBSIDIAN_EMBER_COLORS } from '../lib/theme.ts';
import type { ScenePreset } from '../types/theme.types.ts';

export function DesignSystemPage() {
  const [activePreset, setActivePreset] = useState<ScenePreset>('default');
  const [reducedMotionManual, setReducedMotionManual] = useState<boolean>(false);
  const [showFullscreenLoading, setShowFullscreenLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const presets: { id: ScenePreset; label: string; desc: string }[] = [
    { id: 'default', label: 'Default Topology', desc: 'Balanced core nexus & satellite switches' },
    { id: 'orchestration', label: '5-Agent Orbit', desc: 'Pentagonal multi-agent orbital halo' },
    { id: 'network', label: 'Mesh Fabric', desc: 'Heterogeneous router clusters & gateways' },
    { id: 'telemetry', label: 'Telemetry Stream', desc: 'High-frequency telemetry waveform' },
    { id: 'minimal', label: 'Minimal Drift', desc: 'Low-frequency quiet composition' },
  ];

  const colorPalette = [
    { name: 'Background', hex: OBSIDIAN_EMBER_COLORS.bg, token: '--color-bg', role: 'Main canvas canvas floor' },
    { name: 'Secondary BG', hex: OBSIDIAN_EMBER_COLORS.bgSecondary, token: '--color-bg-secondary', role: 'Panel backdrops & sub-containers' },
    { name: 'Elevated Surface', hex: OBSIDIAN_EMBER_COLORS.surfaceElevated, token: '--color-surface-elevated', role: 'Cards, drawers, modals' },
    { name: 'Primary Orange', hex: OBSIDIAN_EMBER_COLORS.primaryOrange, token: '--color-orange', role: 'Primary CTA, critical alerts, hero glow' },
    { name: 'Amber Glow', hex: OBSIDIAN_EMBER_COLORS.amber, token: '--color-amber', role: 'Warning pips, highlights, node links' },
    { name: 'Cyber Violet', hex: OBSIDIAN_EMBER_COLORS.violet, token: '--color-violet', role: 'Agent consensus & AI thought buses' },
    { name: 'Metric Cyan', hex: OBSIDIAN_EMBER_COLORS.cyan, token: '--color-cyan', role: 'Telemetry health, active routes' },
    { name: 'Main Text', hex: OBSIDIAN_EMBER_COLORS.textMain, token: '--color-text-main', role: 'Primary titles & high-contrast labels' },
    { name: 'Secondary Text', hex: OBSIDIAN_EMBER_COLORS.textSecondary, token: '--color-text-secondary', role: 'Body copy & metadata' },
  ];

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1800);
  };

  const triggerLoadingDemo = () => {
    setShowFullscreenLoading(true);
    setTimeout(() => {
      setShowFullscreenLoading(false);
    }, 2800);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#08090D', color: '#F5F5F7' }}>
      {/* 1. Real 3D Environment in Fixed Background Layer */}
      <Global3DEnvironment preset={activePreset} reducedMotionOverride={reducedMotionManual} />

      {/* 2. Glassmorphic App Header */}
      <Header />

      {/* 3. Main Design System Content Container */}
      <PageContainer maxWidth="xl" withBackgroundGrid>
        {/* HERO BANNER */}
        <div style={{ marginBottom: '56px', paddingTop: '16px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(255, 122, 24, 0.12)',
              border: '1px solid rgba(255, 122, 24, 0.35)',
              color: '#FFB347',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <Sparkles size={14} />
            <span>Design System & Architecture Foundation</span>
          </div>

          <h1
            style={{
              fontSize: '44px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '16px',
            }}
          >
            OBSIDIAN <span className="gradient-ember-text">EMBER</span>
          </h1>

          <p
            style={{
              fontSize: '17px',
              color: '#A3A6B3',
              maxWidth: '780px',
              lineHeight: 1.6,
              marginBottom: '28px',
            }}
          >
            A high-performance visual identity and component engine crafted for the NetCoop AI multi-agent
            network diagnosis platform. Built with real Three.js 3D geometry, dark glassmorphism, controlled
            amber radiance, and strict TypeScript components.
          </p>

          {/* 3D SCENE CONTROLLER BAR */}
          <GlassCard variant="elevated" style={{ padding: '20px 24px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Layers size={16} color="#FFB347" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#F5F5F7' }}>
                    Live 3D Canvas Scene Presets
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#A3A6B3' }}>
                  Switch between 3D scene presets to see real-time topological mesh reorganization:
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setActivePreset(preset.id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: activePreset === preset.id ? '1px solid #FF7A18' : '1px solid rgba(255, 255, 255, 0.1)',
                      background:
                        activePreset === preset.id
                          ? 'linear-gradient(135deg, rgba(255, 122, 24, 0.25) 0%, rgba(255, 179, 71, 0.15) 100%)'
                          : 'rgba(25, 28, 38, 0.6)',
                      color: activePreset === preset.id ? '#FFB347' : '#A3A6B3',
                      boxShadow: activePreset === preset.id ? '0 0 16px rgba(255, 122, 24, 0.3)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}

                <button
                  onClick={() => setReducedMotionManual(!reducedMotionManual)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: reducedMotionManual ? '1px solid #38D9FF' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: reducedMotionManual ? 'rgba(56, 217, 255, 0.15)' : 'rgba(25, 28, 38, 0.6)',
                    color: reducedMotionManual ? '#38D9FF' : '#A3A6B3',
                    transition: 'all 0.2s',
                  }}
                  title="Simulate reduced motion preference"
                >
                  {reducedMotionManual ? 'Reduced Motion: ON' : 'Motion: ACTIVE'}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* SECTION 1: COLOR PALETTE */}
        <section id="design-tokens" style={{ marginBottom: '64px' }}>
          <SectionHeading
            badge="Tokens"
            title="Color Palette System"
            description="Deep obsidian floors, charcoal glass, high-energy ember accents, and diagnostic telemetry indicators."
            accent="orange"
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {colorPalette.map((col) => (
              <GlassCard
                key={col.token}
                variant="default"
                hoverable
                onClick={() => handleCopy(col.hex)}
                style={{ padding: '16px' }}
              >
                <div
                  style={{
                    height: '60px',
                    borderRadius: '8px',
                    backgroundColor: col.hex,
                    marginBottom: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    padding: '8px',
                  }}
                >
                  {copiedColor === col.hex && (
                    <span
                      style={{
                        fontSize: '10px',
                        background: '#08090D',
                        color: '#38D9FF',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      COPIED!
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#F5F5F7' }}>{col.name}</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#FFB347' }}>{col.hex}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#A3A6B3' }}>{col.role}</div>
                <div style={{ fontSize: '10px', color: '#6A6D7C', fontFamily: 'monospace', marginTop: '4px' }}>{col.token}</div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* SECTION 2: TELEMETRY METRIC CARDS */}
        <section id="metrics" style={{ marginBottom: '64px' }}>
          <SectionHeading
            badge="Telemetry"
            title="Real-Time Metric Cards"
            description="Live animated counters, directional trend indicators, and SVG sparkline telemetry curves."
            accent="amber"
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px',
            }}
          >
            <MetricCard
              title="Multi-Agent Latency"
              value={18.4}
              unit="ms"
              decimals={1}
              change="-4.2% nominal"
              trend="up"
              accent="orange"
              icon={Activity}
              sparkline={[32, 28, 24, 22, 19, 18, 18.4]}
            />
            <MetricCard
              title="Fabric Throughput"
              value={148.6}
              unit="Gbps"
              decimals={1}
              change="+14.5% ingress"
              trend="up"
              accent="amber"
              icon={Radio}
              sparkline={[90, 110, 125, 132, 140, 148.6]}
            />
            <MetricCard
              title="Orchestration Consensus"
              value={5}
              unit="/ 5 Nodes"
              decimals={0}
              change="All agents synchronized"
              trend="stable"
              accent="violet"
              icon={Cpu}
              sparkline={[5, 5, 5, 5, 5, 5]}
            />
            <MetricCard
              title="Diagnostic Health Score"
              value={99.8}
              unit="%"
              decimals={1}
              change="+0.4% baseline"
              trend="up"
              accent="cyan"
              icon={CheckCircle2}
              sparkline={[98.5, 99.1, 99.4, 99.6, 99.8]}
            />
          </div>
        </section>

        {/* SECTION 3: GLASSMORPHISM CARDS */}
        <section id="cards" style={{ marginBottom: '64px' }}>
          <SectionHeading
            badge="Surfaces"
            title="Smoked Glass Surfaces"
            description="Multi-tier glassmorphic panels featuring specular rim reflections, controlled ember glow, and deep backdrop filtration."
            accent="violet"
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            <GlassCard variant="default">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Layers size={16} color="#A3A6B3" />
                <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Default Smoked Glass</h4>
              </div>
              <p style={{ fontSize: '13px', color: '#A3A6B3', lineHeight: 1.5 }}>
                Subtle backdrop blur (16px), 65% opacity charcoal base, and 8% white boundary reflection for baseline layouts.
              </p>
            </GlassCard>

            <GlassCard variant="elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={16} color="#FFB347" />
                <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Elevated Surface</h4>
              </div>
              <p style={{ fontSize: '13px', color: '#A3A6B3', lineHeight: 1.5 }}>
                Deep 24px blur, specular top reflection line, and soft ambient drop shadows for focal inspection widgets.
              </p>
            </GlassCard>

            <GlassCard variant="interactive">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Activity size={16} color="#FF7A18" />
                <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Interactive Hover Card</h4>
              </div>
              <p style={{ fontSize: '13px', color: '#A3A6B3', lineHeight: 1.5 }}>
                Hover to trigger 3px elevation lift, amber border flare, and soft volumetric glow feedback.
              </p>
            </GlassCard>

            <GlassCard variant="critical">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Flame size={16} color="#FF7A18" />
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#FF7A18' }}>Critical Incident Card</h4>
              </div>
              <p style={{ fontSize: '13px', color: '#A3A6B3', lineHeight: 1.5 }}>
                Tuned for high-severity anomaly detection, RCA flags, and urgent remediation action cards.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* SECTION 4: INTERACTIVE BUTTONS & CONTROLS */}
        <section id="components" style={{ marginBottom: '64px' }}>
          <SectionHeading
            badge="Controls"
            title="Interactive Glow Buttons & Actions"
            description="Haptic-like Framer Motion spring interactions, amber flares, and loading indicators."
            accent="orange"
          />

          <GlassCard variant="default" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#A3A6B3', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                  Button Variants
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <GlowButton variant="primary" icon={Sparkles}>
                    Primary Ember
                  </GlowButton>
                  <GlowButton variant="secondary" icon={Layers}>
                    Secondary Glass
                  </GlowButton>
                  <GlowButton variant="outline" icon={Sliders}>
                    Outline Amber
                  </GlowButton>
                  <GlowButton variant="ghost">
                    Ghost Action
                  </GlowButton>
                  <GlowButton variant="danger" icon={AlertTriangle}>
                    Isolate Segment
                  </GlowButton>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#A3A6B3', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                  Sizes & State Feedback
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <GlowButton variant="primary" size="sm">
                    Small
                  </GlowButton>
                  <GlowButton variant="primary" size="md">
                    Medium
                  </GlowButton>
                  <GlowButton variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                    Launch Diagnostics
                  </GlowButton>
                  <GlowButton variant="secondary" loading>
                    Synchronizing...
                  </GlowButton>
                  <GlowButton variant="secondary" disabled>
                    Disabled Action
                  </GlowButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* SECTION 5: STATUS SIGNALS & BADGES */}
        <section id="badges" style={{ marginBottom: '64px' }}>
          <SectionHeading
            badge="Signals"
            title="Status Badges & Radar Pings"
            description="Real-time multi-agent operational telemetry indicators with pulsing radar rings."
            accent="cyan"
          />

          <GlassCard variant="default" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <StatusBadge status="healthy" label="Mesh Healthy" />
              <StatusBadge status="warning" label="High Latency Warning" />
              <StatusBadge status="critical" label="BGP Link Severed" />
              <StatusBadge status="active" label="Agent Consensus Active" />
              <StatusBadge status="standby" label="Standby Gateway" />
              <StatusBadge status="syncing" label="Telemetry Syncing" />
            </div>
          </GlassCard>
        </section>

        {/* SECTION 6: FORM CONTROLS & TELEMETRY PROGRESS */}
        <section id="forms" style={{ marginBottom: '64px' }}>
          <SectionHeading
            badge="Inputs"
            title="Telemetry Gauges & Form Controls"
            description="Search bars, node filters, and multi-segment bandwidth progress indicators."
            accent="amber"
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Form Inputs */}
            <GlassCard variant="default">
              <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Network Inspection Inputs</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <FormInput
                  label="Node Query Search"
                  placeholder="e.g. core-router-ord1.netcoop.internal"
                  icon={Search}
                  value={searchValue}
                  onChange={setSearchValue}
                />
                <FormInput
                  label="FastAPI Backend Gateway Target"
                  placeholder="http://localhost:8000/api"
                  icon={Terminal}
                  value="http://localhost:8000/api/health"
                  disabled
                />
              </div>
            </GlassCard>

            {/* Telemetry Progress Bars */}
            <GlassCard variant="default">
              <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Fabric Capacity Gauges</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <ProgressBar label="Core CPU Processing Pool" value={78} accent="orange" />
                <ProgressBar label="Packet Ingress Buffer Pool" value={42} accent="amber" />
                <ProgressBar label="Neural Agent Memory Allocation" value={86} accent="violet" />
                <ProgressBar label="Topology Convergence Bandwidth" value={95} accent="cyan" />
              </div>
            </GlassCard>
          </div>
        </section>

        {/* SECTION 7: LOADING SCREEN DEMONSTRATION */}
        <section id="loading" style={{ marginBottom: '64px' }}>
          <SectionHeading
            badge="Lifecycle"
            title="Orchestration Loading States"
            description="Multi-ring orbital ember loader with radial pulse rings and animated progress feedback."
            accent="orange"
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            <LoadingScreen
              fullScreen={false}
              message="Ingesting Heterogeneous Telemetry..."
              subtext="Correlating BGP flaps and interface drops across 5 agents"
              progress={68}
            />

            <GlassCard
              variant="default"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '32px',
              }}
            >
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                Fullscreen Loading Modal
              </h4>
              <p style={{ fontSize: '13px', color: '#A3A6B3', marginBottom: '20px', maxWidth: '320px' }}>
                Click below to preview the full-screen cinematic orbital loading sequence used during agent inference and model initialization.
              </p>
              <GlowButton variant="primary" icon={RefreshCw} onClick={triggerLoadingDemo}>
                Preview Fullscreen Loader
              </GlowButton>
            </GlassCard>
          </div>
        </section>

        {/* SECTION 8: TYPOGRAPHY HIERARCHY */}
        <section id="typography" style={{ marginBottom: '64px' }}>
          <SectionHeading
            badge="Scale"
            title="Typography Hierarchy"
            description="Engineered for high readability, futuristic display headers, and technical monospace telemetry logs."
            accent="cyan"
          />

          <GlassCard variant="default">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#A3A6B3', fontFamily: 'monospace' }}>Display H1 — 44px / Space Grotesk / 800</span>
                <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: '#F5F5F7' }}>
                  Autonomous Fault Correlation & Remediation
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#A3A6B3', fontFamily: 'monospace' }}>Heading H2 — 28px / Space Grotesk / 700</span>
                <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', color: '#F5F5F7' }}>
                  5-Agent Consensus Telemetry Protocol
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#A3A6B3', fontFamily: 'monospace' }}>Heading H3 — 20px / Inter / 600</span>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#F5F5F7' }}>
                  Sub-millisecond Anomaly Isolation Engine
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#A3A6B3', fontFamily: 'monospace' }}>Body Regular — 15px / Inter / 400</span>
                <p style={{ fontSize: '15px', color: '#A3A6B3', lineHeight: 1.6, maxWidth: '780px' }}>
                  Heterogeneous network telemetry is ingested from edge interfaces, correlated through neural fault
                  classifiers, and dispatched to domain-specific agent executors to synthesize verified mitigation workflows.
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#A3A6B3', fontFamily: 'monospace' }}>Technical Monospace — 13px / JetBrains Mono</span>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(8, 9, 13, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#38D9FF',
                  }}
                >
                  [NETCOOP-AGENT-ORCHESTRATOR] 2026-11-01T00:30:00Z INFO consensus_quorum=5/5 status=NOMINAL latency=18.4ms
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* FOOTER */}
        <footer
          style={{
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            color: '#A3A6B3',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="#FF7A18" />
            <span style={{ fontWeight: 600, color: '#F5F5F7' }}>NetCoop AI Platform</span>
            <span>— Phase 1 Design System Active</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Theme: OBSIDIAN EMBER</span>
            <span>WebGL 3D: Active</span>
            <span>TypeScript: Strict</span>
          </div>
        </footer>
      </PageContainer>

      {/* Fullscreen Loading Modal Demo */}
      <AnimatePresence>
        {showFullscreenLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingScreen
              fullScreen
              message="Simulating Multi-Agent Cluster Spin-up..."
              subtext="Initializing R3F GPU buffers & agent consensus channels"
              progress={84}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
