import { useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import { FIVE_AGENTS } from '../utils/mockTopology';

interface FiveAgentsOrbital3DProps {
  selectedAgentId?: string | null;
  onSelectAgent?: (agentId: string) => void;
}

// Specific reference spatial layout positions:
// - Fault Correlation: upper-center (Purple)
// - Connectivity: upper-left (Blue)
// - Infrastructure: upper-right (Orange)
// - Telemetry: lower-left (Cyan)
// - Recommendation: lower-right (Green)
const REFERENCE_AGENT_COORDS: Record<string, [number, number, number]> = {
  'correlation-agent': [0, 0.9, -3.6],
  'connectivity-agent': [-3.6, 0.5, -1.8],
  'infra-agent': [3.6, 0.5, -1.8],
  'telemetry-agent': [-3.2, -0.2, 2.2],
  'recommendation-agent': [3.2, -0.2, 2.2],
};

// 5 Agent nodes in spatial layout
function AgentOrbitalNode({
  agent,
  index,
  total,
  isSelected,
  onSelect,
}: {
  agent: (typeof FIVE_AGENTS)[0];
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = agent.color || agent.accentColor;
  const targetPos = REFERENCE_AGENT_COORDS[agent.id] || [
    4.0 * Math.cos((index * 2 * Math.PI) / total - Math.PI / 2),
    0.2,
    4.0 * Math.sin((index * 2 * Math.PI) / total - Math.PI / 2),
  ];
  const [x, y, z] = targetPos;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = y + Math.sin(t * 1.5 + index) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * (index % 2 === 0 ? 0.8 : -0.8);
    }
  });

  return (
    <group>
      {/* Energy Beam to Central Core */}
      <Line
        points={[
          [0, 0.2, 0],
          [x, y, z],
        ]}
        color={color}
        lineWidth={2}
        transparent
        opacity={isSelected ? 0.85 : hovered ? 0.65 : 0.35}
      />

      {/* Floating Agent Pod */}
      <group
        ref={meshRef}
        position={[x, y, z]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        {/* Outer Rotating Energy Ring */}
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.75, 0.88, 32]} />
          <meshBasicMaterial
            color={color}
            side={THREE.DoubleSide}
            transparent
            opacity={isSelected ? 0.9 : 0.4}
          />
        </mesh>

        {/* Outer Orbit Halo */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.95, 1.0, 32]} />
          <meshBasicMaterial
            color={color}
            side={THREE.DoubleSide}
            transparent
            opacity={0.18}
          />
        </mesh>

        {/* Central Agent Geometric Core */}
        <mesh castShadow>
          <octahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 1.8 : hovered ? 1.4 : 0.8}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Inner Crystalline Core */}
        <mesh>
          <dodecahedronGeometry args={[0.22, 0]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>

        {/* Aura Point Light */}
        <pointLight
          color={color}
          intensity={isSelected ? 3.0 : 1.2}
          distance={4}
          decay={2}
        />

        {/* Agent Label Billboard */}
        <Html distanceFactor={13} position={[0, 0.95, 0]} center>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-mono whitespace-nowrap backdrop-blur-md border shadow-2xl transition-all cursor-pointer ${
              isSelected
                ? 'bg-[#0A1018] text-[#F4F6FA] border-2 scale-110 shadow-lg'
                : 'bg-[#05080D]/90 text-[#A2ACBA] border-white/10 hover:text-[#F4F6FA] hover:border-white/30'
            }`}
            style={{
              borderColor: isSelected ? color : undefined,
              boxShadow: isSelected ? `0 0 16px ${color}50` : undefined,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="font-bold text-[#F4F6FA]">{agent.name}</span>
            </div>
            <div className="text-[9px] text-[#A2ACBA] flex items-center justify-between gap-2 mt-0.5">
              <span>{agent.role}</span>
              <span className="text-[#26D7A0] font-semibold">{agent.status}</span>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

// Central Intelligence Core
function CentralIntelligenceCore() {
  const coreRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.3;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.4;
    if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.55;
    if (ring3Ref.current) ring3Ref.current.rotation.z = t * 0.25;
  });

  return (
    <group ref={coreRef} position={[0, 0.2, 0]}>
      {/* Central Pulsing Sphere */}
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color="#FF8A24"
          emissive="#FF8A24"
          emissiveIntensity={2.2}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Wireframe Energy Shell */}
      <mesh>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshBasicMaterial color="#FFB45C" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Rotating Concentric Equatorial Energy Rings */}
      <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.45, 48]} />
        <meshBasicMaterial
          color="#FF8A24"
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>

      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.7, 1.82, 48]} />
        <meshBasicMaterial
          color="#20D9FF"
          side={THREE.DoubleSide}
          transparent
          opacity={0.5}
        />
      </mesh>

      <mesh ref={ring3Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.1, 2.18, 48]} />
        <meshBasicMaterial
          color="#FF8A24"
          side={THREE.DoubleSide}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Outer Ground Energy Ring */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 4.4, 64]} />
        <meshBasicMaterial
          color="#FF8A24"
          side={THREE.DoubleSide}
          transparent
          opacity={0.06}
        />
      </mesh>

      {/* Central Core Point Light */}
      <pointLight color="#FF8A24" intensity={4.5} distance={10} decay={2} />
      <pointLight color="#20D9FF" intensity={2.0} distance={7} decay={2} />

      {/* Core Label */}
      <Html distanceFactor={14} position={[0, -0.9, 0]} center>
        <div className="px-3 py-1 rounded-full bg-[#05080D]/90 backdrop-blur-md border border-[#FF8A24]/40 text-[10px] font-mono font-bold text-[#FF8A24] tracking-widest whitespace-nowrap shadow-lg shadow-[#FF8A24]/10">
          ORCHESTRATOR CONSENSUS HUB
        </div>
      </Html>
    </group>
  );
}

// Module-level static geometry for cosmic particles
function createCosmicGeometry() {
  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 3 + Math.random() * 8;
    const theta = Math.random() * 2 * Math.PI;
    const phi = (Math.random() - 0.5) * Math.PI * 0.5;
    positions[i * 3] = r * Math.cos(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi);
    positions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geo;
}

const COSMIC_GEOMETRY = createCosmicGeometry();

// Background Radial Grid & Ambient Cosmic Particles
function CosmicEnvironment() {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <group>
      {/* Radial floor grid */}
      <gridHelper args={[24, 24, '#FF8A24', '#101A25']} position={[0, -1.2, 0]} />

      {/* Ambient floating spark particles */}
      <points ref={pointsRef} geometry={COSMIC_GEOMETRY}>
        <pointsMaterial
          size={0.07}
          color="#20D9FF"
          transparent
          opacity={0.65}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export function FiveAgentsOrbital3D({
  selectedAgentId,
  onSelectAgent,
}: FiveAgentsOrbital3DProps) {
  return (
    <div className="w-full h-[520px] relative rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
      <Canvas
        camera={{ position: [0, 6.2, 8.8], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />

        <CosmicEnvironment />
        <CentralIntelligenceCore />

        {FIVE_AGENTS.map((agent, index) => (
          <AgentOrbitalNode
            key={agent.id}
            agent={agent}
            index={index}
            total={FIVE_AGENTS.length}
            isSelected={selectedAgentId === agent.id}
            onSelect={() => onSelectAgent?.(agent.id)}
          />
        ))}

        <OrbitControls
          enableZoom={true}
          minDistance={5}
          maxDistance={14}
          maxPolarAngle={Math.PI / 2.05}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Control overlay tip */}
      <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-[#080B10]/85 backdrop-blur-md border border-white/10 text-[11px] font-mono text-[#A2ACBA] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#FF8A24] animate-ping" />
        Click any agent pod to inspect diagnostics & message logs
      </div>
    </div>
  );
}
