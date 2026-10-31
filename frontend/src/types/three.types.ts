import type { ScenePreset } from './theme.types.ts';

export interface NetworkNodeData {
  id: string;
  position: [number, number, number];
  color: string;
  size: number;
  label?: string;
  pulseRate: number;
  type: 'core' | 'agent' | 'gateway' | 'switch';
}

export interface EnergyConnectionData {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  speed: number;
  intensity: number;
}

export interface Global3DEnvironmentProps {
  preset?: ScenePreset;
  interactive?: boolean;
  reducedMotionOverride?: boolean;
  className?: string;
  nodeCountMultiplier?: number;
}
