import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { GlowButton } from '../../components/ui/GlowButton.tsx';
import {
  Activity,
  Split,
  Globe,
  Cpu,
  Wifi,
  Sliders,
  UploadCloud,
  CheckCircle2,
  FileText,
  ArrowRight,
  Trash2,
} from 'lucide-react';

interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

export function NewDiagnosisPage() {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [selectedScenario, setSelectedScenario] = useState('congestion');
  const [isRunning, setIsRunning] = useState(false);

  const [files, setFiles] = useState<UploadedFile[]>([
    { name: 'site-a_telemetry.csv', size: '2.4 MB', type: 'CSV Telemetry' },
    { name: 'interfaces.json', size: '532 KB', type: 'SNMP Interfaces' },
    { name: 'topology.json', size: '1.1 MB', type: 'BGP Graph' },
  ]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: UploadedFile[] = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type: 'Telemetry Ingress',
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRunDiagnosis = async () => {
    setIsRunning(true);
    setActiveStep(4);
    await new Promise((r) => setTimeout(r, 1400));
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
              padding: '6px 16px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {[
              { num: 1, label: 'Scenario' },
              { num: 2, label: 'Telemetry' },
              { num: 3, label: 'Validate' },
              { num: 4, label: 'Run' },
            ].map((st, i) => {
              const isPast = activeStep >= st.num;
              return (
                <div key={st.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isPast
                        ? 'linear-gradient(135deg, #FF9436, #FF7A18)'
                        : 'rgba(255, 255, 255, 0.08)',
                      color: isPast ? '#FFFFFF' : '#A3A6B3',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isPast ? '0 0 10px rgba(255, 122, 24, 0.5)' : 'none',
                    }}
                  >
                    {st.num}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: isPast ? '#F5F5F7' : '#A3A6B3' }}>
                    {st.label}
                  </span>
                  {i < 3 && <div style={{ width: '16px', height: '1px', background: 'rgba(255, 255, 255, 0.12)' }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main 2-Column Split: Scenarios on Left, Dropzone on Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: 6 Scenario Cards */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F5F5F7', marginBottom: '14px' }}>
              Choose Diagnostic Scenario
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {scenarios.map((sc) => {
                const isSelected = selectedScenario === sc.id;
                return (
                  <GlassCard
                    key={sc.id}
                    variant={isSelected ? 'accent' : 'default'}
                    hoverable
                    onClick={() => {
                      setSelectedScenario(sc.id);
                      if (activeStep < 2) setActiveStep(2);
                    }}
                    style={{
                      padding: '20px 16px',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #FF7A18' : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isSelected ? '0 0 20px -2px rgba(255, 122, 24, 0.35)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(255, 122, 24, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        color: isSelected ? '#FF7A18' : '#A3A6B3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <sc.icon size={22} />
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#FFB347' : '#F5F5F7' }}>
                        {sc.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#A3A6B3', marginTop: '4px', lineHeight: 1.4 }}>
                        {sc.desc}
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>

          {/* Right Column: File Dropzone & Uploaded List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Drag & Drop Area */}
            <div
              style={{
                borderRadius: '14px',
                border: '2px dashed rgba(255, 122, 24, 0.4)',
                background: 'rgba(25, 28, 38, 0.5)',
                padding: '36px 20px',
                textAlign: 'center',
                position: 'relative',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: 'rgba(255, 122, 24, 0.15)',
                  color: '#FF7A18',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                }}
              >
                <UploadCloud size={28} />
              </div>

              <div style={{ fontSize: '15px', fontWeight: 700, color: '#F5F5F7', marginBottom: '6px' }}>
                Drag & drop telemetry files here
              </div>
              <div style={{ fontSize: '12px', color: '#FFB347', marginBottom: '4px' }}>
                or browse files from system
              </div>
              <div style={{ fontSize: '11px', color: '#A3A6B3' }}>
                Supported: PCAP, CSV, JSON, NetFlow v9 / IPFIX
              </div>
            </div>

            {/* Uploaded File List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {files.map((file, idx) => (
                <div
                  key={file.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(17, 19, 26, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={16} color="#38D9FF" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#F5F5F7' }}>{file.name}</span>
                    <span style={{ fontSize: '11px', color: '#A3A6B3' }}>({file.size})</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> Ready
                    </span>
                    <button
                      onClick={() => removeFile(idx)}
                      style={{ background: 'transparent', border: 'none', color: '#A3A6B3', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Data Validation + Run Diagnosis Button (Exact Reference Match) */}
        <GlassCard
          variant="default"
          style={{
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            borderTop: '1px solid rgba(255, 122, 24, 0.3)',
          }}
        >
          {/* Data Validation Checkmarks */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#A3A6B3', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              Data Validation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#F5F5F7' }}>
                <CheckCircle2 size={15} color="#10B981" />
                <span>Schema compatible</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#F5F5F7' }}>
                <CheckCircle2 size={15} color="#10B981" />
                <span>Required fields present</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#F5F5F7' }}>
                <CheckCircle2 size={15} color="#10B981" />
                <span>No missing telemetry</span>
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <GlowButton
            variant="primary"
            size="lg"
            loading={isRunning}
            icon={ArrowRight}
            iconPosition="right"
            onClick={handleRunDiagnosis}
          >
            Run Diagnosis
          </GlowButton>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
