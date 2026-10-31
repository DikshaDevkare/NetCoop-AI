import { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';

export interface AgentNodeConfig {
  id: string;
  name: string;
  status: 'done' | 'processing' | 'running' | 'idle';
  statusLabel: string;
  color: string;
  angle: number; // in radians
  distance: number;
}

export const AGENTS_LIST: AgentNodeConfig[] = [
  { id: 'perf', name: 'Performance Agent', status: 'done', statusLabel: 'Done', color: '#A855F7', angle: -Math.PI / 2, distance: 2.8 },
  { id: 'infra', name: 'Infrastructure Health Agent', status: 'done', statusLabel: '✔ Done', color: '#10B981', angle: -Math.PI * 0.9, distance: 2.8 },
  { id: 'conn', name: 'Connectivity Analysis Agent', status: 'processing', statusLabel: 'Processing...', color: '#38D9FF', angle: -Math.PI * 0.1, distance: 2.8 },
  { id: 'corr', name: 'Fault Correlation Agent', status: 'running', statusLabel: 'Running...', color: '#E02424', angle: Math.PI * 0.7, distance: 2.8 },
  { id: 'rec', name: 'Recommendation & Reporting Agent', status: 'running', statusLabel: 'Synthesizing...', color: '#FFB347', angle: Math.PI * 0.3, distance: 2.8 },
];

function OrchestratorHub({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.25;
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      ringRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Halo */}
      <mesh ref={ringRef}>
        <ringGeometry args={[1.05, 1.15, 48]} />
        <meshBasicMaterial color="#FF7A18" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* Central Nexus Core */}
      <mesh ref={meshRef}>
        <circleGeometry args={[0.9, 32]} />
        <meshStandardMaterial
          color="#FF7A18"
          emissive="#FF7A18"
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* HTML Label for Orchestrator */}
      <Html center style={{ pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', userSelect: 'none' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            Orchestrator
          </div>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', letterSpacing: '0.06em' }}>
            5/5 QUORUM
          </div>
        </div>
      </Html>
    </group>
  );
}

function AgentMeshItem({
  agent,
  isSelected,
  onSelect,
  reducedMotion,
}: {
  agent: AgentNodeConfig;
  isSelected: boolean;
  onSelect: (agent: AgentNodeConfig) => void;
  reducedMotion: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const x = Math.cos(agent.angle) * agent.distance;
  const y = Math.sin(agent.angle) * agent.distance;

  useFrame((state) => {
    if (reducedMotion || !meshRef.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + agent.angle) * 0.06;
    meshRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <group position={[x, y, 0]}>
      {/* Outer Glow Ring */}
      <mesh>
        <ringGeometry args={[0.65, 0.72, 32]} />
        <meshBasicMaterial color={agent.color} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Agent Circle Mesh */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(agent);
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={isSelected ? 1.6 : 0.9}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Agent Name & Status Label */}
      <Html position={[0, -0.9, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', whiteSpace: 'nowrap', userSelect: 'none' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#F5F5F7' }}>{agent.name}</div>
          <span
            style={{
              display: 'inline-block',
              marginTop: '3px',
              fontSize: '10px',
              fontWeight: 600,
              color: agent.color,
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(8, 9, 13, 0.85)',
              border: `1px solid ${agent.color}60`,
            }}
          >
            {agent.statusLabel}
          </span>
        </div>
      </Html>
    </group>
  );
}

function SpokeDataLines({ reducedMotion }: { reducedMotion: boolean }) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const { positions, colors } = useRef(() => {
    const pos: number[] = [];
    const col: number[] = [];

    AGENTS_LIST.forEach((agent) => {
      // Hub to agent
      pos.push(0, 0, 0);
      pos.push(Math.cos(agent.angle) * agent.distance, Math.sin(agent.angle) * agent.distance, 0);

      const cCenter = new THREE.Color('#FF7A18');
      const cAgent = new THREE.Color(agent.color);

      col.push(cCenter.r, cCenter.g, cCenter.b);
      col.push(cAgent.r, cAgent.g, cAgent.b);
    });

    return { positions: new Float32Array(pos), colors: new Float32Array(col) };
  }).current();

  useFrame((state) => {
    if (!lineRef.current || reducedMotion) return;
    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    if (mat) {
      mat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

export function OrchestrationDiagram({ onSelectAgent }: { onSelectAgent?: (agent: AgentNodeConfig) => void }) {
  const reducedMotion = useReducedMotion();
  const [selectedAgent, setSelectedAgent] = useState<AgentNodeConfig>(AGENTS_LIST[0]);

  const handleSelect = (agent: AgentNodeConfig) => {
    setSelectedAgent(agent);
    onSelectAgent?.(agent);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '460px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, rgba(8, 9, 13, 0.85) 75%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <Canvas camera={{ position: [0, 0, 8.2], fov: 46 }} gl={{ alpha: true, antialias: true }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 0, 4]} intensity={2.5} color="#FF7A18" />

          {/* Central Hub */}
          <OrchestratorHub reducedMotion={reducedMotion} />

          {/* Connecting Spoke Lines */}
          <SpokeDataLines reducedMotion={reducedMotion} />

          {/* 5 Agents */}
          {AGENTS_LIST.map((agent) => (
            <AgentMeshItem
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
