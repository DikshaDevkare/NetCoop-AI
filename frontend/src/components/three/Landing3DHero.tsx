import { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { useWindowDimensions } from '../../hooks/useWindowDimensions.ts';

interface SatelliteData {
  id: string;
  name: string;
  distance: number;
  speed: number;
  angleOffset: number;
  yOffset: number;
  size: number;
  color: string;
  type: 'switch' | 'router' | 'agent' | 'gateway';
}

function HeroCentralHub({ reducedMotion }: { reducedMotion: boolean }) {
  const hubGroupRef = useRef<THREE.Group>(null);
  const innerCrystalRef = useRef<THREE.Mesh>(null);
  const outerCageRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const time = state.clock.elapsedTime;

    // Gentle global bobbing
    if (hubGroupRef.current) {
      hubGroupRef.current.position.y = Math.sin(time * 0.8) * 0.15;
    }

    // Inner crystal rotation
    if (innerCrystalRef.current) {
      innerCrystalRef.current.rotation.y += delta * 0.4;
      innerCrystalRef.current.rotation.x += delta * 0.2;
    }

    // Outer cage reverse spin
    if (outerCageRef.current) {
      outerCageRef.current.rotation.y -= delta * 0.25;
      outerCageRef.current.rotation.z += delta * 0.15;
    }

    // Orbital gimbal rings rotating at varied speeds
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.5;
      ring1Ref.current.rotation.y += delta * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.4;
      ring2Ref.current.rotation.z += delta * 0.25;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += delta * 0.35;
      ring3Ref.current.rotation.x -= delta * 0.3;
    }
  });

  return (
    <group ref={hubGroupRef}>
      {/* 1. Core Quantum Crystal (Emissive Ember Nucleus) */}
      <mesh ref={innerCrystalRef}>
        <icosahedronGeometry args={[1.3, 0]} />
        <meshStandardMaterial
          color="#FF7A18"
          emissive="#FF7A18"
          emissiveIntensity={1.4}
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      {/* 2. Outer Wireframe Cage (Neural Lattice) */}
      <mesh ref={outerCageRef}>
        <octahedronGeometry args={[1.85, 0]} />
        <meshStandardMaterial
          color="#FFB347"
          emissive="#FF9436"
          emissiveIntensity={0.6}
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 3. Concentric Orbital Rings */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.5, 0.035, 16, 64]} />
        <meshStandardMaterial
          color="#FF7A18"
          emissive="#FF7A18"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[2.9, 0.03, 16, 64]} />
        <meshStandardMaterial
          color="#FFB347"
          emissive="#FFB347"
          emissiveIntensity={0.7}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      <mesh ref={ring3Ref} rotation={[0, Math.PI / 3, -Math.PI / 4]}>
        <torusGeometry args={[3.3, 0.025, 16, 64]} />
        <meshStandardMaterial
          color="#A855F7"
          emissive="#A855F7"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Core Dynamic Point Lights */}
      <pointLight color="#FF7A18" intensity={3.5} distance={10} decay={2} />
      <pointLight color="#A855F7" intensity={2.0} distance={8} decay={2} position={[0, 1.5, 0]} />
    </group>
  );
}

function OrbitingSatellites({
  satellites,
  reducedMotion,
}: {
  satellites: SatelliteData[];
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const time = state.clock.elapsedTime;

    satellites.forEach((sat, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      // Calculate orbital position
      const currentAngle = sat.angleOffset + time * sat.speed;
      const x = Math.cos(currentAngle) * sat.distance;
      const z = Math.sin(currentAngle) * sat.distance;
      const y = sat.yOffset + Math.sin(time * 1.5 + i) * 0.25;

      mesh.position.set(x, y, z);
      mesh.rotation.y += delta * 0.8;
      mesh.rotation.x += delta * 0.4;
    });
  });

  return (
    <group ref={groupRef}>
      {satellites.map((sat, i) => (
        <mesh
          key={sat.id}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          position={[
            Math.cos(sat.angleOffset) * sat.distance,
            sat.yOffset,
            Math.sin(sat.angleOffset) * sat.distance,
          ]}
        >
          {sat.type === 'switch' ? (
            <boxGeometry args={[sat.size, sat.size, sat.size]} />
          ) : sat.type === 'agent' ? (
            <octahedronGeometry args={[sat.size * 0.8, 0]} />
          ) : (
            <dodecahedronGeometry args={[sat.size * 0.75, 0]} />
          )}
          <meshStandardMaterial
            color={sat.color}
            emissive={sat.color}
            emissiveIntensity={0.8}
            roughness={0.2}
            metalness={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

function EnergyConduits({
  satellites,
  reducedMotion,
}: {
  satellites: SatelliteData[];
  reducedMotion: boolean;
}) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const { positions, colors } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];

    satellites.forEach((sat) => {
      // Line from center (0,0,0) to initial satellite position
      pos.push(0, 0, 0);
      pos.push(
        Math.cos(sat.angleOffset) * sat.distance,
        sat.yOffset,
        Math.sin(sat.angleOffset) * sat.distance
      );

      const colorObj = new THREE.Color(sat.color);
      col.push(1, 0.48, 0.09); // Orange at center
      col.push(colorObj.r, colorObj.g, colorObj.b);
    });

    return {
      positions: new Float32Array(pos),
      colors: new Float32Array(col),
    };
  }, [satellites]);

  useFrame((state) => {
    if (!lineRef.current) return;

    if (!reducedMotion) {
      const time = state.clock.elapsedTime;
      const geo = lineRef.current.geometry;
      const posAttr = geo.attributes.position;
      const array = posAttr.array as Float32Array;

      satellites.forEach((sat, i) => {
        const currentAngle = sat.angleOffset + time * sat.speed;
        const targetX = Math.cos(currentAngle) * sat.distance;
        const targetZ = Math.sin(currentAngle) * sat.distance;
        const targetY = sat.yOffset + Math.sin(time * 1.5 + i) * 0.25;

        // Endpoint index in line segment
        const endpointIndex = (i * 2 + 1) * 3;
        array[endpointIndex] = targetX;
        array[endpointIndex + 1] = targetY;
        array[endpointIndex + 2] = targetZ;
      });

      posAttr.needsUpdate = true;

      const material = lineRef.current.material as THREE.LineBasicMaterial;
      if (material) {
        material.opacity = 0.5 + Math.sin(time * 2.5) * 0.2;
      }
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

function AmbientEmberDust({
  count = 320,
  reducedMotion,
}: {
  count?: number;
  reducedMotion: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const amber = new THREE.Color('#FFB347');
    const orange = new THREE.Color('#FF7A18');
    const violet = new THREE.Color('#A855F7');
    const cyan = new THREE.Color('#38D9FF');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 18;
      pos[i3 + 1] = (Math.random() - 0.5) * 14;
      pos[i3 + 2] = (Math.random() - 0.5) * 12;

      const rand = Math.random();
      const chosen = rand > 0.7 ? violet : rand > 0.5 ? cyan : rand > 0.25 ? orange : amber;
      col[i3] = chosen.r;
      col[i3 + 1] = chosen.g;
      col[i3 + 2] = chosen.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current || reducedMotion) return;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      array[i3 + 1] += delta * 0.3; // Upward ember drift
      if (array[i3 + 1] > 7) {
        array[i3 + 1] = -7;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function SceneParallaxRig({
  children,
  reducedMotion,
}: {
  children: React.ReactNode;
  reducedMotion: boolean;
}) {
  const rigRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!rigRef.current || reducedMotion) return;

    // Smoothly tilt rig towards mouse pointer
    const targetRotX = -state.pointer.y * 0.25;
    const targetRotY = state.pointer.x * 0.35;

    rigRef.current.rotation.x += (targetRotX - rigRef.current.rotation.x) * 0.05;
    rigRef.current.rotation.y += (targetRotY - rigRef.current.rotation.y) * 0.05;
  });

  return <group ref={rigRef}>{children}</group>;
}

export function Landing3DHero({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  const { isMobile } = useWindowDimensions();

  const satellites: SatelliteData[] = useMemo(
    () => [
      { id: 'sat-1', name: 'Core Gateway', distance: 4.8, speed: 0.35, angleOffset: 0, yOffset: 1.2, size: 0.55, color: '#FF7A18', type: 'router' },
      { id: 'sat-2', name: 'Perf Agent', distance: 5.4, speed: -0.28, angleOffset: 1.2, yOffset: -0.8, size: 0.45, color: '#A855F7', type: 'agent' },
      { id: 'sat-3', name: 'Infra Switch', distance: 4.5, speed: 0.42, angleOffset: 2.4, yOffset: 0.6, size: 0.5, color: '#38D9FF', type: 'switch' },
      { id: 'sat-4', name: 'Fault Correlator', distance: 5.8, speed: -0.32, angleOffset: 3.6, yOffset: -1.4, size: 0.48, color: '#FFB347', type: 'agent' },
      { id: 'sat-5', name: 'Access Point', distance: 4.2, speed: 0.48, angleOffset: 4.8, yOffset: 1.6, size: 0.42, color: '#38D9FF', type: 'gateway' },
    ],
    []
  );

  const cameraZ = isMobile ? 16 : 12.5;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: isMobile ? '420px' : '620px',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 45 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} color="#11131A" />
          <directionalLight position={[10, 10, 8]} intensity={1.0} color="#FFF0DB" />

          {/* Cinematic Point Lights */}
          <pointLight position={[6, 6, 6]} intensity={3} color="#FF7A18" distance={25} />
          <pointLight position={[-6, -4, 4]} intensity={2.2} color="#FFB347" distance={20} />
          <pointLight position={[0, 8, -4]} intensity={2.5} color="#A855F7" distance={22} />
          <pointLight position={[0, -6, 4]} intensity={1.8} color="#38D9FF" distance={18} />

          <SceneParallaxRig reducedMotion={reducedMotion}>
            <HeroCentralHub reducedMotion={reducedMotion} />
            <OrbitingSatellites satellites={satellites} reducedMotion={reducedMotion} />
            <EnergyConduits satellites={satellites} reducedMotion={reducedMotion} />
            <AmbientEmberDust count={isMobile ? 180 : 320} reducedMotion={reducedMotion} />
          </SceneParallaxRig>
        </Suspense>
      </Canvas>
    </div>
  );
}
