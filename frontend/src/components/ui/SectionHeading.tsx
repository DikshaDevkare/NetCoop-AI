import type { CSSProperties } from 'react';
import type { SectionHeadingProps } from '../../types/components.types.ts';
import { cn } from '../../lib/utils.ts';

export function SectionHeading({
  badge,
  title,
  description,
  align = 'left',
  accent = 'orange',
  className,
}: SectionHeadingProps) {
  const accentColors: Record<string, { border: string; glow: string; text: string }> = {
    orange: { border: 'rgba(255, 122, 24, 0.4)', glow: 'rgba(255, 122, 24, 0.2)', text: '#FF7A18' },
    amber: { border: 'rgba(255, 179, 71, 0.4)', glow: 'rgba(255, 179, 71, 0.2)', text: '#FFB347' },
    violet: { border: 'rgba(168, 85, 247, 0.4)', glow: 'rgba(168, 85, 247, 0.2)', text: '#A855F7' },
    cyan: { border: 'rgba(56, 217, 255, 0.4)', glow: 'rgba(56, 217, 255, 0.2)', text: '#38D9FF' },
  };

  const containerStyle: CSSProperties = {
    textAlign: align,
    marginBottom: '28px',
  };

  return (
    <div style={containerStyle} className={cn('section-heading', className)}>
      {badge && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '9999px',
            background: 'rgba(25, 28, 38, 0.7)',
            border: `1px solid ${accentColors[accent].border}`,
            boxShadow: `0 0 14px -2px ${accentColors[accent].glow}`,
            color: accentColors[accent].text,
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: accentColors[accent].text,
              boxShadow: `0 0 6px ${accentColors[accent].text}`,
            }}
          />
          {badge}
        </div>
      )}
      <h2
        style={{
          fontSize: '28px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.25,
          color: '#F5F5F7',
          marginBottom: description ? '8px' : 0,
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: '#A3A6B3',
            maxWidth: align === 'center' ? '640px' : '720px',
            marginLeft: align === 'center' ? 'auto' : 0,
            marginRight: align === 'center' ? 'auto' : 0,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
