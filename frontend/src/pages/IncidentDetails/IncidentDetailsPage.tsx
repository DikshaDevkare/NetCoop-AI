import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { AlertTriangle } from 'lucide-react';

export function IncidentDetailsPage() {
  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F5F5F7', marginBottom: '4px' }}>
            Incident Details — Network Investigation
          </h1>
          <p style={{ fontSize: '13px', color: '#A3A6B3' }}>
            Interactive building topology, interface queues, and link saturation triage.
          </p>
        </div>

        <GlassCard variant="default" style={{ padding: '36px', textAlign: 'center' }}>
          <AlertTriangle size={36} color="#FF7A18" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F5F5F7', marginBottom: '8px' }}>
            Phase 4: Network Investigation In Progress
          </h3>
          <p style={{ fontSize: '13px', color: '#A3A6B3', maxWidth: '520px', margin: '0 auto' }}>
            Interactive topology, device details, and telemetry tabs will be populated in Phase 4.
          </p>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
