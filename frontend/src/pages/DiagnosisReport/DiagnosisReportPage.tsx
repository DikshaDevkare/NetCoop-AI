import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { FileText } from 'lucide-react';

export function DiagnosisReportPage() {
  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F5F5F7', marginBottom: '4px' }}>
            Diagnosis Report — Evidence & Insights
          </h1>
          <p style={{ fontSize: '13px', color: '#A3A6B3' }}>
            Root cause deduction, confidence metrics, and recommended actions.
          </p>
        </div>

        <GlassCard variant="default" style={{ padding: '36px', textAlign: 'center' }}>
          <FileText size={36} color="#10B981" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F5F5F7', marginBottom: '8px' }}>
            Phase 5: Diagnosis Report In Progress
          </h3>
          <p style={{ fontSize: '13px', color: '#A3A6B3', maxWidth: '520px', margin: '0 auto' }}>
            Probable root cause, animated evidence correlation graph, and executable runbooks will be populated in Phase 5.
          </p>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
