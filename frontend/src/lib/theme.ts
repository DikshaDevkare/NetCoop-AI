import type { ColorToken, GlowColor, StatusType } from '../types/theme.types.ts';

export const OBSIDIAN_EMBER_COLORS = {
  bg: '#08090D',
  bgSecondary: '#11131A',
  surfaceElevated: '#191C26',
  primaryOrange: '#FF7A18',
  amber: '#FFB347',
  violet: '#A855F7',
  cyan: '#38D9FF',
  textMain: '#F5F5F7',
  textSecondary: '#A3A6B3',
  textMuted: '#6A6D7C',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.14)',
  borderFocus: 'rgba(255, 122, 24, 0.5)',
} as const satisfies Record<ColorToken | string, string>;

export const STATUS_COLORS: Record<StatusType, { bg: string; text: string; border: string; glow: string }> = {
  healthy: {
    bg: 'rgba(56, 217, 255, 0.12)',
    text: '#38D9FF',
    border: 'rgba(56, 217, 255, 0.35)',
    glow: 'rgba(56, 217, 255, 0.5)',
  },
  warning: {
    bg: 'rgba(255, 179, 71, 0.12)',
    text: '#FFB347',
    border: 'rgba(255, 179, 71, 0.35)',
    glow: 'rgba(255, 179, 71, 0.5)',
  },
  critical: {
    bg: 'rgba(255, 122, 24, 0.14)',
    text: '#FF7A18',
    border: 'rgba(255, 122, 24, 0.45)',
    glow: 'rgba(255, 122, 24, 0.6)',
  },
  active: {
    bg: 'rgba(168, 85, 247, 0.14)',
    text: '#A855F7',
    border: 'rgba(168, 85, 247, 0.4)',
    glow: 'rgba(168, 85, 247, 0.55)',
  },
  standby: {
    bg: 'rgba(163, 166, 179, 0.1)',
    text: '#A3A6B3',
    border: 'rgba(163, 166, 179, 0.25)',
    glow: 'rgba(163, 166, 179, 0.3)',
  },
  syncing: {
    bg: 'rgba(56, 217, 255, 0.15)',
    text: '#38D9FF',
    border: 'rgba(56, 217, 255, 0.45)',
    glow: 'rgba(56, 217, 255, 0.65)',
  },
};

export const GLOW_PRESETS: Record<GlowColor, string> = {
  none: 'none',
  orange: '0 0 24px -4px rgba(255, 122, 24, 0.35)',
  amber: '0 0 24px -4px rgba(255, 179, 71, 0.35)',
  violet: '0 0 24px -4px rgba(168, 85, 247, 0.35)',
  cyan: '0 0 24px -4px rgba(56, 217, 255, 0.35)',
};

export const TYPOGRAPHY = {
  fontSans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontDisplay: '"Space Grotesk", "Inter", sans-serif',
  fontMono: '"JetBrains Mono", ui-monospace, Menlo, Monaco, Consolas, monospace',
} as const;

export const TRANSITIONS = {
  quick: '0.15s cubic-bezier(0.16, 1, 0.3, 1)',
  smooth: '0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  cinematic: '0.6s cubic-bezier(0.16, 1, 0.3, 1)',
} as const;
