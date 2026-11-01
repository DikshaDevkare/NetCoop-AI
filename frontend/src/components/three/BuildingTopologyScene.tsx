import { useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { PerspectiveGrid } from './PerspectiveGrid.tsx';

export interface BuildingNode {
  id: string;
  name: string;
  type: 'building' | 'core' | 'branch';
  status: 'affected' | 'healthy' | 'degraded';
  position: [number, number, number];
  color: string;
  badge: string;
  height: number;
}

interface BuildingTopologySceneProps {
  onSelectNode?: (node: BuildingNode) => void;
}

const BUILDINGS: BuildingNode[] = [
  {
    id: 'building-a',
    name: 'Building A',
    type: 'building',
    status: 'affected',
    position: [-2.4, 0, 0.4],
    color: '#F05252',
    badge: 'Building A (Affected)',
    height: 1.5,
  },
  {
    id: 'core-b',
    name: 'Core B',
    type: 'core',
    status: 'healthy',
    position: [0, 0, 0],
    color: '#36CBE8',
    badge: 'Core B',
    height: 0.5,
  },
  {
    id: 'building-b',
    name: 'Building B',
    type: 'building',
    status: 'healthy',
    position: [2.5, 0, -1.2],
    color: '#21D69A',
    badge: 'Building B (Healthy)',
    height: 1.4,
  },
  {
    id: 'branch-c',
    name: 'Branch C',
    type: 'branch',
    status: 'degraded',
    position: [2.2, 0, 1.6],
    color: '#FF9A24',
    badge: 'Branch C (Degraded)',
    height: 0.8,
  },
];

function BuildingModel({
  bldg,
  isSelected,
  onSelect,
  reducedMotion,
}: {
  bldg: BuildingNode;
  isSelected: boolean;
  onSelect: (b: BuildingNode) => void;
  reducedMotion: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    if (ringRef.current && bldg.status === 'affected') {
      const t = state.clock.getElapsedTime();
      const s = 1 + Math.sin(t * 3) * 0.14;
      ringRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group
      position={bldg.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(bldg);
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
      {/* Ground Glow Base Ring */}
      <mesh ref={ringRef} position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.75, 32]} />
        <meshBasicMaterial
          color={bldg.color}
          transparent
          opacity={bldg.status === 'affected' ? 0.4 : 0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main Structure Body */}
      {bldg.type === 'core' ? (
        // Central Core B Network Device
        <group position={[0, -0.15, 0]}>
          <mesh>
            <cylinderGeometry args={[0.5, 0.6, 0.35, 6]} />
            <meshStandardMaterial color="#151722" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial color="#36CBE8" wireframe />
          </mesh>
        </group>
      ) : (
        // 3D Skyscraper Building Geometric Model
        <group position={[0, bldg.height / 2 - 0.4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.8, bldg.height, 0.8]} />
            <meshStandardMaterial
              color={isSelected ? '#1A1D2B' : hovered ? '#151722' : '#11131C'}
              metalness={0.88}
              roughness={0.25}
            />
          </mesh>

          {/* Glowing Window Slits */}
          {[-0.2, 0, 0.2].map((x, xi) => (
            <mesh key={xi} position={[x, 0, 0.41]}>
              <planeGeometry args={[0.08, bldg.height * 0.7]} />
              <meshBasicMaterial color={bldg.color} transparent opacity={0.65} />
            </mesh>
          ))}

          {/* Roof Beacon */}
          <mesh position={[0, bldg.height / 2 + 0.08, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color={bldg.color} />
          </mesh>

          {/* Wireframe Outline on hover / selection */}
          {(isSelected || hovered || bldg.status === 'affected') && (
            <mesh>
              <boxGeometry args={[0.84, bldg.height + 0.04, 0.84]} />
              <meshBasicMaterial
                color={bldg.color}
                wireframe
                transparent
                opacity={bldg.status === 'affected' ? 0.85 : 0.6}
              />
            </mesh>
          )}
        </group>
      )}

      {/* HTML Status Badge Label */}
      <Html position={[0, bldg.height + 0.1, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'rgba(8, 9, 13, 0.92)',
            border: `1px solid ${bldg.color}75`,
            boxShadow: `0 0 10px ${bldg.color}35`,
            color: '#F4F4F7',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {bldg.badge}
        </div>
      </Html>
    </group>
  );
}

// Fine Connections with Traveling Energy Pulses
function BuildingLinkTraces({ reducedMotion }: { reducedMotion: boolean }) {
  const corePos = new THREE.Vector3(0, -0.38, 0);
  const targets = [
    { pos: new THREE.Vector3(-2.4, -0.38, 0.4), color: '#F05252' },
    { pos: new THREE.Vector3(2.5, -0.38, -1.2), color: '#21D69A' },
    { pos: new THREE.Vector3(2.2, -0.38, 1.6), color: '#FF9A24' },
  ];

  const pulseRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion || !pulseRef.current) return;
    const t = state.clock.getElapsedTime();
    pulseRef.current.children.forEach((pulse, idx) => {
      const tgt = targets[idx];
      const prog = (t * 0.75 + idx * 0.3) % 1;
      pulse.position.lerpVectors(corePos, tgt.pos, prog);
      pulse.position.y = -0.36 + Math.sin(prog * Math.PI) * 0.05;
    });
  });

  return (
    <group>
      {targets.map((tgt, i) => {
        const curve = new THREE.LineCurve3(corePos, tgt.pos);
        const geom = new THREE.TubeGeometry(curve, 16, 0.018, 8, false);
        return (
          <mesh key={i} geometry={geom}>
            <meshBasicMaterial color={tgt.color} transparent opacity={0.65} />
          </mesh>
        );
      })}

      {/* Traveling energy pulse spheres */}
      <group ref={pulseRef}>
        {targets.map((tgt, i) => (
          <mesh key={`pulse-${i}`}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color={tgt.color} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function BuildingTopologyScene({ onSelectNode }: BuildingTopologySceneProps) {
  const reducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string>('building-a');

  const handleSelect = (bldg: BuildingNode) => {
    setSelectedId(bldg.id);
    if (onSelectNode) onSelectNode(bldg);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        backgroundColor: '#08090D',
        borderRadius: '14px',
        border: '1px solid rgba(255, 154, 36, 0.22)',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 5, 6], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.1} />
        <pointLight position={[-2.4, 2, 0.4]} intensity={2.2} color="#F05252" distance={6} />
        <pointLight position={[2.5, 2, -1.2]} intensity={1.5} color="#21D69A" distance={6} />
        <pointLight position={[0, 1.5, 0]} intensity={1.6} color="#36CBE8" distance={6} />

        {/* Perspective Grid Floor */}
        <PerspectiveGrid size={14} divisions={28} position={[0, -0.4, 0]} />

        <Suspense fallback={null}>
          <BuildingLinkTraces reducedMotion={reducedMotion} />
          {BUILDINGS.map((bldg) => (
            <BuildingModel
              key={bldg.id}
              bldg={bldg}
              isSelected={selectedId === bldg.id}
              onSelect={handleSelect}
              reducedMotion={reducedMotion}
            />
          ))}
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 4}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.25}
        />
      </Canvas>
    </div>
  );
}

// Re-export alias for compatibility
export { BuildingTopologyScene as BuildingTopology3D, BuildingTopologyScene as IncidentTopology };
