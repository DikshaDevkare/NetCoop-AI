import type { ReactNode, ComponentType, MouseEventHandler, CSSProperties } from 'react';
import type { CardVariant, GlowColor, ButtonVariant, ButtonSize, StatusType } from './theme.types.ts';

export interface GlassCardProps {
  children: ReactNode;
  variant?: CardVariant;
  glow?: GlowColor;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  hoverable?: boolean;
  style?: CSSProperties;
}

export interface GlowButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  glow?: boolean;
  icon?: ComponentType<{ size?: number; className?: string }>;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  style?: CSSProperties;
}

export interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  accent?: 'orange' | 'amber' | 'violet' | 'cyan';
  className?: string;
}

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  decimals?: number;
  prefix?: string;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: ComponentType<{ size?: number; className?: string }>;
  accent?: 'orange' | 'amber' | 'violet' | 'cyan';
  sparkline?: number[];
  className?: string;
}

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  withBackgroundGrid?: boolean;
}

export interface LoadingScreenProps {
  message?: string;
  subtext?: string;
  progress?: number;
  fullScreen?: boolean;
}

export interface FormInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  type?: 'text' | 'password' | 'email' | 'number';
  disabled?: boolean;
  error?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  className?: string;
}

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  accent?: 'orange' | 'amber' | 'violet' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
