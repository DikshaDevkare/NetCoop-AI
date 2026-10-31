import type { CSSProperties } from 'react';
import type { StatusBadgeProps } from '../../types/components.types.ts';
import { STATUS_COLORS } from '../../lib/theme.ts';
import { cn } from '../../lib/utils.ts';

export function StatusBadge({
  status,
  label,
  size = 'md',
  pulse = true,
  className,
}: StatusBadgeProps) {
  const conf = STATUS_COLORS[status] || STATUS_COLORS.standby;
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  const isSmall = size === 'sm';

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: isSmall ? '5px' : '7px',
    padding: isSmall ? '3px 8px' : '5px 12px',
    borderRadius: '9999px',
    background: conf.bg,
    border: `1px solid ${conf.border}`,
    color: conf.text,
    fontSize: isSmall ? '11px' : '12px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    userSelect: 'none',
    boxShadow: `0 0 12px -2px ${conf.border}`,
  };

  return (
    <span style={badgeStyle} className={cn('status-badge', className)}>
      <span
        style={{
          position: 'relative',
          display: 'inline-flex',
          width: isSmall ? '6px' : '8px',
          height: isSmall ? '6px' : '8px',
        }}
      >
        {pulse && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              backgroundColor: conf.text,
              opacity: 0.75,
              animation: 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
        )}
        <span
          style={{
            position: 'relative',
            display: 'inline-block',
            width: isSmall ? '6px' : '8px',
            height: isSmall ? '6px' : '8px',
            borderRadius: '50%',
            backgroundColor: conf.text,
            boxShadow: `0 0 8px ${conf.glow}`,
          }}
        />
      </span>
      <span>{displayLabel}</span>
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}
