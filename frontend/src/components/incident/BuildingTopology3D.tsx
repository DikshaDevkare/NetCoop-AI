import { useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';

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

interface BuildingTopology3DProps {
  onSelectNode?: (node: BuildingNode) => void;
}

const BUILDINGS: BuildingNode[] = [
  {
    id: 'building-a',
    name: 'Building A',
    type: 'building',
    status: 'affected',
    position: [-2.4, 0, 0.4],
    color: '#FF4D4D',
    badge: 'Building A (Affected)',
    height: 1.5,
  },
  {
    id: 'core-b',
    name: 'Core B',
    type: 'core',
    status: 'healthy',
    position: [0, 0, 0],
    color: '#38D9FF',
    badge: 'Core B',
    height: 0.5,
  },
  {
    id: 'building-b',
    name: 'Building B',
    type: 'building',
    status: 'healthy',
    position: [2.5, 0, -1.2],
    color: '#10B981',
    badge: 'Building B (Healthy)',
    height: 1.4,
  },
  {
    id: 'branch-c',
    name: 'Branch C',
    type: 'branch',
    status: 'degraded',
    position: [2.2, 0, 1.6],
    color: '#FFB347',
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
      const s = 1 + Math.sin(t * 3) * 0.15;
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
      {/* Ground Glow Ring */}
      <mesh
        ref={ringRef}
        position={[0, -0.4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.3, 0.75, 32]} />
        <meshBasicMaterial
          color={bldg.color}
          transparent
          opacity={bldg.status === 'affected' ? 0.35 : 0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main Structure Body */}
      {bldg.type === 'core' ? (
        // Central Core Cyber Hub
        <group position={[0, -0.15, 0]}>
          <mesh>
            <cylinderGeometry args={[0.5, 0.6, 0.35, 6]} />
            <meshStandardMaterial
              color="#191C26"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial color="#38D9FF" wireframe />
          </mesh>
        </group>
      ) : (
        // 3D Skyscraper Building Block with glowing windows
        <group position={[0, bldg.height / 2 - 0.4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.8, bldg.height, 0.8]} />
            <meshStandardMaterial
              color={isSelected ? '#25293A' : hovered ? '#1E2230' : '#141722'}
              metalness={0.85}
              roughness={0.3}
            />
          </mesh>

          {/* Glowing Window Slits */}
          {[-0.2, 0, 0.2].map((x, xi) => (
            <mesh key={xi} position={[x, 0, 0.41]}>
              <planeGeometry args={[0.08, bldg.height * 0.7]} />
              <meshBasicMaterial
                color={bldg.color}
                transparent
                opacity={0.65}
              />
            </mesh>
          ))}

          {/* Roof Beacon */}
          <mesh position={[0, bldg.height / 2 + 0.08, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color={bldg.color} />
          </mesh>

          {/* Selected Outline Wireframe */}
          {(isSelected || hovered) && (
            <mesh>
              <boxGeometry args={[0.84, bldg.height + 0.04, 0.84]} />
              <meshBasicMaterial
                color={bldg.color}
                wireframe
                transparent
                opacity={0.7}
              />
            </mesh>
          )}
        </group>
      )}

      {/* HTML Status Badge */}
      <Html
        position={[0, bldg.height + 0.1, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'rgba(8, 9, 13, 0.9)',
            border: `1px solid ${bldg.color}70`,
            boxShadow: `0 0 10px ${bldg.color}35`,
            color: '#F5F5F7',
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

// Glowing traces linking Core B to Building A, Building B, and Branch C
function LinkTraces() {
  const corePos = new THREE.Vector3(0, -0.38, 0);
  const targets = [
    { pos: new THREE.Vector3(-2.4, -0.38, 0.4), color: '#FF4D4D' },
    { pos: new THREE.Vector3(2.5, -0.38, -1.2), color: '#10B981' },
    { pos: new THREE.Vector3(2.2, -0.38, 1.6), color: '#FFB347' },
  ];

  return (
    <group>
      {targets.map((tgt, i) => {
        const curve = new THREE.LineCurve3(corePos, tgt.pos);
        const geom = new THREE.TubeGeometry(curve, 16, 0.02, 8, false);
        return (
          <mesh key={i} geometry={geom}>
            <meshBasicMaterial color={tgt.color} transparent opacity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

export function BuildingTopology3D({ onSelectNode }: BuildingTopology3DProps) {
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
        backgroundColor: 'rgba(10, 12, 18, 0.75)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 122, 24, 0.25)',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 5, 6], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <pointLight position={[-2.4, 2, 0.4]} intensity={2} color="#FF4D4D" distance={6} />
        <pointLight position={[2.5, 2, -1.2]} intensity={1.5} color="#10B981" distance={6} />
        <pointLight position={[0, 1.5, 0]} intensity={1.5} color="#38D9FF" distance={6} />

        {/* Perspective Cyber Grid Floor */}
        <gridHelper
          args={[14, 28, '#FF7A18', '#1A1D2B']}
          position={[0, -0.4, 0]}
        />

        <Suspense fallback={null}>
          <LinkTraces />
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
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
}
