import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { Layers } from 'lucide-react';

export function InteropLabPage() {
  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F5F5F7', marginBottom: '4px' }}>
            Interoperability Lab
          </h1>
          <p style={{ fontSize: '13px', color: '#A3A6B3' }}>
            Test agent protocols, validate messages and ensure compatibility.
          </p>
        </div>

        <GlassCard variant="default" style={{ padding: '36px', textAlign: 'center' }}>
          <Layers size={36} color="#38D9FF" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F5F5F7', marginBottom: '8px' }}>
            Phase 5: Interoperability Lab In Progress
          </h3>
          <p style={{ fontSize: '13px', color: '#A3A6B3', maxWidth: '520px', margin: '0 auto' }}>
            Message builder, JSON syntax editor, and compatibility test bench will be populated in Phase 5.
          </p>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
