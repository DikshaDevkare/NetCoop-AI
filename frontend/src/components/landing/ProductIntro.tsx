import { motion } from 'framer-motion';
import { Network, ShieldAlert, Cpu } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading.tsx';
import { GlassCard } from '../ui/GlassCard.tsx';

export function ProductIntro() {
  const features = [
    {
      icon: Network,
      title: 'Universal Telemetry Ingestion',
      badge: 'Data Layer',
      color: '#38D9FF',
      description:
        'Continuous ingestion and parsing of heterogeneous packet captures (PCAP), NetFlow v9/IPFIX, SNMP MIB counters, and OpenTelemetry streams across distributed fabrics.',
      highlights: ['PCAP & NetFlow Parser', 'Real-Time Interface Counters', 'Sub-millisecond Time Stamping'],
    },
    {
      icon: Cpu,
      title: '5-Agent Cooperative Consensus',
      badge: 'Cognitive Engine',
      color: '#A855F7',
      description:
        'Specialized autonomous agents collaborate across performance, interface health, routing convergence, and cross-domain fault correlation to pinpoint true root causes.',
      highlights: ['Distributed Event Bus', 'No Single Point of Failure', 'Zero-Alert Fatigue Isolation'],
    },
    {
      icon: ShieldAlert,
      title: 'Explainable Remediation Runbooks',
      badge: 'Mitigation Layer',
      color: '#FF7A18',
      description:
        'Translates complex topological anomalies into plain-English root-cause explanations and verifiable configuration scripts ready for automated or human-in-the-loop dispatch.',
      highlights: ['Deterministic Runbooks', 'Interoperability Lab Verification', 'One-Click Automated Mitigation'],
    },
  ];

  return (
    <section
      id="how-it-works-intro"
      style={{
        padding: '90px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <SectionHeading
        badge="Product Foundation"
        title="A Single Pane of Glass for Autonomous Operations"
        description="Moving beyond static dashboards and noisy alerts to an active, collaborative multi-agent reasoning fabric that protects enterprise uptime."
        align="center"
        accent="orange"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginTop: '40px',
        }}
      >
        {features.map((feat, index) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
          >
            <GlassCard
              variant="default"
              hoverable
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '28px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${feat.color}40`,
                      color: feat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 16px -4px ${feat.color}40`,
                    }}
                  >
                    <feat.icon size={24} />
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: feat.color,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: `${feat.color}15`,
                      border: `1px solid ${feat.color}30`,
                    }}
                  >
                    {feat.badge}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#F5F5F7',
                    marginBottom: '12px',
                  }}
                >
                  {feat.title}
                </h3>

                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#A3A6B3', marginBottom: '24px' }}>
                  {feat.description}
                </p>
              </div>

              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {feat.highlights.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#F5F5F7',
                    }}
                  >
                    <span
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: feat.color,
                      }}
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
