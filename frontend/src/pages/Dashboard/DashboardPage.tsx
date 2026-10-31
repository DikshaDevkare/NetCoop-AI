import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { CommandCentreTopology } from '../../components/dashboard/CommandCentreTopology.tsx';
import { TelemetryCharts } from '../../components/dashboard/TelemetryCharts.tsx';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter.tsx';
import { Users, Router, AlertTriangle } from 'lucide-react';

export function DashboardPage() {
  const [selectedNodeName, setSelectedNodeName] = useState<string | null>(null);

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Title Header */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F5F5F7', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Network Command Centre
          </h1>
          <p style={{ fontSize: '13px', color: '#A3A6B3' }}>
            Real-time network health, incidents and multi-agent operations.
          </p>
        </div>

        {/* Top 4 KPI Metrics Row (Exact Reference Match) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {/* 1. Network Health (Circular Gauge) */}
          <GlassCard variant="default" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* SVG Circular Ring Gauge */}
            <div style={{ position: 'relative', width: '64px', height: '64px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="3.2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeDasharray="93, 100"
                  strokeLinecap="round"
                  strokeWidth="3.2"
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#F5F5F7',
                }}
              >
                93%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#F5F5F7' }}>Network Health</div>
              <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Optimal Threshold</div>
            </div>
          </GlassCard>

          {/* 2. AI Agents Online */}
          <GlassCard variant="default" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#A855F7',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#F5F5F7', lineHeight: 1.1 }}>
                <AnimatedCounter value={5} />
              </div>
              <div style={{ fontSize: '12px', color: '#A3A6B3' }}>AI Agents Online</div>
            </div>
          </GlassCard>

          {/* 3. Active Devices */}
          <GlassCard variant="default" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(56, 217, 255, 0.15)',
                color: '#38D9FF',
                border: '1px solid rgba(56, 217, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Router size={20} />
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#F5F5F7', lineHeight: 1.1 }}>
                <AnimatedCounter value={428} />
              </div>
              <div style={{ fontSize: '12px', color: '#A3A6B3' }}>Active Devices</div>
            </div>
          </GlassCard>

          {/* 4. Open Incidents */}
          <GlassCard variant="default" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(255, 77, 77, 0.15)',
                color: '#FF4D4D',
                border: '1px solid rgba(255, 77, 77, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '26px', fontWeight: 800, color: '#F5F5F7', lineHeight: 1.1 }}>1</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#FF4D4D',
                    background: 'rgba(255, 77, 77, 0.2)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  HIGH
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#A3A6B3' }}>Open Incidents</div>
            </div>
          </GlassCard>
        </div>

        {/* Central Stage: 3D Topology + Right Telemetry Panel */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 300px',
            gap: '20px',
            alignItems: 'start',
          }}
          className="dashboard-main-grid"
        >
          {/* Main 3D Topology Canvas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <CommandCentreTopology onSelectNode={(node) => setSelectedNodeName(node.name)} />
            {selectedNodeName && (
              <div style={{ fontSize: '12px', color: '#FFB347' }}>
                Focused inspection on: <strong>{selectedNodeName}</strong>
              </div>
            )}
          </div>

          {/* Right Column: Live Telemetry Charts */}
          <TelemetryCharts />
        </div>
      </div>
    </AppLayout>
  );
}
