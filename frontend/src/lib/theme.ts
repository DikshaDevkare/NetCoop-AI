import type { ColorToken, GlowColor, StatusType } from '../types/theme.types.ts';

export const OBSIDIAN_EMBER_COLORS = {
  bg: '#08090D',
  bgDeep: '#05060A',
  bgSecondary: '#11131C',
  surfaceElevated: '#151722',
  surfaceGlass: 'rgba(20, 22, 33, 0.88)',
  primaryAmber: '#FF9A24',
  emberOrange: '#FF6A16',
  deepOrange: '#C94C0A',
  primaryOrange: '#FF6A16',
  amber: '#FF9A24',
  violet: '#9A45FF',
  cyan: '#36CBE8',
  green: '#21D69A',
  red: '#F05252',
  textMain: '#F4F4F7',
  textPrimary: '#F4F4F7',
  textSecondary: '#A0A3B1',
  textMuted: '#6A6D7C',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.14)',
  borderFocus: 'rgba(255, 154, 36, 0.5)',
} as const satisfies Record<ColorToken | string, string>;

export const STATUS_COLORS: Record<StatusType, { bg: string; text: string; border: string; glow: string }> = {
  healthy: {
    bg: 'rgba(33, 214, 154, 0.12)',
    text: '#21D69A',
    border: 'rgba(33, 214, 154, 0.35)',
    glow: 'rgba(33, 214, 154, 0.5)',
  },
  warning: {
    bg: 'rgba(255, 154, 36, 0.12)',
    text: '#FF9A24',
    border: 'rgba(255, 154, 36, 0.35)',
    glow: 'rgba(255, 154, 36, 0.5)',
  },
  critical: {
    bg: 'rgba(240, 82, 82, 0.14)',
    text: '#F05252',
    border: 'rgba(240, 82, 82, 0.45)',
    glow: 'rgba(240, 82, 82, 0.6)',
  },
  active: {
    bg: 'rgba(154, 69, 255, 0.14)',
    text: '#9A45FF',
    border: 'rgba(154, 69, 255, 0.4)',
    glow: 'rgba(154, 69, 255, 0.55)',
  },
  standby: {
    bg: 'rgba(160, 163, 177, 0.1)',
    text: '#A0A3B1',
    border: 'rgba(160, 163, 177, 0.25)',
    glow: 'rgba(160, 163, 177, 0.3)',
  },
  syncing: {
    bg: 'rgba(54, 203, 232, 0.15)',
    text: '#36CBE8',
    border: 'rgba(54, 203, 232, 0.45)',
    glow: 'rgba(54, 203, 232, 0.65)',
  },
};

export const GLOW_PRESETS: Record<GlowColor, string> = {
  none: 'none',
  orange: '0 0 24px -4px rgba(255, 106, 22, 0.35)',
  amber: '0 0 24px -4px rgba(255, 154, 36, 0.35)',
  violet: '0 0 24px -4px rgba(154, 69, 255, 0.35)',
  cyan: '0 0 24px -4px rgba(54, 203, 232, 0.35)',
};
