import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Network, Zap, CheckCircle2, Terminal } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading.tsx';
import { GlassCard } from '../ui/GlassCard.tsx';

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      title: '1. Ingest Telemetry & Scenarios',
      icon: UploadCloud,
      color: '#38D9FF',
      summary: 'Raw network telemetry captured across edge routers and data centres is uploaded or streamed into NetCoop.',
      input: 'PCAP traces, NetFlow records, SNMP interface traps, topology JSON',
      agentAction: 'Validates schema, normalizes time-series data, and establishes baseline telemetry vectors.',
      output: 'Normalized telemetry tensors dispatched to agent message bus.',
      codeSample: `{
  "scenario": "Network Congestion",
  "device": "SW-03 (Building A)",
  "metrics": {
    "bandwidth_mbps": 312,
    "latency_ms": 24.8,
    "queue_drops": 34,
    "interface_errors": 126
  }
}`,
    },
    {
      id: 1,
      title: '2. Parallel Multi-Agent Investigation',
      icon: Network,
      color: '#A855F7',
      summary: 'Five specialized agents inspect distinct operational domains simultaneously without cross-agent lockouts.',
      input: 'Domain slices: Latency/Jitter (Perf Agent), CPU/Memory (Infra Agent), BGP (Conn Agent)',
      agentAction: 'Each agent executes targeted anomaly evaluation routines against learned topological thresholds.',
      output: 'Five structured evidence reports submitted to the Fault Correlation Agent.',
      codeSample: `// Agent Execution Quorum
[PerfAgent]  High CPU & Queue Drops flagged on SW-03
[InfraAgent] Memory 64%, CPU 78%, Uplink saturated
[ConnAgent]  BGP peer 10.2.14.1 stable, RTT +18ms delay
[Quorum]     4 of 5 agents report anomalies on Building A`,
    },
    {
      id: 2,
      title: '3. Fault Correlation & Root Cause Deduction',
      icon: Zap,
      color: '#FF7A18',
      summary: 'The Fault Correlation Agent evaluates cross-agent evidence to compute the single probable root cause.',
      input: 'Correlated evidence: High bandwidth (0.12), Increased latency (0.76), Interface errors (0.64)',
      agentAction: 'Weights topological distance and timestamp alignment to eliminate downstream symptom false positives.',
      output: 'Root-cause incident report with 87% confidence rating.',
      codeSample: `{
  "incident_id": "INC-1024",
  "probable_root_cause": "Interface congestion on SW-03",
  "confidence": 0.87,
  "affected_scope": ["Building A", "Branch Router"],
  "primary_bottleneck": "Uplink ge-0/0/1 queue exhaustion"
}`,
    },
    {
      id: 3,
      title: '4. Actionable Mitigation & Lab Verification',
      icon: CheckCircle2,
      color: '#10B981',
      summary: 'Recommendation & Reporting Agent synthesizes precise, executable configuration remediation commands.',
      input: 'Root cause isolation report and router OS hardware profile',
      agentAction: 'Generates QoS policy scripts, verifies protocol compatibility via Interoperability Lab, and alerts ops.',
      output: 'Automated or human-in-the-loop approved CLI remediation runbook.',
      codeSample: `// Executable Remediation Script
policy-map AUTO_QOS_REMEDY_SW03
  class HIGH_PRIORITY_VOIP
    priority percent 30
  class BULK_TRAFFIC
    bandwidth remaining percent 50
    random-detect
interface ge-0/0/1
  service-policy output AUTO_QOS_REMEDY_SW03
// Status: Ready for verification in Interop Lab`,
    },
  ];

  const current = steps[activeStep];

  return (
    <section
      id="how-it-works"
      style={{
        padding: '90px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <SectionHeading
        badge="Execution Lifecycle"
        title="From Telemetry Anomaly to Verified Resolution"
        description="Explore how NetCoop AI ingests, investigates, correlates, and resolves complex multi-domain network faults in seconds."
        align="center"
        accent="amber"
      />

      {/* Step Selector Pills */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
          marginTop: '40px',
          marginBottom: '32px',
        }}
      >
        {steps.map((st) => {
          const isActive = activeStep === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setActiveStep(st.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                borderRadius: '12px',
                background: isActive ? 'rgba(25, 28, 38, 0.9)' : 'rgba(17, 19, 26, 0.6)',
                border: isActive ? `1px solid ${st.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isActive ? `0 0 20px -4px ${st.color}50` : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${st.color}15`,
                  color: st.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <st.icon size={18} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isActive ? '#F5F5F7' : '#A3A6B3',
                    display: 'block',
                  }}
                >
                  {st.title}
                </span>
                <span style={{ fontSize: '11px', color: '#6A6D7C' }}>Phase 0{st.id + 1}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Deep-Dive Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35 }}
        >
          <GlassCard variant="elevated" style={{ padding: '36px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '36px',
                alignItems: 'center',
              }}
            >
              {/* Left Detail Column */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: current.color,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: `${current.color}15`,
                      border: `1px solid ${current.color}35`,
                    }}
                  >
                    Active Phase Architecture
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#F5F5F7',
                    marginBottom: '14px',
                  }}
                >
                  {current.title}
                </h3>

                <p style={{ fontSize: '15px', color: '#A3A6B3', lineHeight: 1.6, marginBottom: '24px' }}>
                  {current.summary}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: 'rgba(8, 9, 13, 0.5)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#FFB347', display: 'block', marginBottom: '4px' }}>
                      TELEMETRY INPUTS
                    </span>
                    <span style={{ fontSize: '13px', color: '#F5F5F7' }}>{current.input}</span>
                  </div>

                  <div style={{ background: 'rgba(8, 9, 13, 0.5)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: current.color, display: 'block', marginBottom: '4px' }}>
                      AGENT REASONING ACTION
                    </span>
                    <span style={{ fontSize: '13px', color: '#F5F5F7' }}>{current.agentAction}</span>
                  </div>

                  <div style={{ background: 'rgba(8, 9, 13, 0.5)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', display: 'block', marginBottom: '4px' }}>
                      SYNTHESIZED DELIVERABLE
                    </span>
                    <span style={{ fontSize: '13px', color: '#F5F5F7' }}>{current.output}</span>
                  </div>
                </div>
              </div>

              {/* Right Code/Telemetry Artifact Preview */}
              <div
                style={{
                  background: '#08090D',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: `0 12px 32px -4px rgba(0, 0, 0, 0.7), 0 0 20px -4px ${current.color}25`,
                  overflow: 'hidden',
                }}
              >
                {/* Code Terminal Top Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(25, 28, 38, 0.5)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={14} color={current.color} />
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#A3A6B3' }}>
                      netcoop_stream_inspector.json
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF4D4D' }} />
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFB347' }} />
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                  </div>
                </div>

                <pre
                  style={{
                    padding: '20px',
                    margin: 0,
                    fontFamily: '"JetBrains Mono", Consolas, monospace',
                    fontSize: '12px',
                    lineHeight: 1.6,
                    color: '#38D9FF',
                    overflowX: 'auto',
                    whiteSpace: 'pre',
                  }}
                >
                  {current.codeSample}
                </pre>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
