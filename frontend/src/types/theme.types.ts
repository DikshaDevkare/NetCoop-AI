export type ColorToken =
  | 'bg'
  | 'bgSecondary'
  | 'surfaceElevated'
  | 'primaryOrange'
  | 'amber'
  | 'violet'
  | 'cyan'
  | 'textMain'
  | 'textSecondary'
  | 'textMuted';

export type StatusType = 'healthy' | 'warning' | 'critical' | 'active' | 'standby' | 'syncing';

export type GlowColor = 'none' | 'orange' | 'amber' | 'violet' | 'cyan';

export type CardVariant = 'default' | 'elevated' | 'interactive' | 'accent' | 'critical';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ScenePreset = 'default' | 'network' | 'orchestration' | 'telemetry' | 'minimal';
