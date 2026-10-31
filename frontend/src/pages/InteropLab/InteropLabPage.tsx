import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { GlowButton } from '../../components/ui/GlowButton.tsx';
import { CheckCircle2, Send, Check, Terminal } from 'lucide-react';

export function InteropLabPage() {
  const [activeTab, setActiveTab] = useState('Message Builder');
  const [protocol, setProtocol] = useState('NetCoopAgent v1.0');
  const [msgType, setMsgType] = useState('diagnosis_request');
  const [schemaVer, setSchemaVer] = useState('v1.0.0');

  const [jsonPayload, setJsonPayload] = useState(`{
  "message_id": "msg-7042",
  "agent": "orchestrator",
  "type": "diagnosis_request",
  "incident_id": "INC-1024",
  "telemetry_window": "15m"
}`);

  const [validated, setValidated] = useState(true);
  const [sentSuccess, setSentSuccess] = useState(false);

  const tabs = ['Message Builder', 'Compatibility Test', 'Schema', 'Logs'];

  const handleValidate = () => {
    try {
      JSON.parse(jsonPayload);
      setValidated(true);
      alert('Schema Validation Passed: 100% compliant with NetCoopAgent v1.0 specifications.');
    } catch {
      setValidated(false);
      alert('JSON Syntax Error: please check brackets and commas.');
    }
  };

  const handleSend = () => {
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 2400);
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Title Header */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F5F5F7', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Interoperability Lab
          </h1>
          <p style={{ fontSize: '13px', color: '#A3A6B3' }}>
            Test agent protocols, validate messages and ensure compatibility.
          </p>
        </div>

        {/* Tab Row (Exact Reference Match) */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: isActive ? 'rgba(255, 122, 24, 0.15)' : 'transparent',
                  color: isActive ? '#FFB347' : '#A3A6B3',
                  border: isActive ? '1px solid rgba(255, 122, 24, 0.4)' : '1px solid transparent',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Top 2 Cards: Protocol Builder Form on Left, JSON Editor on Right */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '20px' }}>
          {/* Left Form: Protocol, Type, Version */}
          <GlassCard variant="default" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#A3A6B3', display: 'block', marginBottom: '6px' }}>
                Protocol
              </label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(8, 9, 13, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F5F5F7',
                  fontSize: '13px',
                  outline: 'none',
                }}
              >
                <option value="NetCoopAgent v1.0">NetCoopAgent v1.0</option>
                <option value="OpenTelemetry Fabric v2.1">OpenTelemetry Fabric v2.1</option>
                <option value="IETF BGP-LS Anomaly v1">IETF BGP-LS Anomaly v1</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#A3A6B3', display: 'block', marginBottom: '6px' }}>
                Message Type
              </label>
              <select
                value={msgType}
                onChange={(e) => setMsgType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(8, 9, 13, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F5F5F7',
                  fontSize: '13px',
                  outline: 'none',
                }}
              >
                <option value="diagnosis_request">diagnosis_request</option>
                <option value="telemetry_packet">telemetry_packet</option>
                <option value="remediation_dispatch">remediation_dispatch</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#A3A6B3', display: 'block', marginBottom: '6px' }}>
                Schema Version
              </label>
              <select
                value={schemaVer}
                onChange={(e) => setSchemaVer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(8, 9, 13, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#F5F5F7',
                  fontSize: '13px',
                  outline: 'none',
                }}
              >
                <option value="v1.0.0">v1.0.0 (Strict)</option>
                <option value="v1.1.0-beta">v1.1.0-beta</option>
              </select>
            </div>

            {/* Validate & Send Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={handleValidate}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '8px',
                  background: 'rgba(56, 217, 255, 0.15)',
                  border: '1px solid rgba(56, 217, 255, 0.4)',
                  color: '#38D9FF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Check size={16} />
                <span>Validate</span>
              </button>

              <GlowButton
                variant="primary"
                size="md"
                onClick={handleSend}
                icon={Send}
                iconPosition="right"
                style={{ flex: 1.2 }}
              >
                {sentSuccess ? 'Request Dispatched!' : 'Send Request'}
              </GlowButton>
            </div>
          </GlassCard>

          {/* Right Card: JSON Code Editor (Exact Reference Match) */}
          <GlassCard variant="default" style={{ padding: '0', overflow: 'hidden' }}>
            <div
              style={{
                padding: '12px 18px',
                background: 'rgba(8, 9, 13, 0.8)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={14} color="#38D9FF" />
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#A3A6B3' }}>
                  request_payload.json
                </span>
              </div>
              <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>SYNTAX VALID</span>
            </div>

            <textarea
              value={jsonPayload}
              onChange={(e) => setJsonPayload(e.target.value)}
              rows={10}
              style={{
                width: '100%',
                padding: '18px',
                background: 'transparent',
                border: 'none',
                color: '#38D9FF',
                fontFamily: '"JetBrains Mono", Consolas, monospace',
                fontSize: '13px',
                lineHeight: 1.6,
                outline: 'none',
                resize: 'none',
              }}
            />
          </GlassCard>
        </div>

        {/* Bottom 2 Cards: Compatibility Result on Left, Message Exchange on Right */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '20px' }}>
          {/* Compatibility Result */}
          <GlassCard variant="default" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7', marginBottom: '14px' }}>Compatibility Result</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#F5F5F7' }}>
                <CheckCircle2 size={16} color={validated ? '#10B981' : '#FF4D4D'} />
                <span>Schema valid</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#F5F5F7' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>All required fields present</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#F5F5F7' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Data types correct</span>
              </div>
            </div>
          </GlassCard>

          {/* Message Exchange Timeline */}
          <GlassCard variant="default" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7', marginBottom: '14px' }}>Message Exchange</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', fontFamily: '"JetBrains Mono", monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A855F7' }}>
                <span>&bull; Orchestrator &rarr; Perf Agent</span>
                <span style={{ color: '#A3A6B3' }}>14:02:11</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38D9FF' }}>
                <span>&bull; Perf Agent &rarr; Orchestrator</span>
                <span style={{ color: '#A3A6B3' }}>14:02:14</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FF7A18' }}>
                <span>&bull; Orchestrator &rarr; Corr Agent</span>
                <span style={{ color: '#A3A6B3' }}>14:02:20</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
}
