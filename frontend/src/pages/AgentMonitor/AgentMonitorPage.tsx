import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { OrchestrationDiagram } from '../../components/agents/OrchestrationDiagram.tsx';
import { CheckCircle2, Clock, Terminal } from 'lucide-react';

export function AgentMonitorPage() {
  const [selectedAgentName, setSelectedAgentName] = useState<string>('Performance Agent');

  const timelineSteps = [
    { title: 'Orchestrator initialized', time: '14:02:11', status: 'done' },
    { title: 'Performance Agent analysis', time: '14:02:18', status: 'done' },
    { title: 'Infrastructure analysis', time: '14:02:24', status: 'done' },
    { title: 'Connectivity analysis', time: '14:02:29', status: 'done' },
    { title: 'Fault correlation (running)', time: 'Active', status: 'running' },
    { title: 'Generating recommendation', time: 'Pending', status: 'pending' },
  ];

  const liveMessages = [
    { source: 'PerfAgent', text: 'High CPU on SW-03 detected', color: '#A855F7' },
    { source: 'ConnAgent', text: 'Increased queuing delay on uplink ge-0/0/1', color: '#38D9FF' },
    { source: 'CorrAgent', text: 'Correlating evidence across Building A...', color: '#FF7A18' },
    { source: 'InfraAgent', text: 'Queue drop counter incrementing +34/s', color: '#10B981' },
  ];

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title Header */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F5F5F7', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Multi-Agent Orchestration
          </h1>
          <p style={{ fontSize: '13px', color: '#A3A6B3' }}>
            Five specialized agents collaborating for root cause analysis.
          </p>
        </div>

        {/* 2-Column Split: Orchestration Canvas on Left, Execution Timeline on Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 320px',
            gap: '20px',
            alignItems: 'start',
          }}
          className="agent-monitor-grid"
        >
          {/* Main Pentagonal 3D Orchestration Diagram */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <OrchestrationDiagram onSelectAgent={(agent) => setSelectedAgentName(agent.name)} />
            <div style={{ fontSize: '12px', color: '#A855F7' }}>
              Active agent focus: <strong>{selectedAgentName}</strong>
            </div>
          </div>

          {/* Right Column: Execution Timeline + Live Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Top: Execution Timeline Card (Exact Reference Match) */}
            <GlassCard variant="default" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7' }}>Execution Timeline</h3>
                <span style={{ fontSize: '11px', color: '#FFB347' }}>14:02 UTC</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {timelineSteps.map((step) => (
                  <div key={step.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {step.status === 'done' ? (
                        <CheckCircle2 size={14} color="#10B981" />
                      ) : step.status === 'running' ? (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF7A18', boxShadow: '0 0 6px #FF7A18' }} />
                      ) : (
                        <Clock size={14} color="#6A6D7C" />
                      )}
                      <span style={{ color: step.status === 'done' ? '#F5F5F7' : step.status === 'running' ? '#FFB347' : '#6A6D7C', fontWeight: step.status === 'running' ? 600 : 400 }}>
                        {step.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#A3A6B3' }}>
                      {step.time}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Bottom: Live Messages Card (Exact Reference Match) */}
            <GlassCard variant="default" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                <Terminal size={14} color="#FF7A18" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7' }}>Live Messages</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {liveMessages.map((msg, i) => (
                  <div key={i} style={{ fontSize: '12px', lineHeight: 1.5, fontFamily: '"JetBrains Mono", Consolas, monospace' }}>
                    <span style={{ color: msg.color, fontWeight: 700 }}>&gt; [{msg.source}] </span>
                    <span style={{ color: '#F5F5F7' }}>{msg.text}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
