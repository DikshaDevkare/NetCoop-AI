import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { Users } from 'lucide-react';

export function AgentMonitorPage() {
  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F5F5F7', marginBottom: '4px' }}>
            Multi-Agent Orchestration
          </h1>
          <p style={{ fontSize: '13px', color: '#A3A6B3' }}>
            Five specialized agents collaborating for root cause analysis.
          </p>
        </div>

        <GlassCard variant="default" style={{ padding: '36px', textAlign: 'center' }}>
          <Users size={36} color="#A855F7" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F5F5F7', marginBottom: '8px' }}>
            Phase 4: Multi-Agent Orchestration In Progress
          </h3>
          <p style={{ fontSize: '13px', color: '#A3A6B3', maxWidth: '520px', margin: '0 auto' }}>
            Central orchestrator, 5-agent halo, animated communication paths, and execution timeline will be populated in Phase 4.
          </p>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
