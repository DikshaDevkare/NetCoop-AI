import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { FilePlus } from 'lucide-react';

export function NewDiagnosisPage() {
  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F5F5F7', marginBottom: '4px' }}>
            Start a New Network Diagnosis
          </h1>
          <p style={{ fontSize: '13px', color: '#A3A6B3' }}>
            Select a scenario, upload telemetry and launch a multi-agent investigation.
          </p>
        </div>

        <GlassCard variant="default" style={{ padding: '36px', textAlign: 'center' }}>
          <FilePlus size={36} color="#FF7A18" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F5F5F7', marginBottom: '8px' }}>
            Phase 3: Investigation Setup Wizard In Progress
          </h3>
          <p style={{ fontSize: '13px', color: '#A3A6B3', maxWidth: '520px', margin: '0 auto' }}>
            Scenario selection, drag-and-drop file upload, and 4-step workflow will be populated in Phase 3.
          </p>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
