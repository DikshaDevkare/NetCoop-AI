import { useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';

interface TopologyNode {
  id: string;
  name: string;
  type: 'core' | 'router' | 'switch' | 'ap';
  status: 'healthy' | 'degraded' | 'online' | 'affected';
  position: [number, number, number];
  color: string;
  badge: string;
  ip: string;
  throughput: string;
}

const NODES: TopologyNode[] = [
  {
    id: 'core-nexus',
    name: 'Core Switch Nexus',
    type: 'core',
    status: 'healthy',
    position: [0, 0, 0],
    color: '#FF7A18',
    badge: 'Core Switch • Healthy',
    ip: '10.254.0.1',
    throughput: '3.4 Tbps Fabric',
  },
  {
    id: 'branch-router',
    name: 'Branch Router 01',
    type: 'router',
    status: 'degraded',
    position: [0, -0.4, 2.6],
    color: '#FFB347',
    badge: 'Branch Router • Degraded',
    ip: '10.20.14.254',
    throughput: '92% Saturated',
  },
  {
    id: 'core-switch-left',
    name: 'Agg Switch West',
    type: 'switch',
    status: 'healthy',
    position: [-2.6, 0.2, 0.8],
    color: '#38D9FF',
    badge: 'Core Switch • Healthy',
    ip: '10.254.1.1',
    throughput: '420 Gbps',
  },
  {
    id: 'switch-left-back',
    name: 'Spine Switch 01',
    type: 'switch',
    status: 'healthy',
    position: [-2.8, 0.4, -1.8],
    color: '#A855F7',
    badge: 'Spine 01 • Online',
    ip: '10.254.2.1',
    throughput: '850 Gbps',
  },
  {
    id: 'access-point',
    name: 'Access Point HQ-East',
    type: 'ap',
    status: 'online',
    position: [3.0, 0.3, -0.6],
    color: '#10B981',
    badge: 'Access Point • Online',
    ip: '10.30.5.1',
    throughput: '1.2 Gbps Wi-Fi 6',
  },
  {
    id: 'switch-right-front',
    name: 'Leaf Switch East',
    type: 'switch',
    status: 'healthy',
    position: [2.2, -0.2, 2.2],
    color: '#38D9FF',
    badge: 'Leaf East • Healthy',
    ip: '10.254.1.2',
    throughput: '380 Gbps',
  },
];

const CONNECTIONS: [string, string][] = [
  ['core-nexus', 'branch-router'],
  ['core-nexus', 'core-switch-left'],
  ['core-nexus', 'switch-left-back'],
  ['core-nexus', 'access-point'],
  ['core-nexus', 'switch-right-front'],
  ['core-switch-left', 'switch-left-back'],
  ['access-point', 'switch-right-front'],
  ['branch-router', 'switch-right-front'],
];

function CentralCorePlatform({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y -= delta * 0.3;
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* Base Hexagonal Stepped Platform */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[1.5, 1.7, 0.2, 6]} />
        <meshStandardMaterial
          color="#191C26"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Glowing Orange Inset Platform */}
      <mesh ref={meshRef} position={[0, -0.15, 0]}>
        <cylinderGeometry args={[1.3, 1.4, 0.15, 6]} />
        <meshStandardMaterial
          color="#FF7A18"
          emissive="#FF7A18"
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Orbital Circuit Ring */}
      <mesh ref={ringRef} position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.65, 0.02, 16, 48]} />
        <meshBasicMaterial color="#FFB347" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function TopologyNodeItem({
  node,
  isSelected,
  onSelect,
  reducedMotion,
}: {
  node: TopologyNode;
  isSelected: boolean;
  onSelect: (node: TopologyNode) => void;
  reducedMotion: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (reducedMotion || !meshRef.current) return;
    if (node.type === 'core') {
      meshRef.current.rotation.y += delta * 0.4;
    } else {
      meshRef.current.position.y =
        node.position[1] + Math.sin(state.clock.elapsedTime * 1.5 + node.position[0]) * 0.08;
      meshRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group position={node.position}>
      {/* 3D Geometry */}
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
        {node.type === 'core' ? (
          <boxGeometry args={[0.9, 0.35, 0.9]} />
        ) : node.type === 'router' ? (
          <cylinderGeometry args={[0.35, 0.4, 0.3, 8]} />
        ) : node.type === 'ap' ? (
          <octahedronGeometry args={[0.35, 0]} />
        ) : (
          <boxGeometry args={[0.55, 0.25, 0.55]} />
        )}

        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={hovered || isSelected ? 1.5 : 0.8}
          roughness={0.2}
          metalness={0.85}
        />
      </mesh>

      {/* Floating Status Badge (Exact match to reference image tags) */}
      <Html position={[0, 0.65, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '9999px',
            background: 'rgba(8, 9, 13, 0.85)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${node.color}50`,
            boxShadow: `0 4px 14px rgba(0, 0, 0, 0.6), 0 0 10px ${node.color}40`,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: node.color,
              boxShadow: `0 0 6px ${node.color}`,
            }}
          />
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#F5F5F7' }}>
            {node.badge}
          </span>
        </div>
      </Html>
    </group>
  );
}

function TopologyDataBeams({ reducedMotion }: { reducedMotion: boolean }) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const { positions, colors } = useRef(() => {
    const pos: number[] = [];
    const col: number[] = [];

    CONNECTIONS.forEach(([fromId, toId]) => {
      const fromNode = NODES.find((n) => n.id === fromId);
      const toNode = NODES.find((n) => n.id === toId);
      if (!fromNode || !toNode) return;

      pos.push(...fromNode.position);
      pos.push(...toNode.position);

      const c1 = new THREE.Color(fromNode.color);
      const c2 = new THREE.Color(toNode.color);

      col.push(c1.r, c1.g, c1.b);
      col.push(c2.r, c2.g, c2.b);
    });

    return {
      positions: new Float32Array(pos),
      colors: new Float32Array(col),
    };
  }).current();

  useFrame((state) => {
    if (!lineRef.current || reducedMotion) return;
    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    if (mat) {
      mat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2.5) * 0.25;
    }
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

export function CommandCentreTopology({ onSelectNode }: { onSelectNode?: (node: TopologyNode) => void }) {
  const reducedMotion = useReducedMotion();
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);

  const handleSelect = (node: TopologyNode) => {
    setSelectedNode(node);
    onSelectNode?.(node);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(25, 28, 38, 0.4) 0%, rgba(8, 9, 13, 0.8) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Top Banner Notice */}
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
          background: 'rgba(8, 9, 13, 0.75)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 122, 24, 0.3)',
          fontSize: '11px',
          color: '#FFB347',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF7A18' }} />
        <span>Live Interactive 3D Topology • Orbit & Click Devices</span>
      </div>

      <Canvas
        camera={{ position: [0, 4.5, 6.2], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} color="#11131A" />
          <directionalLight position={[6, 8, 5]} intensity={1.2} color="#FFF5EB" />
          <pointLight position={[0, 2, 0]} intensity={3} color="#FF7A18" distance={10} />
          <pointLight position={[-3, 1, 1]} intensity={1.5} color="#38D9FF" distance={8} />
          <pointLight position={[3, 1, -1]} intensity={1.5} color="#10B981" distance={8} />

          {/* Central Platform */}
          <CentralCorePlatform reducedMotion={reducedMotion} />

          {/* Topology Nodes */}
          {NODES.map((node) => (
            <TopologyNodeItem
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              onSelect={handleSelect}
              reducedMotion={reducedMotion}
            />
          ))}

          {/* Data Lines */}
          <TopologyDataBeams reducedMotion={reducedMotion} />

          {/* Camera Controls */}
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={4}
            maxDistance={10}
            autoRotate={!reducedMotion}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div
          style={{
            position: 'absolute',
            bottom: '14px',
            left: '16px',
            right: '16px',
            padding: '12px 18px',
            borderRadius: '10px',
            background: 'rgba(17, 19, 26, 0.92)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${selectedNode.color}60`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F5F5F7' }}>{selectedNode.name}</div>
            <div style={{ fontSize: '11px', color: '#A3A6B3' }}>
              IP: {selectedNode.ip} • Telemetry: {selectedNode.throughput}
            </div>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#F5F5F7',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
