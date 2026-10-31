import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Activity, ShieldCheck, Cpu, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlowButton } from '../ui/GlowButton.tsx';
import { Landing3DHero } from '../three/Landing3DHero.tsx';

export function HeroSection() {
  const metricStats = [
    { label: 'Consensus Latency', value: '18.4 ms', icon: Activity, color: '#38D9FF' },
    { label: 'Root-Cause Accuracy', value: '99.4%', icon: ShieldCheck, color: '#10B981' },
    { label: 'Specialized Agents', value: '5 Quorum', icon: Cpu, color: '#A855F7' },
    { label: 'Ingress Formats', value: 'PCAP / Flow', icon: Terminal, color: '#FFB347' },
  ];

  return (
    <section
      id="overview"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '110px',
        paddingBottom: '60px',
        overflow: 'hidden',
      }}
    >
      {/* Background Atmospheric Glows */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30%',
          right: '5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 122, 24, 0.14) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          alignItems: 'center',
          gap: '40px',
        }}
      >
        {/* Left Column: Editorial Headline & Value Proposition */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top Pill Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(25, 28, 38, 0.8)',
              border: '1px solid rgba(255, 122, 24, 0.35)',
              boxShadow: '0 0 16px -2px rgba(255, 122, 24, 0.25)',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#FF7A18',
                boxShadow: '0 0 8px #FF7A18',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#FFB347',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Agentic AI Network Intelligence Platform
            </span>
          </div>

          {/* Main Display Headline */}
          <h1
            style={{
              fontSize: 'clamp(36px, 5.5vw, 56px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.12,
              color: '#F5F5F7',
              marginBottom: '22px',
            }}
          >
            Autonomous Network Resilience Driven by{' '}
            <span className="gradient-ember-text">Cooperative AI</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.65,
              color: '#A3A6B3',
              maxWidth: '560px',
              marginBottom: '32px',
            }}
          >
            NetCoop AI coordinates five specialized autonomous agents to ingest heterogeneous telemetry,
            isolate root causes across complex topologies in milliseconds, and synthesize explainable,
            human-verified remediation workflows.
          </p>

          {/* Action CTAs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              flexWrap: 'wrap',
              marginBottom: '44px',
            }}
          >
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <GlowButton variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                Launch Command Centre (All 7 Screens)
              </GlowButton>
            </Link>

            <Link to="/design-system" style={{ textDecoration: 'none' }}>
              <GlowButton variant="secondary" size="lg" icon={Sparkles}>
                View Design System
              </GlowButton>
            </Link>
          </div>

          {/* Live Metric Ticker Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              maxWidth: '520px',
            }}
          >
            {metricStats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: 'rgba(25, 28, 38, 0.65)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: stat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <stat.icon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#F5F5F7', lineHeight: 1.2 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '11px', color: '#A3A6B3', letterSpacing: '0.02em' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Interactive 3D Quantum Network Hub */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', width: '100%', height: '100%' }}
        >
          {/* Glass Specular Halo Backing */}
          <div
            style={{
              position: 'absolute',
              inset: '10%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 122, 24, 0.08) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 75%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          <Landing3DHero />

          {/* Floating Context Label */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              padding: '8px 14px',
              borderRadius: '9999px',
              background: 'rgba(8, 9, 13, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 179, 71, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              color: '#FFB347',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#FF7A18',
                boxShadow: '0 0 8px #FF7A18',
              }}
            />
            <span>Interactive 3D Neural Nexus • Real-Time WebGL</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
