import { useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';

interface InvestigationNode {
  id: string;
  name: string;
  label: string;
  status: 'affected' | 'healthy' | 'degraded';
  position: [number, number, number];
  color: string;
}

const NODES: InvestigationNode[] = [
  { id: 'bldg-a', name: 'Building A', label: 'Building A (Affected)', status: 'affected', position: [-2.4, 0.2, 1.2], color: '#FF4D4D' },
  { id: 'core-b', name: 'Core B', label: 'Core B', status: 'healthy', position: [0, 0, 0], color: '#FF7A18' },
  { id: 'bldg-b', name: 'Building B', label: 'Building B (Healthy)', status: 'healthy', position: [2.5, 0.3, -1.0], color: '#10B981' },
  { id: 'branch-c', name: 'Branch C', label: 'Branch C (Degraded)', status: 'degraded', position: [2.2, -0.3, 1.8], color: '#FFB347' },
];

function BuildingPlatform({ node, onSelect, isSelected, reducedMotion }: { node: InvestigationNode; onSelect: (node: InvestigationNode) => void; isSelected: boolean; reducedMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (reducedMotion || !meshRef.current) return;
    if (node.status === 'affected') {
      meshRef.current.position.y = node.position[1] + Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
    } else {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group position={node.position}>
      {/* Base Stepped Rack Platform */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.9, 1.0, 0.2, 6]} />
        <meshStandardMaterial color="#191C26" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Building Server Cube */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
          setHovered(false);
        }}
      >
        <boxGeometry args={[0.7, 0.6, 0.7]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={node.status === 'affected' ? 1.6 : hovered || isSelected ? 1.3 : 0.8}
          roughness={0.2}
          metalness={0.85}
        />
      </mesh>

      {/* Red Pulse Light for Affected Node */}
      {node.status === 'affected' && (
        <pointLight color="#FF4D4D" intensity={3.5} distance={8} decay={2} position={[0, 0.5, 0]} />
      )}

      {/* Reference Badge Html */}
      <Html position={[0, 0.8, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(8, 9, 13, 0.88)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${node.color}60`,
            boxShadow: `0 4px 14px rgba(0, 0, 0, 0.7), 0 0 12px ${node.color}50`,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: node.color,
              boxShadow: `0 0 8px ${node.color}`,
            }}
          />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#F5F5F7' }}>
            {node.label}
          </span>
        </div>
      </Html>
    </group>
  );
}

function InvestigationConnections({ reducedMotion }: { reducedMotion: boolean }) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const { positions, colors } = useRef(() => {
    const pos: number[] = [];
    const col: number[] = [];

    const pairs: [string, string][] = [
      ['core-b', 'bldg-a'],
      ['core-b', 'bldg-b'],
      ['core-b', 'branch-c'],
      ['bldg-b', 'branch-c'],
    ];

    pairs.forEach(([fromId, toId]) => {
      const n1 = NODES.find((n) => n.id === fromId)!;
      const n2 = NODES.find((n) => n.id === toId)!;
      pos.push(...n1.position);
      pos.push(...n2.position);

      const c1 = new THREE.Color(n1.color);
      const c2 = new THREE.Color(n2.color);
      col.push(c1.r, c1.g, c1.b);
      col.push(c2.r, c2.g, c2.b);
    });

    return { positions: new Float32Array(pos), colors: new Float32Array(col) };
  }).current();

  useFrame((state) => {
    if (!lineRef.current || reducedMotion) return;
    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    if (mat) {
      mat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2.8) * 0.25;
    }
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.65} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

export function IncidentTopology({ onSelectNode }: { onSelectNode?: (nodeName: string) => void }) {
  const reducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<InvestigationNode>(NODES[0]);

  const handleSelect = (node: InvestigationNode) => {
    setSelected(node);
    onSelectNode?.(node.name);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(38, 20, 20, 0.4) 0%, rgba(8, 9, 13, 0.85) 100%)',
        border: '1px solid rgba(255, 77, 77, 0.3)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '14px',
          left: '16px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          borderRadius: '9999px',
          background: 'rgba(8, 9, 13, 0.85)',
          border: '1px solid rgba(255, 77, 77, 0.4)',
          fontSize: '11px',
          color: '#FF7A18',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF4D4D' }} />
        <span>Bottleneck Path Visualized: Core B &rarr; Building A</span>
      </div>

      <Canvas camera={{ position: [0, 4.2, 5.8], fov: 42 }} gl={{ alpha: true, antialias: true }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} color="#11131A" />
          <directionalLight position={[6, 8, 5]} intensity={1.2} />
          <pointLight position={[-2.4, 2, 1.2]} intensity={2.5} color="#FF4D4D" />
          <pointLight position={[0, 2, 0]} intensity={2.0} color="#FF7A18" />

          {NODES.map((node) => (
            <BuildingPlatform
              key={node.id}
              node={node}
              isSelected={selected.id === node.id}
              onSelect={handleSelect}
              reducedMotion={reducedMotion}
            />
          ))}

          <InvestigationConnections reducedMotion={reducedMotion} />

          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={4} maxDistance={9} autoRotate={!reducedMotion} autoRotateSpeed={0.4} />
        </Suspense>
      </Canvas>
    </div>
  );
}
