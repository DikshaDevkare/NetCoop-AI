import { useState, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { PerspectiveGrid } from './PerspectiveGrid.tsx';
import { NetworkDeviceMesh, type DeviceNodeData } from './NetworkDeviceMesh.tsx';

interface NetworkHubSceneProps {
  onNodeSelect?: (nodeName: string) => void;
}

const TOPOLOGY_DEVICES: DeviceNodeData[] = [
  {
    id: 'core-switch-left',
    name: 'Core Switch HQ-01',
    type: 'switch',
    status: 'healthy',
    position: [-2.6, 0.1, 0.6],
    badge: 'Core Switch • Healthy',
    ip: '10.254.1.1',
    throughput: '420 Gbps',
  },
  {
    id: 'edge-switch-front',
    name: 'Edge Switch SW-02',
    type: 'switch',
    status: 'healthy',
    position: [-1.4, -0.1, 2.3],
    badge: 'Edge Switch • Healthy',
    ip: '10.254.1.2',
    throughput: '280 Gbps',
  },
  {
    id: 'branch-router-front',
    name: 'Branch Router 01',
    type: 'router',
    status: 'degraded',
    position: [1.2, -0.1, 2.3],
    badge: 'Branch Router • Degraded',
    ip: '10.20.14.254',
    throughput: '92% Saturated',
  },
  {
    id: 'access-point-right',
    name: 'Access Point HQ-East',
    type: 'ap',
    status: 'online',
    position: [2.6, 0.2, 0.6],
    badge: 'Access Point • Online',
    ip: '10.30.5.1',
    throughput: '1.2 Gbps Wi-Fi 6',
  },
];

// Physical Elevated Polygonal Network Hub (Exact reference recreation)
function CentralElevatedHub({ reducedMotion }: { reducedMotion: boolean }) {
  const hubRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    if (ringRef.current) {
      ringRef.current.rotation.y -= delta * 0.25;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.2;
      const t = state.clock.getElapsedTime();
      coreRef.current.position.y = Math.sin(t * 2) * 0.04 + 0.12;
    }
  });

  return (
    <group ref={hubRef} position={[0, -0.1, 0]}>
      {/* Soft Contact Shadow Disk on Floor */}
      <mesh position={[0, -0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.8, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.65} />
      </mesh>

      {/* Ground Concentric Radiance Disk */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 2.2, 36]} />
        <meshBasicMaterial color="#FF6A16" transparent opacity={0.14} side={THREE.DoubleSide} />
      </mesh>

      {/* Tier 1: Base Stepped Polygonal Platform */}
      <mesh position={[0, -0.34, 0]}>
        <cylinderGeometry args={[1.5, 1.75, 0.2, 6]} />
        <meshStandardMaterial color="#11131C" roughness={0.35} metalness={0.85} />
      </mesh>

      {/* Tier 2: Amber Emissive Mid-Plate Ring */}
      <mesh position={[0, -0.21, 0]}>
        <cylinderGeometry args={[1.32, 1.48, 0.14, 6]} />
        <meshStandardMaterial
          color="#FF9A24"
          emissive="#FF6A16"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Tier 3: Smoked Obsidian Polygonal Top Plate */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[1.22, 1.28, 0.1, 6]} />
        <meshStandardMaterial color="#08090D" roughness={0.15} metalness={0.92} />
      </mesh>

      {/* Rotating Amber Energy Ring */}
      <mesh ref={ringRef} position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.024, 16, 64]} />
        <meshStandardMaterial color="#FF9A24" emissive="#FF6A16" emissiveIntensity={1.8} />
      </mesh>

      {/* Central Network Hub Emblem */}
      <mesh ref={coreRef} position={[0, 0.12, 0]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial
          color="#FF9A24"
          emissive="#FF6A16"
          emissiveIntensity={1.6}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>

      {/* HTML Hub Center Badge */}
      <Html position={[0, 0.42, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'rgba(8, 9, 13, 0.9)',
            border: '1px solid rgba(255, 154, 36, 0.6)',
            boxShadow: '0 0 14px rgba(255, 106, 22, 0.4)',
            color: '#FF9A24',
            fontSize: '10px',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            letterSpacing: '0.04em',
          }}
        >
          NEXUS CORE
        </div>
      </Html>
    </group>
  );
}

// Thin Amber Connecting Lines with Animated Traveling Packets
function AnimatedCircuitLinks({ reducedMotion }: { reducedMotion: boolean }) {
  const packetsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion || !packetsRef.current) return;
    const t = state.clock.getElapsedTime();
    packetsRef.current.children.forEach((child, i) => {
      const dev = TOPOLOGY_DEVICES[i];
      if (!dev) return;
      const progress = ((t * 0.8 + i * 0.25) % 1);
      child.position.x = dev.position[0] * (1 - progress);
      child.position.z = dev.position[2] * (1 - progress);
      child.position.y = -0.38 + Math.sin(progress * Math.PI) * 0.08;
    });
  });

  return (
    <group position={[0, -0.4, 0]}>
      {/* Static Glowing Amber Bus Tubes */}
      {TOPOLOGY_DEVICES.map((dev) => {
        const points = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(dev.position[0] * 0.5, 0, dev.position[2] * 0.5),
          new THREE.Vector3(dev.position[0], 0, dev.position[2]),
        ];
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.018, 8, false);

        return (
          <group key={dev.id}>
            <mesh geometry={tubeGeom}>
              <meshBasicMaterial
                color={dev.status === 'degraded' ? '#FF9A24' : '#FF6A16'}
                transparent
                opacity={0.85}
              />
            </mesh>
            <mesh position={[dev.position[0], 0, dev.position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.42, 24]} />
              <meshBasicMaterial
                color={dev.status === 'degraded' ? '#FF9A24' : '#FF6A16'}
                transparent
                opacity={0.16}
              />
            </mesh>
          </group>
        );
      })}

      {/* Animated Traveling Packets along buses */}
      <group ref={packetsRef}>
        {TOPOLOGY_DEVICES.map((dev) => (
          <mesh key={`packet-${dev.id}`}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#36CBE8" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function NetworkHubScene({ onNodeSelect }: NetworkHubSceneProps) {
  const reducedMotion = useReducedMotion();
  const [selectedDevice, setSelectedDevice] = useState<DeviceNodeData | null>(null);

  const handleDeviceSelect = (dev: DeviceNodeData) => {
    setSelectedDevice(dev);
    if (onNodeSelect) onNodeSelect(dev.name);
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
        boxShadow: '0 0 24px -6px rgba(255, 106, 22, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 4.3, 5.8], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 8, 5]} intensity={1.1} color="#FFFFFF" />
        <pointLight position={[0, 1.6, 0]} intensity={2.6} color="#FF9A24" distance={10} />
        <pointLight position={[-3, 2, 2]} intensity={0.9} color="#36CBE8" distance={8} />
        <pointLight position={[3, 2, 2]} intensity={1.1} color="#9A45FF" distance={8} />

        {/* Perspective Grid Floor */}
        <PerspectiveGrid size={14} divisions={28} position={[0, -0.42, 0]} />

        <Suspense fallback={null}>
          {/* Central Elevated Polygonal Hub */}
          <CentralElevatedHub reducedMotion={reducedMotion} />

          {/* Thin Amber Connecting Lines with Animated Packets */}
          <AnimatedCircuitLinks reducedMotion={reducedMotion} />

          {/* Surrounding 4 Devices */}
          {TOPOLOGY_DEVICES.map((device) => (
            <NetworkDeviceMesh
              key={device.id}
              device={device}
              isSelected={selectedDevice?.id === device.id}
              onSelect={handleDeviceSelect}
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
          autoRotateSpeed={0.35}
        />
      </Canvas>

      {/* Selected Node Tooltip Overlay */}
      {selectedDevice && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(10, 12, 18, 0.94)',
            border: '1px solid rgba(255, 154, 36, 0.45)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#F4F4F7' }}>
              {selectedDevice.name}
            </div>
            <div style={{ fontSize: '11px', color: '#A0A3B1' }}>
              IP: {selectedDevice.ip} • {selectedDevice.throughput}
            </div>
          </div>
          <button
            onClick={() => setSelectedDevice(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#A0A3B1',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '2px 4px',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// Re-export alias for compatibility
export { NetworkHubScene as CommandCentreTopology };
