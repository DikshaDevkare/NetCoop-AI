import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import type { ProgressBarProps } from '../../types/components.types.ts';
import { cn } from '../../lib/utils.ts';

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  accent = 'orange',
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const heightMap: Record<string, string> = {
    sm: '4px',
    md: '8px',
    lg: '12px',
  };

  const accentGradients: Record<string, { bg: string; glow: string; text: string }> = {
    orange: { bg: 'linear-gradient(90deg, #FF7A18, #FFB347)', glow: '0 0 12px rgba(255, 122, 24, 0.4)', text: '#FF7A18' },
    amber: { bg: 'linear-gradient(90deg, #FFB347, #FFD285)', glow: '0 0 12px rgba(255, 179, 71, 0.4)', text: '#FFB347' },
    violet: { bg: 'linear-gradient(90deg, #8B5CF6, #C084FC)', glow: '0 0 12px rgba(168, 85, 247, 0.4)', text: '#A855F7' },
    cyan: { bg: 'linear-gradient(90deg, #06B6D4, #38D9FF)', glow: '0 0 12px rgba(56, 217, 255, 0.4)', text: '#38D9FF' },
  };

  const currentAccent = accentGradients[accent];

  const trackStyle: CSSProperties = {
    width: '100%',
    height: heightMap[size],
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '9999px',
    overflow: 'hidden',
    position: 'relative',
  };

  return (
    <div className={cn('progress-bar-container', className)} style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          {label && <span style={{ fontSize: '12px', color: '#A3A6B3', fontWeight: 500 }}>{label}</span>}
          {showPercentage && (
            <span style={{ fontSize: '12px', color: currentAccent.text, fontWeight: 600 }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div style={trackStyle}>
        <motion.div
          style={{
            height: '100%',
            background: currentAccent.bg,
            borderRadius: '9999px',
            boxShadow: currentAccent.glow,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
