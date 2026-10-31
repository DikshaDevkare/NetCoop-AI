interface HealthGaugeProps {
  value: number; // e.g. 93 or 87
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  glow?: boolean;
}

export function HealthGauge({
  value,
  size = 68,
  strokeWidth = 3.4,
  label = 'Network Health',
  sublabel = 'Optimal Threshold',
  color = '#10B981',
  glow = true,
}: HealthGaugeProps) {
  // SVG circular calculation (radius = 15.9155 gives circumference ~100)
  const radius = 15.9155;
  const strokeDash = `${Math.min(100, Math.max(0, value))}, 100`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
        <svg
          viewBox="0 0 36 36"
          style={{
            width: '100%',
            height: '100%',
            transform: 'rotate(-90deg)',
            filter: glow ? `drop-shadow(0 0 6px ${color}60)` : 'none',
          }}
        >
          {/* Background Track */}
          <path
            d={`M18 2.0845 a ${radius} ${radius} 0 0 1 0 31.831 a ${radius} ${radius} 0 0 1 0 -31.831`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Active Value Arc */}
          <path
            d={`M18 2.0845 a ${radius} ${radius} 0 0 1 0 31.831 a ${radius} ${radius} 0 0 1 0 -31.831`}
            fill="none"
            stroke={color}
            strokeDasharray={strokeDash}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </svg>

        {/* Center Percentage Display */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${size * 0.24}px`,
            fontWeight: 800,
            color: '#F5F5F7',
            letterSpacing: '-0.02em',
          }}
        >
          {value}%
        </div>
      </div>

      {(label || sublabel) && (
        <div>
          {label && (
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#F5F5F7', lineHeight: 1.2 }}>
              {label}
            </div>
          )}
          {sublabel && (
            <div style={{ fontSize: '11px', color: color, fontWeight: 600, marginTop: '2px' }}>
              {sublabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
