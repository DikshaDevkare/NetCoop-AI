import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

// Network nodes on the holographic globe
const GLOBE_NODES: Array<{ pos: [number, number, number]; isOrange?: boolean }> = [
  { pos: [0.35, 0.15, 0.2] },
  { pos: [-0.3, 0.25, 0.18], isOrange: true },
  { pos: [0.1, -0.32, 0.22] },
  { pos: [-0.25, -0.2, 0.28] },
  { pos: [0.28, 0.28, -0.15] },
  { pos: [-0.35, 0.05, -0.25], isOrange: true },
  { pos: [0.15, -0.35, -0.18] },
  { pos: [-0.18, -0.28, -0.24] },
  { pos: [0.0, 0.42, 0.0] },
  { pos: [0.0, -0.42, 0.0], isOrange: true },
];

// Holographic Network Globe directly hovering above the robot's raised right hand
function HolographicHoloGlobe({ position = [0.48, 1.15, 0.2] as [number, number, number] }) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // Line connection coordinates between nearby nodes
  const nodeConnections = useMemo(() => {
    const pairs: Array<[[number, number, number], [number, number, number]]> = [
      [GLOBE_NODES[0].pos, GLOBE_NODES[1].pos],
      [GLOBE_NODES[0].pos, GLOBE_NODES[2].pos],
      [GLOBE_NODES[1].pos, GLOBE_NODES[3].pos],
      [GLOBE_NODES[2].pos, GLOBE_NODES[3].pos],
      [GLOBE_NODES[0].pos, GLOBE_NODES[8].pos],
      [GLOBE_NODES[1].pos, GLOBE_NODES[8].pos],
      [GLOBE_NODES[2].pos, GLOBE_NODES[9].pos],
      [GLOBE_NODES[3].pos, GLOBE_NODES[9].pos],
      [GLOBE_NODES[4].pos, GLOBE_NODES[5].pos],
      [GLOBE_NODES[5].pos, GLOBE_NODES[6].pos],
      [GLOBE_NODES[6].pos, GLOBE_NODES[7].pos],
      [GLOBE_NODES[4].pos, GLOBE_NODES[8].pos],
      [GLOBE_NODES[7].pos, GLOBE_NODES[9].pos],
    ];
    return pairs;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y = t * 0.45;
      globeGroupRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
      // Gentle floating motion above hand
      globeGroupRef.current.position.y = position[1] + Math.sin(t * 1.8) * 0.035;
    }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 2.5) * 0.08;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={globeGroupRef} position={position} scale={0.42}>
      {/* Outer Cyan Wireframe Mesh Sphere */}
      <mesh>
        <sphereGeometry args={[0.55, 18, 18]} />
        <meshStandardMaterial
          color="#20D9FF"
          wireframe
          transparent
          opacity={0.35}
          emissive="#20D9FF"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Subtle Inner Glow Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshStandardMaterial
          color="#061826"
          emissive="#20D9FF"
          emissiveIntensity={0.25}
          transparent
          opacity={0.55}
          roughness={0.2}
        />
      </mesh>

      {/* Network Nodes on Globe Surface */}
      {GLOBE_NODES.map((node, i) => (
        <mesh key={i} position={node.pos}>
          <sphereGeometry args={[0.032, 12, 12]} />
          <meshStandardMaterial
            color={node.isOrange ? '#FF8A24' : '#20D9FF'}
            emissive={node.isOrange ? '#FF8A24' : '#20D9FF'}
            emissiveIntensity={3.0}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* Node Connection Lines */}
      {nodeConnections.map((conn, idx) => (
        <Line
          key={idx}
          points={[conn[0], conn[1]]}
          color="#20D9FF"
          lineWidth={1.2}
          transparent
          opacity={0.45}
        />
      ))}

      {/* Glowing Energy Equator Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.54, 0.57, 48]} />
        <meshStandardMaterial
          color="#FF8A24"
          emissive="#FF8A24"
          emissiveIntensity={1.8}
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Light Source from Globe */}
      <pointLight position={[0, 0, 0]} color="#20D9FF" intensity={2.2} distance={3} />
    </group>
  );
}

// Articulated Titanium Humanoid Robot
function HumanoidRobot() {
  const rootGroupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const arcCoreRef = useRef<THREE.Mesh>(null);
  const visorRef = useRef<THREE.Mesh>(null);
  const platformRingsRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Subtle idle breathing
    if (rootGroupRef.current) {
      rootGroupRef.current.position.y = -0.55 + Math.sin(t * 1.5) * 0.025;
    }

    // Visor subtle glow pulse
    if (visorRef.current) {
      const mat = visorRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 2.8 + Math.sin(t * 3.5) * 0.5;
      }
    }

    // Arc Core pulse
    if (arcCoreRef.current) {
      const s = 1 + Math.sin(t * 3.0) * 0.12;
      arcCoreRef.current.scale.set(s, s, s);
    }

    // Head gentle micro-look
    if (headRef.current) {
      headRef.current.rotation.y = 0.12 + Math.sin(t * 0.8) * 0.04;
      headRef.current.rotation.x = -0.04 + Math.sin(t * 1.1) * 0.02;
    }

    // Platform energy rings rotation
    if (platformRingsRef.current) {
      platformRingsRef.current.rotation.y = t * 0.35;
    }

    // Right arm firmly raised holding up projection
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -1.25 + Math.sin(t * 1.5) * 0.02;
      rightArmRef.current.rotation.z = -0.38;
      rightArmRef.current.rotation.y = 0.32;
    }

    // Left arm resting at side with subtle idle sway
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = 0.12 + Math.sin(t * 1.2) * 0.03;
      leftArmRef.current.rotation.z = 0.16 + Math.sin(t * 0.9) * 0.02;
    }
  });

  return (
    <group ref={rootGroupRef} position={[0.0, -0.55, 0.0]} rotation={[0, -0.15, 0]} scale={1.05}>
      {/* --- GROUNDED CIRCULAR PLATFORM BASE --- */}
      <group position={[0, -1.25, 0]} ref={platformRingsRef}>
        {/* Outer Rotating Orange Energy Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.22, 1.45, 64]} />
          <meshStandardMaterial
            color="#FF8A24"
            emissive="#FF8A24"
            emissiveIntensity={2.6}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Inner Concentric Cyan Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.92, 1.02, 48]} />
          <meshStandardMaterial
            color="#20D9FF"
            emissive="#20D9FF"
            emissiveIntensity={2.2}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Glowing Floor Disc */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[0.9, 32]} />
          <meshStandardMaterial
            color="#FF8A24"
            emissive="#FF8A24"
            emissiveIntensity={0.5}
            transparent
            opacity={0.2}
          />
        </mesh>
        {/* Solid Dark Pedestal Base */}
        <mesh position={[0, -0.07, 0]}>
          <cylinderGeometry args={[1.42, 1.52, 0.12, 48]} />
          <meshStandardMaterial color="#0A1018" metalness={0.92} roughness={0.25} />
        </mesh>
      </group>

      {/* --- CHEST & TORSO --- */}
      <group position={[0, 0.8, 0]}>
        {/* Titanium Chest Plate */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.82, 0.95, 0.48]} />
          <meshStandardMaterial
            color="#d8e2ec"
            metalness={0.92}
            roughness={0.16}
          />
        </mesh>

        {/* Carbon Fiber Inset */}
        <mesh position={[0, 0.08, 0.25]} castShadow>
          <boxGeometry args={[0.62, 0.65, 0.04]} />
          <meshStandardMaterial color="#0c1219" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Central Arc Reactor Core (Vibrant Glowing Orange) */}
        <mesh ref={arcCoreRef} position={[0, 0.12, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.05, 32]} />
          <meshStandardMaterial
            color="#FF8A24"
            emissive="#FF8A24"
            emissiveIntensity={3.5}
            roughness={0.1}
          />
        </mesh>

        {/* Orange Conduit Accents */}
        <mesh position={[-0.24, -0.15, 0.26]}>
          <boxGeometry args={[0.035, 0.32, 0.02]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={2.5} />
        </mesh>
        <mesh position={[0.24, -0.15, 0.26]}>
          <boxGeometry args={[0.035, 0.32, 0.02]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={2.5} />
        </mesh>

        {/* Abdominal Spine */}
        <group position={[0, -0.58, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.26, 0.32, 16]} />
            <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.12]}>
            <boxGeometry args={[0.16, 0.24, 0.04]} />
            <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={2.0} />
          </mesh>
        </group>
      </group>

      {/* --- PELVIS & HIP CHASSIS --- */}
      <group position={[0, 0.08, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.68, 0.28, 0.42]} />
          <meshStandardMaterial color="#2d3748" metalness={0.88} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.02, 0.22]}>
          <boxGeometry args={[0.3, 0.12, 0.03]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={1.8} />
        </mesh>
      </group>

      {/* --- ARTICULATED LEGS & GROUNDED FEET --- */}
      {/* Right Leg */}
      <group position={[0.22, -0.06, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.09, 0.42, 16]} />
          <meshStandardMaterial color="#d8e2ec" metalness={0.9} roughness={0.18} />
        </mesh>
        {/* Knee Joint */}
        <mesh position={[0, -0.48, 0.02]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={1.8} />
        </mesh>
        {/* Shin with Cyan Conduit */}
        <mesh position={[0, -0.74, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.44, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh position={[0, -0.74, 0.09]}>
          <boxGeometry args={[0.05, 0.32, 0.02]} />
          <meshStandardMaterial color="#20D9FF" emissive="#20D9FF" emissiveIntensity={2.2} />
        </mesh>
        {/* Foot Planted on Platform */}
        <mesh position={[0, -1.02, 0.08]} castShadow>
          <boxGeometry args={[0.14, 0.1, 0.3]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group position={[-0.22, -0.06, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.09, 0.42, 16]} />
          <meshStandardMaterial color="#d8e2ec" metalness={0.9} roughness={0.18} />
        </mesh>
        {/* Knee Joint */}
        <mesh position={[0, -0.48, 0.02]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={1.8} />
        </mesh>
        {/* Shin with Cyan Conduit */}
        <mesh position={[0, -0.74, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.44, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh position={[0, -0.74, 0.09]}>
          <boxGeometry args={[0.05, 0.32, 0.02]} />
          <meshStandardMaterial color="#20D9FF" emissive="#20D9FF" emissiveIntensity={2.2} />
        </mesh>
        {/* Foot Planted on Platform */}
        <mesh position={[0, -1.02, 0.08]} castShadow>
          <boxGeometry args={[0.14, 0.1, 0.3]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* --- HEAD & SENSOR VISOR --- */}
      <group ref={headRef} position={[0, 1.48, 0.04]}>
        {/* Titanium Head Helmet */}
        <mesh castShadow>
          <boxGeometry args={[0.42, 0.4, 0.42]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.94} roughness={0.16} />
        </mesh>

        {/* Cyan Sensor Visor Bar */}
        <mesh ref={visorRef} position={[0, 0.05, 0.22]}>
          <boxGeometry args={[0.34, 0.1, 0.05]} />
          <meshStandardMaterial
            color="#20D9FF"
            emissive="#20D9FF"
            emissiveIntensity={3.2}
            roughness={0.05}
          />
        </mesh>

        {/* Orange Crown Antennae */}
        <mesh position={[0, 0.24, -0.04]}>
          <boxGeometry args={[0.05, 0.15, 0.28]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={2.2} />
        </mesh>

        {/* Ear Data Nodes */}
        <mesh position={[-0.23, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[0.23, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={1.8} />
        </mesh>
      </group>

      {/* --- RIGHT ARM & PALM EMITTER (RAISED UPWARD TOWARDS GLOBE) --- */}
      <group position={[0.5, 1.2, 0]}>
        {/* Shoulder Pauldron */}
        <mesh castShadow>
          <sphereGeometry args={[0.19, 16, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh position={[0.08, 0.06, 0]}>
          <torusGeometry args={[0.13, 0.018, 8, 24]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={2.5} />
        </mesh>

        {/* Articulated Arm Assembly */}
        <group ref={rightArmRef} position={[0, -0.08, 0]}>
          <mesh position={[0.04, -0.24, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.38, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0.04, -0.46, 0]} castShadow>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0.04, -0.72, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.38, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.16} />
          </mesh>
          {/* Hand with Palm Emitter */}
          <group position={[0.04, -0.96, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.12, 0.14, 0.07]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.02, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
              <meshStandardMaterial color="#20D9FF" emissive="#20D9FF" emissiveIntensity={4.2} />
            </mesh>
            {/* Holographic light cone radiating towards globe */}
            <pointLight position={[0, 0.15, 0.1]} color="#20D9FF" intensity={3.0} distance={3} />
          </group>
        </group>
      </group>

      {/* --- LEFT ARM (RELAXED AT SIDE) --- */}
      <group position={[-0.5, 1.2, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.19, 16, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh position={[-0.08, 0.06, 0]}>
          <torusGeometry args={[0.13, 0.018, 8, 24]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={2.5} />
        </mesh>

        <group ref={leftArmRef} position={[0, -0.08, 0]}>
          <mesh position={[-0.04, -0.24, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.38, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[-0.04, -0.46, 0]} castShadow>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[-0.04, -0.72, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.38, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.16} />
          </mesh>
          <mesh position={[-0.04, -0.96, 0]} castShadow>
            <boxGeometry args={[0.12, 0.14, 0.07]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// Subtle camera parallax on mouse move
function MouseParallax() {
  useFrame((state) => {
    const pointer = state.pointer;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, pointer.x * 0.4, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 0.35 + pointer.y * 0.25, 0.05);
    state.camera.lookAt(0, 0.2, 0);
  });
  return null;
}

export function HeroRobotCanvas() {
  return (
    <div className="w-full h-[480px] sm:h-[540px] lg:h-[600px] relative pointer-events-auto">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.35, 4.3], fov: 42, near: 0.1, far: 30 }}
        className="w-full h-full"
      >
        {/* Soft Ambient Key & Rim Lights */}
        <ambientLight color="#0c1424" intensity={1.1} />
        
        {/* Main Key Light */}
        <directionalLight
          position={[3.5, 5, 4]}
          intensity={1.8}
          color="#f1f5f9"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* Rim Light (Warm Orange) */}
        <directionalLight
          position={[-4, 2, -2]}
          intensity={2.8}
          color="#FF8A24"
        />

        {/* Fill Light (Cyan) */}
        <directionalLight
          position={[2, -2, 2]}
          intensity={1.2}
          color="#20D9FF"
        />

        {/* Arc Core Accent Light */}
        <pointLight position={[0, 0.4, 1.2]} intensity={1.8} color="#FF8A24" distance={4} />

        {/* Mouse Parallax Effect */}
        <MouseParallax />

        {/* Humanoid Robot on Platform */}
        <HumanoidRobot />

        {/* Holographic Cyan Globe Hovering Above Hand */}
        <HolographicHoloGlobe position={[0.48, 1.15, 0.2]} />
      </Canvas>
    </div>
  );
}
