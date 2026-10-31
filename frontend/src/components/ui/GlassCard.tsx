import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import type { GlassCardProps } from '../../types/components.types.ts';
import { GLOW_PRESETS } from '../../lib/theme.ts';
import { cn } from '../../lib/utils.ts';

export function GlassCard({
  children,
  variant = 'default',
  glow = 'none',
  className,
  onClick,
  hoverable = false,
  style: customStyle,
}: GlassCardProps) {
  const isInteractive = hoverable || variant === 'interactive' || Boolean(onClick);

  const variantStyles: Record<string, CSSProperties> = {
    default: {
      background: 'rgba(25, 28, 38, 0.65)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    },
    elevated: {
      background: 'rgba(25, 28, 38, 0.82)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255, 255, 255, 0.14)',
      boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    },
    interactive: {
      background: 'rgba(25, 28, 38, 0.70)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
    },
    accent: {
      background: 'rgba(25, 28, 38, 0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 122, 24, 0.35)',
      boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 179, 71, 0.2)',
    },
    critical: {
      background: 'rgba(38, 20, 20, 0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 77, 77, 0.45)',
      boxShadow: '0 12px 36px -4px rgba(255, 77, 77, 0.15)',
    },
  };

  const style: CSSProperties = {
    ...variantStyles[variant],
    borderRadius: '14px',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: glow !== 'none' ? GLOW_PRESETS[glow] : variantStyles[variant].boxShadow,
    ...customStyle,
  };

  return (
    <motion.div
      style={style}
      className={cn('glass-card', className)}
      onClick={onClick}
      whileHover={
        isInteractive
          ? {
              y: -3,
              borderColor: 'rgba(255, 179, 71, 0.4)',
              boxShadow: '0 16px 44px -4px rgba(0, 0, 0, 0.7), 0 0 24px -2px rgba(255, 122, 24, 0.25)',
              transition: { duration: 0.2 },
            }
          : undefined
      }
      whileTap={isInteractive ? { scale: 0.99 } : undefined}
    >
      {/* Specular corner highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </motion.div>
  );
}
