import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { AgentOrbitScene } from '../../components/three/AgentOrbitScene.tsx';
import { ExecutionTimeline } from '../../components/agents/ExecutionTimeline.tsx';
import { Terminal } from 'lucide-react';

export function AgentMonitorPage() {
  const [selectedAgentName, setSelectedAgentName] = useState<string>('Performance Agent');

  const liveMessages = [
    { source: 'PerfAgent', text: 'High CPU on SW-03', color: '#A855F7' },
    { source: 'ConnAgent', text: 'Increased queuing delay', color: '#38D9FF' },
    { source: 'CorrAgent', text: 'Correlating evidence...', color: '#FF7A18' },
  ];

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title Header (Exact Reference Match) */}
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
          {/* Main Radial 5-Agent 3D Orchestration Diagram */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AgentOrbitScene onSelectAgent={(agent) => setSelectedAgentName(agent.name)} />
            <div style={{ fontSize: '12px', color: '#9A45FF' }}>
              Active agent focus: <strong>{selectedAgentName}</strong>
            </div>
          </div>

          {/* Right Column: Execution Timeline + Live Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Top: Execution Timeline Card (Exact Reference Match) */}
            <ExecutionTimeline />

            {/* Bottom: Live Messages Card (Exact Reference Match) */}
            <GlassCard variant="default" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                <Terminal size={14} color="#FF7A18" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7' }}>Live Messages</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {liveMessages.map((msg, i) => (
                  <div key={i} style={{ fontSize: '12px', lineHeight: 1.5, fontFamily: 'monospace' }}>
                    <span style={{ color: msg.color, fontWeight: 700 }}>[{msg.source}] </span>
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
