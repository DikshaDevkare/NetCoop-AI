import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { GlowButton } from '../../components/ui/GlowButton.tsx';
import { FileUploadPanel } from '../../components/ui/FileUploadPanel.tsx';
import {
  Activity,
  Split,
  Globe,
  Cpu,
  Wifi,
  Sliders,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export function NewDiagnosisPage() {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [selectedScenario, setSelectedScenario] = useState('congestion');
  const [isRunning, setIsRunning] = useState(false);

  const scenarios = [
    {
      id: 'congestion',
      title: 'Network Congestion',
      desc: 'High bandwidth utilization, buffer queue drops, packet latency spikes.',
      icon: Activity,
    },
    {
      id: 'interface',
      title: 'Link / Interface Failure',
      desc: 'Flapping optics, CRC transmission errors, unreachability.',
      icon: Split,
    },
    {
      id: 'dns',
      title: 'DNS / DHCP Failure',
      desc: 'Pool exhaustion, query timeouts, gateway resolution drops.',
      icon: Globe,
    },
    {
      id: 'overload',
      title: 'Device Overload',
      desc: 'High ASIC temperature, memory leak, line-card CPU saturation.',
      icon: Cpu,
    },
    {
      id: 'wifi',
      title: 'Wi-Fi Signal Issue',
      desc: 'Co-channel interference, rogue SSID broadcast, roaming disconnects.',
      icon: Wifi,
    },
    {
      id: 'custom',
      title: 'Custom Scenario',
      desc: 'Specify multi-layer hybrid fault injection parameters.',
      icon: Sliders,
    },
  ];

  const handleRunDiagnosis = async () => {
    setIsRunning(true);
    setActiveStep(4);
    await new Promise((r) => setTimeout(r, 1200));
    navigate('/incident-details');
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Header & 4-Step Progress Bar (Exact Reference Match) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F5F5F7', marginBottom: '4px', letterSpacing: '-0.02em' }}>
              Start a New Network Diagnosis
            </h1>
            <p style={{ fontSize: '13px', color: '#A3A6B3' }}>
              Select a scenario, upload telemetry and launch a multi-agent investigation.
            </p>
          </div>

          {/* 4-Step Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(25, 28, 38, 0.7)',
              padding: '8px 16px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {[
              { num: 1, label: 'Scenario' },
              { num: 2, label: 'Telemetry' },
              { num: 3, label: 'Validate' },
              { num: 4, label: 'Run' },
            ].map((step, idx) => (
              <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: activeStep >= step.num ? '#FF7A18' : '#2A2E3D',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: activeStep >= step.num ? '0 0 10px rgba(255, 122, 24, 0.5)' : 'none',
                  }}
                >
                  {step.num}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: activeStep >= step.num ? 600 : 500,
                    color: activeStep >= step.num ? '#F5F5F7' : '#6A6D7C',
                  }}
                >
                  {step.label}
                </span>
                {idx < 3 && <span style={{ color: '#3A3E4D', margin: '0 4px' }}>—</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid: 6 Scenarios on Left, File Upload on Right (Exact Reference Match) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '24px' }}>
          {/* Choose Diagnostic Scenario */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F5F5F7', marginBottom: '14px' }}>
              Choose Diagnostic Scenario
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {scenarios.map((sc) => {
                const isSelected = selectedScenario === sc.id;
                const IconComponent = sc.icon;
                return (
                  <div
                    key={sc.id}
                    onClick={() => {
                      setSelectedScenario(sc.id);
                      setActiveStep(2);
                    }}
                    style={{
                      padding: '18px 14px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'rgba(255, 122, 24, 0.1)' : 'rgba(25, 28, 38, 0.65)',
                      border: isSelected ? '1px solid #FF7A18' : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isSelected ? '0 0 20px rgba(255, 122, 24, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: isSelected ? '#FF7A18' : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#FFFFFF' : '#A3A6B3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isSelected ? '0 0 14px rgba(255, 122, 24, 0.5)' : 'none',
                      }}
                    >
                      <IconComponent size={20} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#F5F5F7' }}>
                      {sc.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: File Upload Panel */}
          <div>
            <FileUploadPanel onFilesChange={() => setActiveStep(3)} />
          </div>
        </div>

        {/* Bottom Bar: Data Validation + Run Diagnosis (Exact Reference Match) */}
        <GlassCard
          variant="default"
          style={{
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Data Validation Checkpoints */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#A3A6B3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Data Validation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>Schema compatible</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>Required fields present</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>No missing telemetry</span>
              </div>
            </div>
          </div>

          {/* Glowing Orange Run Diagnosis Button */}
          <GlowButton
            variant="primary"
            size="lg"
            onClick={handleRunDiagnosis}
            loading={isRunning}
            icon={ArrowRight}
            iconPosition="right"
            style={{
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            {isRunning ? 'Synthesizing...' : 'Run Diagnosis'}
          </GlowButton>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
