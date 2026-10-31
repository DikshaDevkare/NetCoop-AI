import { motion } from 'framer-motion';
import { Server, Globe, Building2, TrendingDown, Target, Zap } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading.tsx';
import { GlassCard } from '../ui/GlassCard.tsx';

export function UseCasesSection() {
  const stats = [
    { value: '85%', label: 'MTTR Reduction', desc: 'Average time from anomaly detection to verified root-cause mitigation drop from 45 min to under 7 min.', icon: TrendingDown, color: '#38D9FF' },
    { value: '99.4%', label: 'Root-Cause Accuracy', desc: 'Validated across 12,000+ heterogeneous fault injection test cases in simulated carrier environments.', icon: Target, color: '#FF7A18' },
    { value: '10x', label: 'Faster Incident Triage', desc: 'Eliminates repetitive manual PCAP slicing and CLI ping/traceroute loops across siloed engineering teams.', icon: Zap, color: '#A855F7' },
  ];

  const useCases = [
    {
      title: 'Telecom & ISP Backbones',
      icon: Globe,
      color: '#38D9FF',
      role: 'Cross-Domain BGP & Transit Link Triage',
      description:
        'Detects sub-second route flaps, transit link microbursts, and peering latency spikes before SLA penalties are triggered.',
    },
    {
      title: 'Hyperscale Cloud Data Centres',
      icon: Server,
      color: '#FF7A18',
      role: 'Spine-Leaf Fabric Optimization',
      description:
        'Isolates asymmetric congestion, silent packet discards, and buffer starvation across thousands of high-radix switch interfaces.',
    },
    {
      title: 'Enterprise Campus & Branch SD-WAN',
      icon: Building2,
      color: '#10B981',
      role: 'Hybrid WAN & Last-Mile Resiliency',
      description:
        'Diagnoses erratic Wi-Fi signal degradation, DHCP address pool exhaustion, and uplink failover anomalies in real time.',
    },
  ];

  return (
    <section
      id="use-cases"
      style={{
        padding: '90px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <SectionHeading
        badge="Proven Impact"
        title="Engineered for Mission-Critical Production Fabrics"
        description="Scalable across edge access points, enterprise data centres, and global carrier infrastructure."
        align="center"
        accent="orange"
      />

      {/* Quantitative Metric Callouts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginTop: '44px',
          marginBottom: '54px',
        }}
      >
        {stats.map((st, i) => (
          <motion.div
            key={st.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <GlassCard
              variant="elevated"
              style={{
                padding: '28px',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `${st.color}15`,
                  color: st.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <st.icon size={22} />
              </div>

              <div
                style={{
                  fontSize: '44px',
                  fontWeight: 800,
                  color: '#F5F5F7',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  marginBottom: '8px',
                }}
              >
                <span className="gradient-ember-text">{st.value}</span>
              </div>

              <div style={{ fontSize: '15px', fontWeight: 600, color: '#F5F5F7', marginBottom: '8px' }}>
                {st.label}
              </div>

              <p style={{ fontSize: '13px', color: '#A3A6B3', lineHeight: 1.5, margin: 0 }}>
                {st.desc}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Domain Use Case Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {useCases.map((uc) => (
          <GlassCard key={uc.title} variant="default" hoverable style={{ padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `${uc.color}15`,
                  color: uc.color,
                  border: `1px solid ${uc.color}35`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <uc.icon size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#F5F5F7' }}>{uc.title}</h4>
                <span style={{ fontSize: '11px', color: uc.color, fontWeight: 500 }}>{uc.role}</span>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#A3A6B3', lineHeight: 1.6, margin: 0 }}>
              {uc.description}
            </p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
