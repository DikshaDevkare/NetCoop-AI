import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { Clock } from 'lucide-react';

export function IncidentHistoryPage() {
  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F5F5F7', marginBottom: '4px' }}>
            Incident History
          </h1>
          <p style={{ fontSize: '13px', color: '#A3A6B3' }}>
            Search, filter and analyze past network incidents.
          </p>
        </div>

        <GlassCard variant="default" style={{ padding: '36px', textAlign: 'center' }}>
          <Clock size={36} color="#FF7A18" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F5F5F7', marginBottom: '8px' }}>
            Phase 5: Incident History In Progress
          </h3>
          <p style={{ fontSize: '13px', color: '#A3A6B3', maxWidth: '520px', margin: '0 auto' }}>
            Incident trend chart, root cause donut distribution, and interactive table will be populated in Phase 5.
          </p>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
