import { ResponsiveContainer, LineChart, Line, BarChart, Bar, Tooltip } from 'recharts';
import { GlassCard } from '../ui/GlassCard.tsx';
import { Activity } from 'lucide-react';

const LATENCY_DATA = [
  { time: '14:00', val: 18 },
  { time: '14:05', val: 21 },
  { time: '14:10', val: 19 },
  { time: '14:15', val: 32 },
  { time: '14:20', val: 28 },
  { time: '14:25', val: 24 },
];

const PACKET_LOSS_DATA = [
  { time: '14:00', val: 0.1 },
  { time: '14:05', val: 0.2 },
  { time: '14:10', val: 0.1 },
  { time: '14:15', val: 1.4 },
  { time: '14:20', val: 1.1 },
  { time: '14:25', val: 0.8 },
];

const BANDWIDTH_DATA = [
  { time: '14:00', val: 180 },
  { time: '14:05', val: 240 },
  { time: '14:10', val: 210 },
  { time: '14:15', val: 340 },
  { time: '14:20', val: 325 },
  { time: '14:25', val: 312 },
];

const CPU_DATA = [
  { id: 'C1', val: 45 },
  { id: 'C2', val: 62 },
  { id: 'C3', val: 78 },
  { id: 'C4', val: 68 },
  { id: 'C5', val: 55 },
  { id: 'C6', val: 71 },
  { id: 'C7', val: 68 },
];

export function TelemetryCharts() {
  return (
    <GlassCard variant="default" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Live Telemetry Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="#FF7A18" />
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7' }}>Live Telemetry</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#10B981' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
          <span>Real-time (1s)</span>
        </div>
      </div>

      {/* 1. Latency (ms) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: '#A3A6B3', fontWeight: 500 }}>Latency (ms)</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#A855F7' }}>24 ms</span>
        </div>
        <div style={{ width: '100%', height: '54px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={LATENCY_DATA}>
              <Tooltip contentStyle={{ background: '#11131A', border: '1px solid #A855F7', fontSize: '11px', borderRadius: '6px' }} />
              <Line
                type="monotone"
                dataKey="val"
                stroke="#A855F7"
                strokeWidth={2}
                dot={{ r: 2, fill: '#A855F7' }}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Packet Loss (%) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: '#A3A6B3', fontWeight: 500 }}>Packet Loss (%)</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#FF7A18' }}>0.8 %</span>
        </div>
        <div style={{ width: '100%', height: '54px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PACKET_LOSS_DATA}>
              <Tooltip contentStyle={{ background: '#11131A', border: '1px solid #FF7A18', fontSize: '11px', borderRadius: '6px' }} />
              <Line
                type="monotone"
                dataKey="val"
                stroke="#FF7A18"
                strokeWidth={2}
                dot={{ r: 2, fill: '#FF7A18' }}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Bandwidth (Mbps) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: '#A3A6B3', fontWeight: 500 }}>Bandwidth (Mbps)</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#38D9FF' }}>312 Mbps</span>
        </div>
        <div style={{ width: '100%', height: '54px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={BANDWIDTH_DATA}>
              <Tooltip contentStyle={{ background: '#11131A', border: '1px solid #38D9FF', fontSize: '11px', borderRadius: '6px' }} />
              <Line
                type="monotone"
                dataKey="val"
                stroke="#38D9FF"
                strokeWidth={2}
                dot={{ r: 2, fill: '#38D9FF' }}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. CPU Usage (Bar chart) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: '#A3A6B3', fontWeight: 500 }}>CPU Usage</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#A855F7' }}>68 %</span>
        </div>
        <div style={{ width: '100%', height: '58px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CPU_DATA}>
              <Tooltip contentStyle={{ background: '#11131A', border: '1px solid #A855F7', fontSize: '11px', borderRadius: '6px' }} />
              <Bar dataKey="val" fill="#A855F7" radius={[3, 3, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}
