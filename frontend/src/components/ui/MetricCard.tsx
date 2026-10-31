import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { MetricCardProps } from '../../types/components.types.ts';
import { GlassCard } from './GlassCard.tsx';
import { AnimatedCounter } from './AnimatedCounter.tsx';
import { cn } from '../../lib/utils.ts';

export function MetricCard({
  title,
  value,
  unit,
  decimals = 0,
  prefix = '',
  change,
  trend = 'stable',
  icon: Icon,
  accent = 'orange',
  sparkline = [20, 28, 24, 35, 42, 38, 55, 48, 62],
  className,
}: MetricCardProps) {
  const accentColors: Record<string, { stroke: string; fill: string; border: string; glow: string; text: string }> = {
    orange: { stroke: '#FF7A18', fill: 'rgba(255, 122, 24, 0.15)', border: 'rgba(255, 122, 24, 0.3)', glow: 'rgba(255, 122, 24, 0.25)', text: '#FF7A18' },
    amber: { stroke: '#FFB347', fill: 'rgba(255, 179, 71, 0.15)', border: 'rgba(255, 179, 71, 0.3)', glow: 'rgba(255, 179, 71, 0.25)', text: '#FFB347' },
    violet: { stroke: '#A855F7', fill: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', glow: 'rgba(168, 85, 247, 0.25)', text: '#A855F7' },
    cyan: { stroke: '#38D9FF', fill: 'rgba(56, 217, 255, 0.15)', border: 'rgba(56, 217, 255, 0.3)', glow: 'rgba(56, 217, 255, 0.25)', text: '#38D9FF' },
  };

  const accentScheme = accentColors[accent];

  // SVG sparkline path builder
  const minVal = Math.min(...sparkline);
  const maxVal = Math.max(...sparkline) || 1;
  const range = maxVal - minVal || 1;
  const svgWidth = 100;
  const svgHeight = 32;

  const points = sparkline.map((val, idx) => {
    const x = (idx / (sparkline.length - 1)) * svgWidth;
    const y = svgHeight - ((val - minVal) / range) * (svgHeight - 6) - 3;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;

  return (
    <GlassCard variant="default" className={cn('metric-card', className)} hoverable>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#A3A6B3', letterSpacing: '0.02em' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${accentScheme.border}`,
              color: accentScheme.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
        <span style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.03em', color: '#F5F5F7', lineHeight: 1 }}>
          <AnimatedCounter value={value} decimals={decimals} prefix={prefix} />
        </span>
        {unit && (
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#A3A6B3' }}>
            {unit}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
        {change && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '12px',
              fontWeight: 600,
              color: trend === 'up' ? '#38D9FF' : trend === 'down' ? '#FF7A18' : '#A3A6B3',
            }}
          >
            {trend === 'up' && <ArrowUpRight size={14} />}
            {trend === 'down' && <ArrowDownRight size={14} />}
            {trend === 'stable' && <Minus size={14} />}
            <span>{change}</span>
          </div>
        )}

        {/* Mini SVG Sparkline */}
        <div style={{ width: '80px', height: '26px' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id={`grad-${accent}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentScheme.stroke} stopOpacity="0.3" />
                <stop offset="100%" stopColor={accentScheme.stroke} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#grad-${accent})`} />
            <path d={pathD} fill="none" stroke={accentScheme.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </GlassCard>
  );
}
