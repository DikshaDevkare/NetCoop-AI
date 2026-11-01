import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface HolographicPortalProps {
  progress?: number; // 0 to 1 activation scale
  active?: boolean;
}

export function HolographicPortal({ progress = 1, active = true }: HolographicPortalProps) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const midRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const particleRingRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = time * 0.4;
      const mat = outerRingRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 1.5 + Math.sin(time * 2.5) * 0.5;
      }
    }

    if (midRingRef.current) {
      midRingRef.current.rotation.z = -time * 0.7;
      const mat = midRingRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 2.0 + Math.sin(time * 3.2) * 0.6;
      }
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = time * 1.2;
    }

    if (particleRingRef.current) {
      particleRingRef.current.rotation.z = -time * 0.3;
    }
  });

  if (!active || progress <= 0.05) return null;

  const currentScale = THREE.MathUtils.lerp(0.1, 1.0, progress);

  return (
    <group position={[0, 1.2, -6]} scale={[currentScale, currentScale, currentScale]}>
      {/* Outer Rotating Energy Ring (Warm Orange) */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[3.2, 0.06, 16, 64]} />
        <meshStandardMaterial
          color="#FF8A24"
          emissive="#FF8A24"
          emissiveIntensity={2.0}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Middle Concentric Ring (Cyan Digital Accent) */}
      <mesh ref={midRingRef}>
        <torusGeometry args={[2.7, 0.04, 16, 64]} />
        <meshStandardMaterial
          color="#20D9FF"
          emissive="#20D9FF"
          emissiveIntensity={2.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner Accelerator Ring */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[2.2, 0.03, 16, 48]} />
        <meshStandardMaterial
          color="#FFB45C"
          emissive="#FFB45C"
          emissiveIntensity={2.8}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Circumference Particle Vortex */}
      <points ref={particleRingRef}>
        <ringGeometry args={[2.1, 3.3, 48]} />
        <pointsMaterial
          size={0.035}
          color="#FF8A24"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Center Event Horizon Glow Plane */}
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[2.0, 32]} />
        <meshBasicMaterial
          color="#10151d"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
