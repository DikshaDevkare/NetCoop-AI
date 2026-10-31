import { motion } from 'framer-motion';
import {
  Layers,
  UploadCloud,
  Search,
  Cpu,
  FileCheck2,
  Code2,
} from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading.tsx';
import { GlassCard } from '../ui/GlassCard.tsx';

export function CapabilitiesSection() {
  const capabilities = [
    {
      title: 'Real-Time 3D Topology Command Centre',
      screen: 'Module 01 • Command Centre',
      icon: Layers,
      color: '#FF7A18',
      description:
        'Live isometric 3D canvas displaying core routers, satellite switches, device health signals, and real-time packet throughput streams.',
      badge: 'Interactive 3D WebGL',
    },
    {
      title: 'Multi-Step Diagnostic Setup Wizard',
      screen: 'Module 02 • New Diagnosis',
      icon: UploadCloud,
      color: '#38D9FF',
      description:
        'Seamless 4-step workflow (Scenario, Telemetry, Validate, Run) supporting PCAP, CSV, JSON, and NetFlow drag-and-drop ingest.',
      badge: 'Scenario Ingestion',
    },
    {
      title: 'Incident Investigation & Affected Subnets',
      screen: 'Module 03 • Incident Details',
      icon: Search,
      color: '#FF4D4D',
      description:
        'Deep-dive into network bottlenecks, interface queue drops, degraded building routers, and link saturation trends.',
      badge: 'Root-Cause Triage',
    },
    {
      title: 'Autonomous Multi-Agent Orchestration',
      screen: 'Module 04 • Agent Monitor',
      icon: Cpu,
      color: '#A855F7',
      description:
        'Five specialized agents in pentagonal orbit exchanging live messages, consensus votes, and real-time execution timestamps.',
      badge: '5-Agent Quorum',
    },
    {
      title: 'Evidence Correlation & Confidence Graphs',
      screen: 'Module 05 • Diagnosis Report',
      icon: FileCheck2,
      color: '#10B981',
      description:
        'Flowing animated correlation lines connecting telemetry indicators to probable root-causes, paired with verified remediation runbooks.',
      badge: 'Explainable AI',
    },
    {
      title: 'Protocol Interoperability & Compatibility Lab',
      screen: 'Module 07 • Interop Lab',
      icon: Code2,
      color: '#FFB347',
      description:
        'In-browser message builder, JSON schema validator, and live protocol compatibility test bench for multi-vendor network equipment.',
      badge: 'Protocol Lab',
    },
  ];

  return (
    <section
      id="capabilities"
      style={{
        padding: '90px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <SectionHeading
        badge="Platform Suite"
        title="Comprehensive Capabilities for Modern Networks"
        description="Every screen in NetCoop AI is precision-engineered to provide actionable technical depth without operational friction."
        align="center"
        accent="cyan"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          marginTop: '44px',
        }}
      >
        {capabilities.map((cap, index) => (
          <motion.div
            key={cap.title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <GlassCard variant="default" hoverable style={{ padding: '26px', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: `${cap.color}15`,
                    color: cap.color,
                    border: `1px solid ${cap.color}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <cap.icon size={22} />
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: cap.color,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background: `${cap.color}15`,
                    border: `1px solid ${cap.color}30`,
                  }}
                >
                  {cap.badge}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#A3A6B3', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' }}>
                {cap.screen}
              </div>

              <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#F5F5F7', marginBottom: '10px' }}>
                {cap.title}
              </h4>

              <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#A3A6B3' }}>
                {cap.description}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
