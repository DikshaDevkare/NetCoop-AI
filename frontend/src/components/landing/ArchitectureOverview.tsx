import { useState } from 'react';
import {
  Activity,
  Cpu,
  Radio,
  Zap,
  FileText,
  Workflow,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading.tsx';
import { GlassCard } from '../ui/GlassCard.tsx';

export function ArchitectureOverview() {
  const [selectedAgent, setSelectedAgent] = useState<string>('agent-1');

  const agents = [
    {
      id: 'agent-1',
      name: 'Performance Agent',
      icon: Activity,
      color: '#A855F7',
      role: 'Telemetry Ingestion & Latency Analysis',
      status: 'Online (Nominal)',
      metrics: 'Analyzes packet jitter, throughput variance, and inter-packet arrival drift.',
      recentLog: '[PerfAgent] Interface ge-0/0/1 jitter elevated (+14ms) vs baseline (2.1ms).',
      capabilities: ['Sub-millisecond latency tracking', 'Throughput anomaly detection', 'Queue saturation warning'],
    },
    {
      id: 'agent-2',
      name: 'Infrastructure Health Agent',
      icon: Cpu,
      color: '#10B981',
      role: 'Hardware & Interface Telemetry',
      status: 'Online (Nominal)',
      metrics: 'Monitors ASIC temperatures, line-card CPU load, memory exhaustion, and interface cyclic redundancy errors.',
      recentLog: '[InfraAgent] SW-03 CPU utilization at 78%, queue drops: 34 packets/sec.',
      capabilities: ['Hardware component health', 'Buffer exhaustion detection', 'Interface error monitoring'],
    },
    {
      id: 'agent-3',
      name: 'Connectivity Analysis Agent',
      icon: Radio,
      color: '#38D9FF',
      role: 'Routing & Topology Convergence',
      status: 'Online (Nominal)',
      metrics: 'Evaluates BGP peer stability, OSPF link-state updates, and path reachability across heterogeneous ASNs.',
      recentLog: '[ConnAgent] BGP session with peer 192.168.10.1 converged; path stable.',
      capabilities: ['BGP route flap tracking', 'Topological convergence scoring', 'Multipath ECMP validation'],
    },
    {
      id: 'agent-4',
      name: 'Fault Correlation Agent',
      icon: Zap,
      color: '#FF7A18',
      role: 'Cross-Domain Root-Cause Deduction',
      status: 'Active (Correlating)',
      metrics: 'Correlates concurrent signals across Performance, Hardware, and Connectivity layers using causal graph models.',
      recentLog: '[FaultCorrelator] Correlated high latency + queue drops to single uplink port.',
      capabilities: ['Graph-based causal modeling', 'Symptom de-duplication', 'Probable root-cause ranking'],
    },
    {
      id: 'agent-5',
      name: 'Recommendation & Reporting Agent',
      icon: FileText,
      color: '#FFB347',
      role: 'Actionable Runbooks & Reports',
      status: 'Online (Nominal)',
      metrics: 'Generates human-understandable mitigation procedures, rate-limiting scripts, and exportable PDF/JSON evidence reports.',
      recentLog: '[Recommender] Synthesized QoS policy recommendation for SW-03.',
      capabilities: ['Automated remediation scripts', 'Executive diagnosis reports', 'Pre-flight safety validation'],
    },
  ];

  const currentAgent = agents.find((a) => a.id === selectedAgent) || agents[0];

  return (
    <section
      id="architecture"
      style={{
        padding: '90px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <SectionHeading
        badge="Multi-Agent Consensus"
        title="Five Specialized Agents Coordinated by a Central Orchestrator"
        description="Unlike single monolithic models, NetCoop AI deploys five distinct autonomous agents that cross-examine findings across isolated domains."
        align="center"
        accent="violet"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          marginTop: '44px',
        }}
      >
        {/* Left Column: 5 Agent Selector Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {agents.map((agent) => {
            const isSelected = agent.id === selectedAgent;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                style={{
                  background: isSelected ? 'rgba(25, 28, 38, 0.9)' : 'rgba(17, 19, 26, 0.6)',
                  backdropFilter: 'blur(16px)',
                  border: isSelected ? `1px solid ${agent.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isSelected ? `0 0 24px -4px ${agent.color}45` : 'none',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: `${agent.color}15`,
                      color: agent.color,
                      border: `1px solid ${agent.color}35`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <agent.icon size={20} />
                  </div>

                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#F5F5F7', marginBottom: '2px' }}>
                      {agent.name}
                    </h4>
                    <span style={{ fontSize: '12px', color: '#A3A6B3' }}>{agent.role}</span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: agent.color,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background: `${agent.color}15`,
                    border: `1px solid ${agent.color}30`,
                  }}
                >
                  {agent.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Column: Central Orchestrator & Live Thought Inspector */}
        <div>
          <GlassCard variant="elevated" style={{ padding: '32px', height: '100%' }}>
            {/* Orchestrator Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #FF9436, #FF7A18)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 14px rgba(255, 122, 24, 0.5)',
                  }}
                >
                  <Workflow size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#F5F5F7' }}>Central Orchestrator</h4>
                  <span style={{ fontSize: '11px', color: '#FFB347' }}>Neural Dispatch & Consensus Fabric</span>
                </div>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                <span>5 / 5 Quorum Locked</span>
              </div>
            </div>

            {/* Selected Agent In-Depth Insight */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <currentAgent.icon size={20} color={currentAgent.color} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: currentAgent.color }}>
                  {currentAgent.name}
                </h3>
              </div>
              <p style={{ fontSize: '14px', color: '#A3A6B3', lineHeight: 1.6, marginBottom: '16px' }}>
                {currentAgent.metrics}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentAgent.capabilities.map((cap) => (
                  <div
                    key={cap}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: '#F5F5F7',
                    }}
                  >
                    <Sparkles size={14} color={currentAgent.color} />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Message Bus Stream */}
            <div
              style={{
                background: '#08090D',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: '#A3A6B3',
                  marginBottom: '10px',
                  fontFamily: 'monospace',
                }}
              >
                <Terminal size={14} color="#FF7A18" />
                <span>AGENT_COMMUNICATION_BUS • LIVE</span>
              </div>

              <div
                style={{
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  fontSize: '12px',
                  color: currentAgent.color,
                  lineHeight: 1.5,
                }}
              >
                {currentAgent.recentLog}
              </div>
              <div
                style={{
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  fontSize: '11px',
                  color: '#6A6D7C',
                  marginTop: '6px',
                }}
              >
                &gt; Handshake verified • Dispatched to Fault Correlation Agent via IPC socket.
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
