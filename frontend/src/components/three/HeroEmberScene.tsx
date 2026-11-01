import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';

function ParticleSwarm({ count = 120, reducedMotion = false }: { count?: number; reducedMotion?: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorAmber = new THREE.Color('#FF9A24');
    const colorViolet = new THREE.Color('#9A45FF');

    for (let i = 0; i < count; i++) {
      const radius = 1.2 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = Math.random() > 0.4 ? colorAmber : colorViolet;
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (reducedMotion || !pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.08;
    pointsRef.current.rotation.x += delta * 0.04;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function AmberGeometricCore({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringAmberRef = useRef<THREE.Mesh>(null);
  const ringPurpleRef = useRef<THREE.Mesh>(null);
  const satellitesRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.4;
      coreRef.current.rotation.z += delta * 0.2;
      const scale = 1 + Math.sin(t * 1.8) * 0.04;
      coreRef.current.scale.set(scale, scale, scale);
    }
    if (ringAmberRef.current) {
      ringAmberRef.current.rotation.x += delta * 0.25;
      ringAmberRef.current.rotation.y += delta * 0.35;
    }
    if (ringPurpleRef.current) {
      ringPurpleRef.current.rotation.y -= delta * 0.3;
      ringPurpleRef.current.rotation.z += delta * 0.2;
    }
    if (satellitesRef.current) {
      satellitesRef.current.rotation.y += delta * 0.22;
    }
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Amber Geometric Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.95, 0]} />
        <meshStandardMaterial
          color="#FF9A24"
          emissive="#FF6A16"
          emissiveIntensity={1.4}
          roughness={0.15}
          metalness={0.85}
          wireframe={false}
        />
      </mesh>

      {/* Wireframe Facet Overlay */}
      <mesh>
        <octahedronGeometry args={[0.98, 0]} />
        <meshBasicMaterial color="#FFB347" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Thin Amber Orbital Ring */}
      <mesh ref={ringAmberRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.7, 0.02, 16, 64]} />
        <meshStandardMaterial color="#FF9A24" emissive="#FF6A16" emissiveIntensity={1.6} />
      </mesh>

      {/* Purple Orbital Ring */}
      <mesh ref={ringPurpleRef} rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
        <torusGeometry args={[2.1, 0.016, 16, 64]} />
        <meshStandardMaterial color="#9A45FF" emissive="#9A45FF" emissiveIntensity={1.4} />
      </mesh>

      {/* Floating Amber Satellite Geometries */}
      <group ref={satellitesRef}>
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => {
          const x = Math.cos(angle) * 1.9;
          const z = Math.sin(angle) * 1.9;
          return (
            <mesh key={i} position={[x, Math.sin(i) * 0.3, z]}>
              <dodecahedronGeometry args={[0.14, 0]} />
              <meshStandardMaterial
                color={i === 0 ? '#36CBE8' : i === 1 ? '#FF9A24' : '#9A45FF'}
                emissive={i === 0 ? '#36CBE8' : i === 1 ? '#FF9A24' : '#9A45FF'}
                emissiveIntensity={1.2}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

export function HeroEmberScene() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '440px',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#FFFFFF" />
        <pointLight position={[0, 0, 2]} intensity={2.4} color="#FF9A24" distance={8} />
        <pointLight position={[-3, 2, 0]} intensity={1.5} color="#9A45FF" distance={7} />
        <pointLight position={[3, -2, 0]} intensity={1.2} color="#36CBE8" distance={7} />

        <AmberGeometricCore reducedMotion={reducedMotion} />
        <ParticleSwarm count={140} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}

// Re-export alias for Landing3DHero
export { HeroEmberScene as Landing3DHero };
