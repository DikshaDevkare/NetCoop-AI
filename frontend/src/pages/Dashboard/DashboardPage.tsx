import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { NetworkHubScene } from '../../components/three/NetworkHubScene.tsx';
import { TelemetryChart } from '../../components/ui/TelemetryChart.tsx';
import { HealthGauge } from '../../components/ui/HealthGauge.tsx';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter.tsx';
import { Users, Router, AlertTriangle } from 'lucide-react';

export function DashboardPage() {
  const [, setSelectedNodeName] = useState<string | null>(null);

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Title Header (Exact Reference Match) */}
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
          <GlassCard variant="default" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center' }}>
            <HealthGauge value={93} label="Network Health" sublabel="Optimal Threshold" color="#10B981" />
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
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#FF4D4D', lineHeight: 1.1 }}>
                ▲ 3
              </div>
              <div style={{ fontSize: '12px', color: '#A3A6B3' }}>Open Incidents</div>
            </div>
          </GlassCard>
        </div>

        {/* Main Central Workspace: 3D Topology + Live Telemetry (Exact Reference Match) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 320px',
            gap: '20px',
            alignItems: 'start',
          }}
          className="dashboard-main-grid"
        >
          {/* Left/Center: Interactive 3D Network Topology (Exact Reference Match) */}
          <NetworkHubScene onNodeSelect={(nodeName) => setSelectedNodeName(nodeName)} />

          {/* Right: Live Telemetry Sparklines */}
          <TelemetryChart />
        </div>
      </div>
    </AppLayout>
  );
}
