import { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';

export interface AgentNodeConfig {
  id: string;
  name: string;
  role: string;
  status: 'done' | 'processing' | 'running' | 'idle';
  statusBadge?: string;
  color: string;
  glowColor: string;
  angle: number; // in radians
  distance: number;
}

export const FIVE_AGENTS: AgentNodeConfig[] = [
  {
    id: 'perf',
    name: 'Performance Agent',
    role: 'Analyzes latency, packet loss and throughput bottlenecks',
    status: 'done',
    color: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    angle: -Math.PI / 2, // Top
    distance: 2.7,
  },
  {
    id: 'infra',
    name: 'Infrastructure Health Agent',
    role: 'Monitors device CPU, memory, power and interface health',
    status: 'done',
    statusBadge: '✓ Done',
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    angle: -Math.PI * 0.9, // Left
    distance: 2.8,
  },
  {
    id: 'conn',
    name: 'Connectivity Analysis Agent',
    role: 'Traces route topology, BGP peering and hop-by-hop latency',
    status: 'processing',
    statusBadge: 'Processing...',
    color: '#38D9FF',
    glowColor: 'rgba(56, 217, 255, 0.4)',
    angle: -Math.PI * 0.1, // Right
    distance: 2.8,
  },
  {
    id: 'corr',
    name: 'Fault Correlation Agent',
    role: 'Cross-correlates multi-source anomalies and pinpoints root cause',
    status: 'running',
    statusBadge: 'Running...',
    color: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    angle: Math.PI * 0.72, // Lower-Left
    distance: 2.8,
  },
  {
    id: 'rec',
    name: 'Recommendation & Reporting Agent',
    role: 'Generates remediation steps and automated playbook actions',
    status: 'running',
    color: '#38D9FF',
    glowColor: 'rgba(56, 217, 255, 0.4)',
    angle: Math.PI * 0.28, // Lower-Right
    distance: 2.8,
  },
];

function CentralOrchestrator({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.35;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.2;
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.04;
      ringRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Glowing Energy Ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[1.05, 1.18, 48]} />
        <meshBasicMaterial color="#FF7A18" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* Main Orchestrator Core Disc */}
      <mesh ref={meshRef}>
        <circleGeometry args={[0.92, 36]} />
        <meshStandardMaterial
          color="#FF7A18"
          emissive="#FF7A18"
          emissiveIntensity={1.1}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Center 3-Nodes Network Symbol */}
      <mesh position={[0, 0.2, 0.01]}>
        <circleGeometry args={[0.07, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.18, -0.12, 0.01]}>
        <circleGeometry args={[0.07, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.18, -0.12, 0.01]}>
        <circleGeometry args={[0.07, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* HTML Label for Orchestrator */}
      <Html center style={{ pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', userSelect: 'none', transform: 'translateY(16px)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            Orchestrator
          </div>
        </div>
      </Html>
    </group>
  );
}

function AgentSatellite({
  agent,
  isSelected,
  onSelect,
  reducedMotion,
}: {
  agent: AgentNodeConfig;
  isSelected: boolean;
  onSelect: (a: AgentNodeConfig) => void;
  reducedMotion: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);

  const x = Math.cos(agent.angle) * agent.distance;
  const y = Math.sin(agent.angle) * agent.distance;

  useFrame((state) => {
    if (reducedMotion || !ringRef.current) return;
    const t = state.clock.getElapsedTime();
    const s = 1 + Math.sin(t * 3 + agent.angle) * 0.06;
    ringRef.current.scale.set(s, s, s);
  });

  return (
    <group
      position={[x, y, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(agent);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Outer Halo Ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.62, 0.7, 36]} />
        <meshBasicMaterial color={agent.color} transparent opacity={hovered || isSelected ? 0.9 : 0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Agent Sphere/Disc Core */}
      <mesh>
        <circleGeometry args={[0.55, 32]} />
        <meshStandardMaterial
          color={hovered || isSelected ? '#191C26' : '#11131A'}
          emissive={agent.color}
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* HTML Agent Label and Badge */}
      <Html center style={{ pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', userSelect: 'none', width: '130px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#F5F5F7', lineHeight: 1.2 }}>
            {agent.name}
          </div>
          {agent.statusBadge && (
            <div
              style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: agent.color === '#10B981' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 217, 255, 0.2)',
                border: `1px solid ${agent.color}`,
                color: agent.color,
                fontSize: '9px',
                fontWeight: 700,
              }}
            >
              {agent.statusBadge}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

function RadialSpokes() {
  return (
    <group>
      {FIVE_AGENTS.map((agent) => {
        const x = Math.cos(agent.angle) * agent.distance;
        const y = Math.sin(agent.angle) * agent.distance;
        const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, 0)];
        const curve = new THREE.LineCurve3(points[0], points[1]);
        const geom = new THREE.TubeGeometry(curve, 16, 0.02, 6, false);

        return (
          <mesh key={agent.id} geometry={geom}>
            <meshBasicMaterial color={agent.color} transparent opacity={0.65} />
          </mesh>
        );
      })}
    </group>
  );
}

interface AgentOrchestration3DProps {
  onSelectAgent?: (agent: AgentNodeConfig) => void;
}

export function AgentOrchestration3D({ onSelectAgent }: AgentOrchestration3DProps) {
  const reducedMotion = useReducedMotion();
  const [selectedAgent, setSelectedAgent] = useState<AgentNodeConfig>(FIVE_AGENTS[0]);

  const handleSelect = (agent: AgentNodeConfig) => {
    setSelectedAgent(agent);
    if (onSelectAgent) onSelectAgent(agent);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '460px',
        backgroundColor: 'rgba(10, 12, 18, 0.75)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 122, 24, 0.25)',
        boxShadow: '0 0 24px -6px rgba(255, 122, 24, 0.15)',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 7.8], fov: 46 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[0, 0, 3]} intensity={2} color="#FF7A18" />
        <pointLight position={[-3, 2, 2]} intensity={1} color="#10B981" />
        <pointLight position={[3, 2, 2]} intensity={1} color="#38D9FF" />

        <Suspense fallback={null}>
          <RadialSpokes />
          <CentralOrchestrator reducedMotion={reducedMotion} />
          {FIVE_AGENTS.map((agent) => (
            <AgentSatellite
              key={agent.id}
              agent={agent}
              isSelected={selectedAgent.id === agent.id}
              onSelect={handleSelect}
              reducedMotion={reducedMotion}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}
