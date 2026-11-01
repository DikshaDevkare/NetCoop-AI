import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useDashboardStore } from '../store/useDashboardStore';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Major continental network hubs (approximate spherical coordinates: [lat, lon])
const CONTINENTAL_HUBS: Array<{ lat: number; lon: number; isOrange?: boolean; label: string }> = [
  // North America
  { lat: 37.77, lon: -122.41, isOrange: true, label: 'SFO' },
  { lat: 40.71, lon: -74.00, label: 'NYC' },
  { lat: 47.60, lon: -122.33, label: 'SEA' },
  { lat: 33.74, lon: -84.38, label: 'ATL' },
  { lat: 41.87, lon: -87.62, isOrange: true, label: 'CHI' },
  { lat: 45.50, lon: -73.56, label: 'MTL' },
  // Europe
  { lat: 51.50, lon: -0.12, isOrange: true, label: 'LON' },
  { lat: 48.85, lon: 2.35, label: 'PAR' },
  { lat: 50.11, lon: 8.68, isOrange: true, label: 'FRA' },
  { lat: 52.36, lon: 4.90, label: 'AMS' },
  { lat: 41.38, lon: 2.17, label: 'BCN' },
  { lat: 59.32, lon: 18.06, label: 'STO' },
  // Asia & Pacific
  { lat: 35.67, lon: 139.65, isOrange: true, label: 'TYO' },
  { lat: 37.56, lon: 126.97, label: 'SEL' },
  { lat: 31.23, lon: 121.47, label: 'SHA' },
  { lat: 1.35, lon: 103.81, isOrange: true, label: 'SIN' },
  { lat: 22.31, lon: 114.16, label: 'HKG' },
  { lat: 12.97, lon: 77.59, isOrange: true, label: 'BLR' },
  { lat: 19.07, lon: 72.87, label: 'BOM' },
  { lat: -33.86, lon: 151.20, label: 'SYD' },
  // South America & Africa
  { lat: -23.55, lon: -46.63, isOrange: true, label: 'SAO' },
  { lat: -34.60, lon: -58.38, label: 'BUE' },
  { lat: -1.29, lon: 36.82, label: 'NBO' },
  { lat: 25.20, lon: 55.27, label: 'DXB' },
  { lat: 30.04, lon: 31.23, label: 'CAI' },
  { lat: -26.20, lon: 28.04, label: 'JNB' },
];

// Helper: Convert lat/lon to 3D Cartesian Vector on sphere
function latLonToVector3(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

// Pre-generated deterministic background particles around globe (pure, zero Math.random in render)
const PARTICLE_COUNT = 100;
const DETERMINISTIC_PARTICLES = new Float32Array(PARTICLE_COUNT * 3);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  const u = (i * 0.618033988749895) % 1;
  const v = i / PARTICLE_COUNT;
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(Math.max(-1, Math.min(1, 2.0 * v - 1.0)));
  const r = 2.85 * 1.25 + ((i * 19) % 25) * 0.09;
  DETERMINISTIC_PARTICLES[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  DETERMINISTIC_PARTICLES[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  DETERMINISTIC_PARTICLES[i * 3 + 2] = r * Math.cos(phi);
}

interface EarthGlobeMeshProps {
  rotating: boolean;
  reducedMotion: boolean;
  scale?: number;
}

function EarthGlobeMesh({ rotating, reducedMotion, scale = 1 }: EarthGlobeMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const RADIUS = 2.85;

  // Compute 3D node coordinates on sphere surface
  const nodeVectors = useMemo(() => {
    return CONTINENTAL_HUBS.map((hub) => ({
      ...hub,
      pos: latLonToVector3(hub.lat, hub.lon, RADIUS + 0.02),
    }));
  }, [RADIUS]);

  // Network connection lines between nodes within reasonable distance
  const connectionPairs = useMemo(() => {
    const pairs: Array<[[number, number, number], [number, number, number]]> = [];
    for (let i = 0; i < nodeVectors.length; i++) {
      for (let j = i + 1; j < nodeVectors.length; j++) {
        const v1 = new THREE.Vector3(...nodeVectors[i].pos);
        const v2 = new THREE.Vector3(...nodeVectors[j].pos);
        const dist = v1.distanceTo(v2);
        // Connect if close enough (trans-oceanic / regional trunks)
        if (dist > 0.8 && dist < 3.2) {
          pairs.push([nodeVectors[i].pos, nodeVectors[j].pos]);
        }
      }
    }
    return pairs;
  }, [nodeVectors]);

  useFrame((state, delta) => {
    if (groupRef.current && rotating && !reducedMotion) {
      groupRef.current.rotation.y += delta * 0.09;
    }

    const t = state.clock.getElapsedTime();
    if (atmosphereRef.current) {
      const mat = atmosphereRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.opacity = 0.35 + Math.sin(t * 1.5) * 0.08;
      }
    }
  });

  return (
    <group ref={groupRef} scale={scale} rotation={[0.25, -0.6, 0]}>
      {/* 1. Deep Metallic Dark Blue Core Earth Sphere */}
      <mesh ref={coreRef} castShadow receiveShadow>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshStandardMaterial
          color="#061224"
          roughness={0.22}
          metalness={0.92}
          emissive="#040b17"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* 2. Geometric Cyan Network Mesh Shell */}
      <mesh>
        <sphereGeometry args={[RADIUS + 0.015, 36, 36]} />
        <meshStandardMaterial
          color="#20D9FF"
          wireframe
          transparent
          opacity={0.16}
          emissive="#20D9FF"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* 3. Subtle Concentric Latitude/Longitude Equator Rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[RADIUS + 0.03, RADIUS + 0.05, 64]} />
        <meshStandardMaterial
          color="#20D9FF"
          emissive="#20D9FF"
          emissiveIntensity={1.5}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[RADIUS + 0.25, RADIUS + 0.27, 64]} />
        <meshStandardMaterial
          color="#FF8A24"
          emissive="#FF8A24"
          emissiveIntensity={1.2}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4. Atmospheric Blue/Cyan Outer Halo Glow Shell */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[RADIUS + 0.12, 32, 32]} />
        <meshStandardMaterial
          color="#20D9FF"
          emissive="#20D9FF"
          emissiveIntensity={0.6}
          transparent
          opacity={0.32}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. Glowing Network Hub Nodes on Continents */}
      {nodeVectors.map((node, idx) => (
        <group key={idx} position={node.pos}>
          {/* Surface Point */}
          <mesh>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial
              color={node.isOrange ? '#FF8A24' : '#20D9FF'}
              emissive={node.isOrange ? '#FF8A24' : '#20D9FF'}
              emissiveIntensity={3.2}
              roughness={0.1}
            />
          </mesh>
          {/* Subtle Outer Ping Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.06, 0.08, 16]} />
            <meshStandardMaterial
              color={node.isOrange ? '#FF8A24' : '#20D9FF'}
              emissive={node.isOrange ? '#FF8A24' : '#20D9FF'}
              emissiveIntensity={2.0}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* 6. Inter-Hub Network Line Trunks */}
      {connectionPairs.map((pair, idx) => (
        <Line
          key={idx}
          points={[pair[0], pair[1]]}
          color="#20D9FF"
          lineWidth={1.0}
          transparent
          opacity={0.22}
        />
      ))}

      {/* 7. Subtle Ambient Floating Network Particles in Surrounding Space */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[DETERMINISTIC_PARTICLES, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color="#20D9FF"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

interface GlobalEarthBackground3DProps {
  positionOffset?: [number, number, number];
  scale?: number;
  opacity?: number;
}

export function GlobalEarthBackground3D({
  positionOffset = [1.5, -0.3, -2.8],
  scale = 1.05,
  opacity = 0.9,
}: GlobalEarthBackground3DProps) {
  const earthRotation = useDashboardStore((state) => state.earthRotation);
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
      style={{ opacity }}
    >
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6.8], fov: 44, near: 0.1, far: 40 }}
        className="w-full h-full pointer-events-none"
      >
        {/* Cinematic Directional & Atmospheric Lighting */}
        <ambientLight color="#040d1a" intensity={0.9} />

        {/* Main Sun / Key Light */}
        <directionalLight
          position={[5, 4, 6]}
          intensity={2.2}
          color="#e2e8f0"
        />

        {/* Electric Cyan Rim Light */}
        <directionalLight
          position={[-6, 2, -3]}
          intensity={3.2}
          color="#20D9FF"
        />

        {/* Warm Orange Horizon Accent Light */}
        <directionalLight
          position={[3, -4, 2]}
          intensity={1.6}
          color="#FF8A24"
        />

        {/* Internal Core Soft Glow */}
        <pointLight position={[positionOffset[0], positionOffset[1], positionOffset[2]]} color="#20D9FF" intensity={1.5} distance={6} />

        {/* 3D Earth Globe Positioned in Background */}
        <group position={positionOffset}>
          <EarthGlobeMesh
            rotating={earthRotation}
            reducedMotion={reducedMotion}
            scale={scale}
          />
        </group>
      </Canvas>
    </div>
  );
}
