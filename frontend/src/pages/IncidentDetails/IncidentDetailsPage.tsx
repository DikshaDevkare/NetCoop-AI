import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout.tsx';
import { GlassCard } from '../../components/ui/GlassCard.tsx';
import { BuildingTopologyScene } from '../../components/three/BuildingTopologyScene.tsx';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';

const UTILIZATION_DATA = [
  { time: '14:00', val: 54 },
  { time: '14:05', val: 68 },
  { time: '14:10', val: 72 },
  { time: '14:15', val: 89 },
  { time: '14:20', val: 94 },
  { time: '14:25', val: 92 },
];

export function IncidentDetailsPage() {
  const [activeTab, setActiveTab] = useState('Topology');

  const tabs = ['Overview', 'Telemetry', 'Topology', 'Affected Devices', 'Logs'];

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title Header with Red Severity Badge (Exact Reference Match) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F5F5F7', letterSpacing: '-0.02em' }}>
              Incident #INC-1024
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#FF4D4D',
                background: 'rgba(255, 77, 77, 0.15)',
                border: '1px solid rgba(255, 77, 77, 0.4)',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              High
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#A3A6B3' }}>
            Network congestion on Building A - Detected 5 mins ago
          </p>
        </div>

        {/* Tab Navigation Row */}
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

        {/* 2-Column Split: Topology on Left, Device Details on Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 320px',
            gap: '20px',
            alignItems: 'start',
          }}
          className="incident-main-grid"
        >
          {/* Main 3D Perspective Building Topology Area */}
          <BuildingTopologyScene />

          {/* Right Column: Device Details Panel (Exact Reference Match) */}
          <GlassCard variant="default" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header: SW-03 (Building A) with Degraded Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F5F5F7' }}>SW-03 (Building A)</h3>
                <span style={{ fontSize: '11px', color: '#A3A6B3' }}>Uplink Switch</span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#FFB347',
                  background: 'rgba(255, 179, 71, 0.15)',
                  border: '1px solid rgba(255, 179, 71, 0.4)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                Degraded
              </span>
            </div>

            {/* Metric 1: CPU Usage */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#A3A6B3' }}>CPU Usage</span>
                <span style={{ fontWeight: 700, color: '#FFB347' }}>78%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, #FF9436, #FF7A18)' }} />
              </div>
            </div>

            {/* Metric 2: Memory */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#A3A6B3' }}>Memory</span>
                <span style={{ fontWeight: 700, color: '#38D9FF' }}>64%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: '64%', height: '100%', background: 'linear-gradient(90deg, #38D9FF, #A855F7)' }} />
              </div>
            </div>

            {/* Interface Errors & Queue Drops */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(255, 255, 255, 0.06)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#A3A6B3', display: 'block' }}>Interface Errors</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#FF4D4D' }}>126</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#A3A6B3', display: 'block' }}>Queue Drops</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#FF7A18' }}>34</span>
              </div>
            </div>

            {/* Link Utilization Chart */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#A3A6B3' }}>Link Utilization</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#FF7A18' }}>92%</span>
              </div>
              <div style={{ width: '100%', height: '70px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={UTILIZATION_DATA}>
                    <Tooltip contentStyle={{ background: '#11131A', border: '1px solid #FF7A18', fontSize: '11px', borderRadius: '6px' }} />
                    <Line type="monotone" dataKey="val" stroke="#FF7A18" strokeWidth={2} dot={{ r: 2, fill: '#FF7A18' }} isAnimationActive />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
}
