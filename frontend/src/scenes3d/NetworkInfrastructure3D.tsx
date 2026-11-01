import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export function NetworkInfrastructure3D() {
  const groupRef = useRef<THREE.Group>(null);
  const busRingsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 0.8) * 0.05;
    }
    if (busRingsRef.current) {
      busRingsRef.current.rotation.y = time * 0.1;
    }
  });

  // 4 modular server rack blades placed spatially
  const rackPositions: [number, number, number][] = [
    [-2.2, 0.5, -1.0],
    [-0.8, 1.2, 0.5],
    [0.8, -0.6, -0.8],
    [2.2, 0.8, 1.0],
  ];

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Central High-Capacity Backbone Conduit */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 6.5, 24]} />
        <meshStandardMaterial
          color="#20D9FF"
          emissive="#20D9FF"
          emissiveIntensity={1.8}
        />
      </mesh>

      {/* Orbiting Optical Data Rings */}
      <group ref={busRingsRef}>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[3.2, 0.015, 8, 64]} />
          <meshBasicMaterial color="#FF8A24" wireframe />
        </mesh>
        <mesh rotation={[-Math.PI / 4, 0, 0]}>
          <torusGeometry args={[3.0, 0.012, 8, 64]} />
          <meshBasicMaterial color="#20D9FF" wireframe />
        </mesh>
      </group>

      {/* Rack Units / Blade Modules */}
      {rackPositions.map((pos, idx) => (
        <group key={`rack-${idx}`} position={pos}>
          {/* Chassis Unit */}
          <mesh castShadow>
            <boxGeometry args={[0.8, 0.45, 0.6]} />
            <meshStandardMaterial
              color="#141B25"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>

          {/* Front Bezel Glass Panel */}
          <mesh position={[0, 0, 0.31]}>
            <boxGeometry args={[0.74, 0.38, 0.02]} />
            <meshStandardMaterial
              color="#1e293b"
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          {/* Activity Status LEDs (Orange & Cyan) */}
          <mesh position={[-0.25, 0.1, 0.33]}>
            <boxGeometry args={[0.1, 0.04, 0.02]} />
            <meshStandardMaterial
              color="#20D9FF"
              emissive="#20D9FF"
              emissiveIntensity={2.5}
            />
          </mesh>
          <mesh position={[-0.1, 0.1, 0.33]}>
            <boxGeometry args={[0.1, 0.04, 0.02]} />
            <meshStandardMaterial
              color="#FF8A24"
              emissive="#FF8A24"
              emissiveIntensity={2.5}
            />
          </mesh>

          {/* SFP Port Arrays */}
          <mesh position={[0.15, -0.05, 0.33]}>
            <boxGeometry args={[0.3, 0.12, 0.02]} />
            <meshStandardMaterial
              color="#26D7A0"
              emissive="#26D7A0"
              emissiveIntensity={1.8}
            />
          </mesh>

          {/* Vertical Bus Tap */}
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
            <meshBasicMaterial color="#20D9FF" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
