import type { NetworkNodeData, EnergyConnectionData } from '../types/three.types.ts';
import type { ScenePreset } from '../types/theme.types.ts';

export interface SceneConfiguration {
  nodes: NetworkNodeData[];
  connections: EnergyConnectionData[];
  particleCount: number;
  cameraZ: number;
}

export function getScenePreset(preset: ScenePreset = 'default'): SceneConfiguration {
  switch (preset) {
    case 'orchestration':
      return {
        cameraZ: 14,
        particleCount: 250,
        nodes: [
          // Central Core Neural Engine
          { id: 'core', position: [0, 0, 0], color: '#FF7A18', size: 1.2, pulseRate: 2.0, type: 'core', label: 'NetCoop Core Nexus' },
          // 5 Specialized Agents in Pentagonal Orbit
          { id: 'agent-1', position: [0, 3.2, 0.5], color: '#FFB347', size: 0.65, pulseRate: 1.5, type: 'agent', label: 'Telemetry & Perf Agent' },
          { id: 'agent-2', position: [3.0, 1.0, -0.5], color: '#38D9FF', size: 0.65, pulseRate: 1.2, type: 'agent', label: 'Infra Health Agent' },
          { id: 'agent-3', position: [1.9, -2.6, 0.8], color: '#A855F7', size: 0.65, pulseRate: 1.8, type: 'agent', label: 'Connectivity Analysis Agent' },
          { id: 'agent-4', position: [-1.9, -2.6, -0.8], color: '#FF7A18', size: 0.65, pulseRate: 2.2, type: 'agent', label: 'Fault Correlation Agent' },
          { id: 'agent-5', position: [-3.0, 1.0, 0.5], color: '#FFB347', size: 0.65, pulseRate: 1.4, type: 'agent', label: 'Recommendation & RCA Agent' },
        ],
        connections: [
          { from: [0, 0, 0], to: [0, 3.2, 0.5], color: '#FFB347', speed: 1.2, intensity: 0.8 },
          { from: [0, 0, 0], to: [3.0, 1.0, -0.5], color: '#38D9FF', speed: 1.5, intensity: 0.7 },
          { from: [0, 0, 0], to: [1.9, -2.6, 0.8], color: '#A855F7', speed: 1.1, intensity: 0.7 },
          { from: [0, 0, 0], to: [-1.9, -2.6, -0.8], color: '#FF7A18', speed: 1.4, intensity: 0.9 },
          { from: [0, 0, 0], to: [-3.0, 1.0, 0.5], color: '#FFB347', speed: 1.3, intensity: 0.8 },
          // Inter-agent mesh ring
          { from: [0, 3.2, 0.5], to: [3.0, 1.0, -0.5], color: '#38D9FF', speed: 0.8, intensity: 0.4 },
          { from: [3.0, 1.0, -0.5], to: [1.9, -2.6, 0.8], color: '#A855F7', speed: 0.8, intensity: 0.4 },
          { from: [1.9, -2.6, 0.8], to: [-1.9, -2.6, -0.8], color: '#FF7A18', speed: 0.8, intensity: 0.4 },
          { from: [-1.9, -2.6, -0.8], to: [-3.0, 1.0, 0.5], color: '#FFB347', speed: 0.8, intensity: 0.4 },
          { from: [-3.0, 1.0, 0.5], to: [0, 3.2, 0.5], color: '#FFB347', speed: 0.8, intensity: 0.4 },
        ],
      };

    case 'network':
      return {
        cameraZ: 15,
        particleCount: 300,
        nodes: [
          { id: 'gw-1', position: [-4, 2, -1], color: '#38D9FF', size: 0.7, pulseRate: 1.2, type: 'gateway' },
          { id: 'core-1', position: [-1.5, 0.5, 1], color: '#FF7A18', size: 1.1, pulseRate: 1.9, type: 'core' },
          { id: 'core-2', position: [1.8, -0.5, 0], color: '#FFB347', size: 1.0, pulseRate: 1.7, type: 'core' },
          { id: 'sw-1', position: [-2.5, -2.5, -0.5], color: '#A855F7', size: 0.6, pulseRate: 1.4, type: 'switch' },
          { id: 'sw-2', position: [3.5, 2.2, 0.5], color: '#38D9FF', size: 0.6, pulseRate: 1.3, type: 'switch' },
          { id: 'sw-3', position: [4.2, -1.8, -1], color: '#FF7A18', size: 0.65, pulseRate: 1.6, type: 'switch' },
          { id: 'agent-diag', position: [0.2, 2.8, -0.2], color: '#FFB347', size: 0.75, pulseRate: 2.1, type: 'agent' },
        ],
        connections: [
          { from: [-4, 2, -1], to: [-1.5, 0.5, 1], color: '#38D9FF', speed: 1.0, intensity: 0.6 },
          { from: [-1.5, 0.5, 1], to: [1.8, -0.5, 0], color: '#FF7A18', speed: 1.8, intensity: 0.9 },
          { from: [-1.5, 0.5, 1], to: [-2.5, -2.5, -0.5], color: '#A855F7', speed: 1.2, intensity: 0.6 },
          { from: [1.8, -0.5, 0], to: [3.5, 2.2, 0.5], color: '#38D9FF', speed: 1.1, intensity: 0.7 },
          { from: [1.8, -0.5, 0], to: [4.2, -1.8, -1], color: '#FF7A18', speed: 1.3, intensity: 0.7 },
          { from: [-1.5, 0.5, 1], to: [0.2, 2.8, -0.2], color: '#FFB347', speed: 1.5, intensity: 0.8 },
          { from: [1.8, -0.5, 0], to: [0.2, 2.8, -0.2], color: '#FFB347', speed: 1.5, intensity: 0.8 },
        ],
      };

    case 'minimal':
      return {
        cameraZ: 13,
        particleCount: 120,
        nodes: [
          { id: 'c1', position: [-2, 0, 0], color: '#FF7A18', size: 0.9, pulseRate: 1.1, type: 'core' },
          { id: 'c2', position: [2, 0.5, -0.5], color: '#FFB347', size: 0.8, pulseRate: 1.2, type: 'agent' },
          { id: 'c3', position: [0, -1.8, 0.5], color: '#A855F7', size: 0.6, pulseRate: 1.0, type: 'switch' },
        ],
        connections: [
          { from: [-2, 0, 0], to: [2, 0.5, -0.5], color: '#FFB347', speed: 0.8, intensity: 0.5 },
          { from: [-2, 0, 0], to: [0, -1.8, 0.5], color: '#FF7A18', speed: 0.7, intensity: 0.5 },
          { from: [2, 0.5, -0.5], to: [0, -1.8, 0.5], color: '#A855F7', speed: 0.7, intensity: 0.5 },
        ],
      };

    case 'telemetry':
      return {
        cameraZ: 14,
        particleCount: 350,
        nodes: [
          { id: 't1', position: [-3.5, -1, 0], color: '#38D9FF', size: 0.7, pulseRate: 2.5, type: 'gateway' },
          { id: 't2', position: [-1.2, 1.2, 0.5], color: '#FF7A18', size: 1.0, pulseRate: 2.0, type: 'core' },
          { id: 't3', position: [1.5, -1.2, -0.5], color: '#FFB347', size: 0.85, pulseRate: 2.2, type: 'agent' },
          { id: 't4', position: [3.8, 1, 0], color: '#38D9FF', size: 0.7, pulseRate: 2.4, type: 'switch' },
        ],
        connections: [
          { from: [-3.5, -1, 0], to: [-1.2, 1.2, 0.5], color: '#38D9FF', speed: 2.2, intensity: 0.8 },
          { from: [-1.2, 1.2, 0.5], to: [1.5, -1.2, -0.5], color: '#FF7A18', speed: 2.5, intensity: 0.9 },
          { from: [1.5, -1.2, -0.5], to: [3.8, 1, 0], color: '#FFB347', speed: 2.0, intensity: 0.8 },
        ],
      };

    case 'default':
    default:
      return {
        cameraZ: 14,
        particleCount: 220,
        nodes: [
          { id: 'nexus', position: [0, 0.2, 0], color: '#FF7A18', size: 1.15, pulseRate: 1.8, type: 'core', label: 'Nexus' },
          { id: 'node-nw', position: [-3.2, 2.0, -1.2], color: '#FFB347', size: 0.7, pulseRate: 1.4, type: 'agent' },
          { id: 'node-ne', position: [3.2, 1.8, 0.8], color: '#38D9FF', size: 0.65, pulseRate: 1.3, type: 'gateway' },
          { id: 'node-sw', position: [-2.5, -2.2, 0.5], color: '#A855F7', size: 0.75, pulseRate: 1.6, type: 'switch' },
          { id: 'node-se', position: [2.8, -2.0, -0.6], color: '#FF7A18', size: 0.7, pulseRate: 1.5, type: 'agent' },
          { id: 'node-center-up', position: [0, 2.8, 0.5], color: '#FFB347', size: 0.55, pulseRate: 1.7, type: 'switch' },
        ],
        connections: [
          { from: [0, 0.2, 0], to: [-3.2, 2.0, -1.2], color: '#FFB347', speed: 1.2, intensity: 0.7 },
          { from: [0, 0.2, 0], to: [3.2, 1.8, 0.8], color: '#38D9FF', speed: 1.1, intensity: 0.7 },
          { from: [0, 0.2, 0], to: [-2.5, -2.2, 0.5], color: '#A855F7', speed: 1.3, intensity: 0.8 },
          { from: [0, 0.2, 0], to: [2.8, -2.0, -0.6], color: '#FF7A18', speed: 1.4, intensity: 0.8 },
          { from: [0, 0.2, 0], to: [0, 2.8, 0.5], color: '#FFB347', speed: 1.0, intensity: 0.6 },
          { from: [-3.2, 2.0, -1.2], to: [0, 2.8, 0.5], color: '#FFB347', speed: 0.9, intensity: 0.4 },
          { from: [3.2, 1.8, 0.8], to: [2.8, -2.0, -0.6], color: '#38D9FF', speed: 0.9, intensity: 0.4 },
        ],
      };
  }
}
