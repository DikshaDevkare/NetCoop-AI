import { GlassCard } from '../ui/GlassCard.tsx';
import { Cpu, Database, Activity } from 'lucide-react';
import type { AgentNodeConfig } from './AgentOrchestration3D.tsx';

interface AgentStatusCardProps {
  agent: AgentNodeConfig;
}

export function AgentStatusCard({ agent }: AgentStatusCardProps) {
  return (
    <GlassCard variant="default" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: agent.color,
              boxShadow: `0 0 10px ${agent.color}`,
            }}
          />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F5F5F7' }}>{agent.name}</h3>
        </div>
        <span
          style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: `${agent.color}25`,
            color: agent.color,
            fontWeight: 700,
            border: `1px solid ${agent.color}50`,
          }}
        >
          {agent.status.toUpperCase()}
        </span>
      </div>

      <p style={{ fontSize: '12px', color: '#A3A6B3', marginBottom: '16px', lineHeight: 1.5 }}>
        {agent.role}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#A3A6B3', fontSize: '11px', marginBottom: '2px' }}>
            <Cpu size={12} />
            <span>CPU</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#F5F5F7' }}>18%</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#A3A6B3', fontSize: '11px', marginBottom: '2px' }}>
            <Database size={12} />
            <span>Memory</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#F5F5F7' }}>340 MB</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#A3A6B3', fontSize: '11px', marginBottom: '2px' }}>
            <Activity size={12} />
            <span>Latency</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>4.2 ms</div>
        </div>
      </div>
    </GlassCard>
  );
}
