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
  angle: number; // in radians
  distance: number;
}

export const EXACT_FIVE_AGENTS: AgentNodeConfig[] = [
  {
    id: 'perf',
    name: 'Performance Agent',
    role: 'Analyzes latency, packet loss and throughput bottlenecks',
    status: 'done',
    color: '#9A45FF', // Purple
    angle: -Math.PI / 2, // TOP
    distance: 2.7,
  },
  {
    id: 'infra',
    name: 'Infrastructure Health Agent',
    role: 'Monitors device CPU, memory, power and interface health',
    status: 'done',
    statusBadge: '✓ Done',
    color: '#21D69A', // Green
    angle: -Math.PI * 0.9, // LEFT
    distance: 2.8,
  },
  {
    id: 'conn',
    name: 'Connectivity Analysis Agent',
    role: 'Traces route topology, BGP peering and hop-by-hop latency',
    status: 'processing',
    statusBadge: 'Processing...',
    color: '#36CBE8', // Blue
    angle: -Math.PI * 0.1, // RIGHT
    distance: 2.8,
  },
  {
    id: 'corr',
    name: 'Fault Correlation Agent',
    role: 'Cross-correlates multi-source anomalies and pinpoints root cause',
    status: 'running',
    statusBadge: 'Running...',
    color: '#9A45FF', // Violet
    angle: Math.PI * 0.72, // BOTTOM-LEFT
    distance: 2.8,
  },
  {
    id: 'rec',
    name: 'Recommendation & Reporting Agent',
    role: 'Generates remediation steps and automated playbook actions',
    status: 'running',
    color: '#36CBE8', // Cyan
    angle: Math.PI * 0.28, // BOTTOM-RIGHT
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
      {/* Outer Glowing Amber Energy Ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[1.05, 1.18, 48]} />
        <meshBasicMaterial color="#FF9A24" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* Main Orchestrator Core Disc with Amber/Orange Glow */}
      <mesh ref={meshRef}>
        <circleGeometry args={[0.92, 36]} />
        <meshStandardMaterial
          color="#FF9A24"
          emissive="#FF6A16"
          emissiveIntensity={1.2}
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
        <meshBasicMaterial
          color={agent.color}
          transparent
          opacity={hovered || isSelected ? 0.95 : 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Agent Disc Core */}
      <mesh>
        <circleGeometry args={[0.55, 32]} />
        <meshStandardMaterial
          color={hovered || isSelected ? '#151722' : '#11131C'}
          emissive={agent.color}
          emissiveIntensity={0.55}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* HTML Agent Label and Badge */}
      <Html center style={{ pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', userSelect: 'none', width: '130px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#F4F4F7', lineHeight: 1.2 }}>
            {agent.name}
          </div>
          {agent.statusBadge && (
            <div
              style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor:
                  agent.color === '#21D69A' ? 'rgba(33, 214, 154, 0.2)' : 'rgba(54, 203, 232, 0.2)',
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

// Curved Glowing Links with Animated Pulse Particles
function RadialCurvedSpokes({ reducedMotion }: { reducedMotion: boolean }) {
  const particlesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion || !particlesRef.current) return;
    const t = state.clock.getElapsedTime();
    particlesRef.current.children.forEach((p, idx) => {
      const agent = EXACT_FIVE_AGENTS[idx];
      if (!agent) return;
      const prog = (t * 0.9 + idx * 0.2) % 1;
      const x = Math.cos(agent.angle) * agent.distance * prog;
      const y = Math.sin(agent.angle) * agent.distance * prog;
      p.position.set(x, y, 0.02);
    });
  });

  return (
    <group>
      {/* Curved / direct glowing energy tubes */}
      {EXACT_FIVE_AGENTS.map((agent) => {
        const x = Math.cos(agent.angle) * agent.distance;
        const y = Math.sin(agent.angle) * agent.distance;
        const points = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(x * 0.5, y * 0.5, 0.1),
          new THREE.Vector3(x, y, 0),
        ];
        const curve = new THREE.CatmullRomCurve3(points);
        const geom = new THREE.TubeGeometry(curve, 16, 0.018, 6, false);

        return (
          <mesh key={agent.id} geometry={geom}>
            <meshBasicMaterial color={agent.color} transparent opacity={0.65} />
          </mesh>
        );
      })}

      {/* Traveling communication particles along spokes */}
      <group ref={particlesRef}>
        {EXACT_FIVE_AGENTS.map((agent) => (
          <mesh key={`pulse-${agent.id}`}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color={agent.color} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

interface AgentOrbitSceneProps {
  onSelectAgent?: (agent: AgentNodeConfig) => void;
}

export function AgentOrbitScene({ onSelectAgent }: AgentOrbitSceneProps) {
  const reducedMotion = useReducedMotion();
  const [selectedAgent, setSelectedAgent] = useState<AgentNodeConfig>(EXACT_FIVE_AGENTS[0]);

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
        backgroundColor: '#08090D',
        borderRadius: '14px',
        border: '1px solid rgba(255, 154, 36, 0.22)',
        boxShadow: '0 0 24px -6px rgba(255, 106, 22, 0.12)',
        overflow: 'hidden',
      }}
    >
      <Canvas camera={{ position: [0, 0, 7.8], fov: 46 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.75} />
        <pointLight position={[0, 0, 3]} intensity={2.2} color="#FF9A24" />
        <pointLight position={[-3, 2, 2]} intensity={1.1} color="#21D69A" />
        <pointLight position={[3, 2, 2]} intensity={1.1} color="#36CBE8" />

        <Suspense fallback={null}>
          <RadialCurvedSpokes reducedMotion={reducedMotion} />
          <CentralOrchestrator reducedMotion={reducedMotion} />
          {EXACT_FIVE_AGENTS.map((agent) => (
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

// Re-export alias for compatibility
export { AgentOrbitScene as AgentOrchestration3D, AgentOrbitScene as OrchestrationDiagram };
