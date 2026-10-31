import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

interface NetworkHub3DProps {
  reducedMotion?: boolean;
}

export function NetworkHub3D({ reducedMotion = false }: NetworkHub3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y -= delta * 0.25;
    }
    if (coreRef.current) {
      const t = state.clock.getElapsedTime();
      coreRef.current.position.y = Math.sin(t * 2) * 0.05 + 0.15;
    }
  });

  return (
    <group position={[0, -0.1, 0]}>
      {/* Base Stepped Hexagonal Platform */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[1.5, 1.75, 0.22, 6]} />
        <meshStandardMaterial
          color="#141722"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Middle Glowing Orange Hexagonal Tier */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[1.3, 1.45, 0.16, 6]} />
        <meshStandardMaterial
          color="#FF7A18"
          emissive="#FF7A18"
          emissiveIntensity={0.65}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Top Smoked Obsidian Surface */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[1.2, 1.25, 0.1, 6]} />
        <meshStandardMaterial
          color="#0B0D14"
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Floating Rotating Energy Ring */}
      <mesh ref={ringRef} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.025, 16, 64]} />
        <meshStandardMaterial
          color="#FFB347"
          emissive="#FF7A18"
          emissiveIntensity={1.8}
        />
      </mesh>

      {/* Central Floating Glowing Emblem */}
      <group ref={coreRef}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial
            color="#FF7A18"
            emissive="#FF7A18"
            emissiveIntensity={1.5}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>

        {/* Outer Orbiting Micro Nodes */}
        <mesh position={[0.45, 0, 0]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color="#FFB347" />
        </mesh>
        <mesh position={[-0.45, 0, 0]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color="#38D9FF" />
        </mesh>
        <mesh position={[0, 0, 0.45]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color="#A855F7" />
        </mesh>

        {/* Central Label HTML Badge */}
        <Html position={[0, 0.45, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              background: 'rgba(8, 9, 13, 0.85)',
              border: '1px solid rgba(255, 122, 24, 0.6)',
              boxShadow: '0 0 12px rgba(255, 122, 24, 0.4)',
              color: '#FFB347',
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

      {/* Ground Concentric Glow Disk */}
      <mesh position={[0, -0.46, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 2.2, 32]} />
        <meshBasicMaterial
          color="#FF7A18"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
