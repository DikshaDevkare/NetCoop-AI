import { CheckCircle2, CircleDot, Clock } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';

export interface TimelineItem {
  id: string;
  step: string;
  timestamp?: string;
  status: 'done' | 'active' | 'pending';
}

interface ExecutionTimelineProps {
  items?: TimelineItem[];
}

const DEFAULT_TIMELINE: TimelineItem[] = [
  { id: '1', step: 'Orchestrator initialized', timestamp: '14:02:11', status: 'done' },
  { id: '2', step: 'Performance Agent analysis', timestamp: '14:02:18', status: 'done' },
  { id: '3', step: 'Infrastructure analysis', timestamp: '14:02:24', status: 'done' },
  { id: '4', step: 'Connectivity analysis', timestamp: '14:02:29', status: 'active' },
  { id: '5', step: 'Fault correlation (running)', status: 'pending' },
  { id: '6', step: 'Generating recommendation', status: 'pending' },
];

export function ExecutionTimeline({ items = DEFAULT_TIMELINE }: ExecutionTimelineProps) {
  return (
    <GlassCard variant="default" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7' }}>Execution Timeline</h3>
        <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Active Trace</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {item.status === 'done' ? (
                <CheckCircle2 size={16} color="#10B981" />
              ) : item.status === 'active' ? (
                <CircleDot size={16} color="#38D9FF" style={{ animation: 'pulse 1.5s infinite' }} />
              ) : (
                <Clock size={16} color="#6A6D7C" />
              )}
              <span
                style={{
                  fontWeight: item.status === 'active' ? 700 : 500,
                  color: item.status === 'done' ? '#F5F5F7' : item.status === 'active' ? '#38D9FF' : '#A3A6B3',
                }}
              >
                {item.step}
              </span>
            </div>

            {item.timestamp && (
              <span style={{ fontSize: '11px', color: '#6A6D7C', fontFamily: 'monospace' }}>
                {item.timestamp}
              </span>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
