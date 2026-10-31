import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type { GlowButtonProps } from '../../types/components.types.ts';
import { cn } from '../../lib/utils.ts';

export function GlowButton({
  children,
  variant = 'primary',
  size = 'md',
  glow = variant === 'primary',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  className,
  type = 'button',
}: GlowButtonProps) {
  const sizeStyles: Record<string, CSSProperties> = {
    sm: { padding: '8px 14px', fontSize: '13px', borderRadius: '8px', gap: '6px' },
    md: { padding: '11px 20px', fontSize: '14px', borderRadius: '10px', gap: '8px' },
    lg: { padding: '14px 28px', fontSize: '16px', borderRadius: '12px', gap: '10px' },
  };

  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #FF9436 0%, #FF7A18 50%, #E65A00 100%)',
      color: '#FFFFFF',
      border: '1px solid rgba(255, 179, 71, 0.5)',
      boxShadow: glow ? '0 0 20px -2px rgba(255, 122, 24, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)' : 'none',
      fontWeight: 600,
    },
    secondary: {
      background: 'rgba(25, 28, 38, 0.85)',
      color: '#F5F5F7',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      fontWeight: 500,
    },
    outline: {
      background: 'transparent',
      color: '#FFB347',
      border: '1px solid rgba(255, 179, 71, 0.4)',
      boxShadow: glow ? '0 0 14px -4px rgba(255, 179, 71, 0.25)' : 'none',
      fontWeight: 500,
    },
    ghost: {
      background: 'transparent',
      color: '#A3A6B3',
      border: '1px solid transparent',
      fontWeight: 500,
    },
    danger: {
      background: 'linear-gradient(135deg, #FF4D4D 0%, #D92B2B 100%)',
      color: '#FFFFFF',
      border: '1px solid rgba(255, 100, 100, 0.5)',
      boxShadow: glow ? '0 0 20px -2px rgba(255, 77, 77, 0.5)' : 'none',
      fontWeight: 600,
    },
  };

  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    letterSpacing: '0.01em',
    userSelect: 'none',
    outline: 'none',
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  return (
    <motion.button
      type={type}
      style={style}
      disabled={disabled || loading}
      onClick={disabled || loading ? undefined : onClick}
      className={cn('glow-button', className)}
      whileHover={
        disabled || loading
          ? undefined
          : {
              scale: 1.02,
              filter: 'brightness(1.1)',
              boxShadow:
                variant === 'primary'
                  ? '0 0 28px 0px rgba(255, 122, 24, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                  : variant === 'secondary'
                  ? '0 6px 20px rgba(0, 0, 0, 0.4), 0 0 12px rgba(255, 179, 71, 0.2)'
                  : undefined,
            }
      }
      whileTap={disabled || loading ? undefined : { scale: 0.98 }}
    >
      {loading && <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
    </motion.button>
  );
}
