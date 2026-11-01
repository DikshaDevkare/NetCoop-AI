import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface RobotCharacterProps {
  handRaised?: boolean;
  introProgress?: number; // 0 to 1
  isHeroState?: boolean;
}

export function RobotCharacter({
  handRaised = true,
  introProgress = 1,
  isHeroState = true,
}: RobotCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const visorRef = useRef<THREE.Mesh>(null);
  const platformRingsRef = useRef<THREE.Group>(null);

  // Smooth animations on every frame
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      if (isHeroState) {
        // Subtle floating / breathing idle motion
        groupRef.current.position.y = Math.sin(time * 1.5) * 0.04 - 0.45;
      }
    }

    // Subtle head tracking/breathing
    if (headRef.current) {
      headRef.current.rotation.y = 0.15 + Math.sin(time * 0.8) * 0.05;
      headRef.current.rotation.x = -0.05 + Math.sin(time * 1.2) * 0.03;
    }

    // Pulsing power core
    if (coreRef.current) {
      const pulse = 1 + Math.sin(time * 3) * 0.12;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }

    // Visor scanning flicker
    if (visorRef.current) {
      const mat = visorRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 2.4 + Math.sin(time * 4) * 0.4;
      }
    }

    // Platform rings rotation
    if (platformRingsRef.current) {
      platformRingsRef.current.rotation.y = time * 0.35;
    }

    // Right arm hand raised state (projecting the holographic globe)
    if (rightArmRef.current) {
      const targetRotX = handRaised ? -1.35 : -0.2 + Math.sin(time * 1.2) * 0.05;
      const targetRotZ = handRaised ? -0.42 : -0.15;
      const targetRotY = handRaised ? 0.35 : 0;
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
        rightArmRef.current.rotation.x,
        targetRotX,
        0.06
      );
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
        rightArmRef.current.rotation.z,
        targetRotZ,
        0.06
      );
      rightArmRef.current.rotation.y = THREE.MathUtils.lerp(
        rightArmRef.current.rotation.y,
        targetRotY,
        0.06
      );
    }

    // Left arm relaxed idle
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = 0.15 + Math.sin(time * 1.0) * 0.03;
      leftArmRef.current.rotation.z = 0.18 + Math.sin(time * 0.7) * 0.02;
    }
  });

  // Calculate position during intro progression vs hero
  // In the reference, robot stands in the center-right of the hero canvas
  const posX = isHeroState ? 0.35 : THREE.MathUtils.lerp(-3.8, 0.35, introProgress);
  const posZ = isHeroState ? 0.1 : THREE.MathUtils.lerp(-6, 0.1, introProgress);
  const rotY = isHeroState ? -0.15 : THREE.MathUtils.lerp(Math.PI, -0.15, introProgress);

  return (
    <group ref={groupRef} position={[posX, -0.45, posZ]} rotation={[0, rotY, 0]} scale={1.15}>
      {/* --- GLOWING ORANGE CIRCULAR ENERGY PLATFORM --- */}
      <group position={[0, -1.25, 0]} ref={platformRingsRef}>
        {/* Outer Orange Rotating Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.25, 1.48, 64]} />
          <meshStandardMaterial
            color="#FF8A24"
            emissive="#FF8A24"
            emissiveIntensity={2.8}
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
            emissiveIntensity={2.4}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Glowing Inner Floor Disc */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[0.9, 32]} />
          <meshStandardMaterial
            color="#FF8A24"
            emissive="#FF8A24"
            emissiveIntensity={0.6}
            transparent
            opacity={0.2}
          />
        </mesh>
        {/* Solid Dark Pedestal Base */}
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[1.45, 1.55, 0.12, 48]} />
          <meshStandardMaterial color="#0A1018" metalness={0.92} roughness={0.25} />
        </mesh>
      </group>

      {/* --- CHEST & TORSO --- */}
      <group position={[0, 0.8, 0]}>
        {/* Main armored chest plate - metallic titanium */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.82, 0.95, 0.48]} />
          <meshStandardMaterial
            color="#d8e2ec"
            metalness={0.92}
            roughness={0.16}
            envMapIntensity={2.0}
          />
        </mesh>

        {/* Chest Carbon Fiber Accents */}
        <mesh position={[0, 0.08, 0.25]} castShadow>
          <boxGeometry args={[0.62, 0.65, 0.04]} />
          <meshStandardMaterial color="#0c1219" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Central Arc Core - Glowing Vibrant Orange */}
        <mesh ref={coreRef} position={[0, 0.12, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.05, 32]} />
          <meshStandardMaterial
            color="#FF8A24"
            emissive="#FF8A24"
            emissiveIntensity={3.5}
            roughness={0.1}
          />
        </mesh>

        {/* Glowing Orange Conduit Lines */}
        <mesh position={[-0.24, -0.15, 0.26]}>
          <boxGeometry args={[0.035, 0.32, 0.02]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={2.5} />
        </mesh>
        <mesh position={[0.24, -0.15, 0.26]}>
          <boxGeometry args={[0.035, 0.32, 0.02]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={2.5} />
        </mesh>

        {/* Abdominal articulate spine */}
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

      {/* --- ARTICULATED LEGS & FEET STANDING ON PLATFORM --- */}
      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.22, -0.06, 0]}>
        {/* Upper Thigh */}
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.09, 0.42, 16]} />
          <meshStandardMaterial color="#d8e2ec" metalness={0.9} roughness={0.18} />
        </mesh>
        <mesh position={[0, -0.24, 0.1]}>
          <boxGeometry args={[0.08, 0.32, 0.03]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Knee Joint */}
        <mesh position={[0, -0.48, 0.02]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={1.8} />
        </mesh>

        {/* Lower Shin / Calf */}
        <mesh position={[0, -0.74, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.44, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh position={[0, -0.74, 0.09]}>
          <boxGeometry args={[0.06, 0.35, 0.02]} />
          <meshStandardMaterial color="#20D9FF" emissive="#20D9FF" emissiveIntensity={2.0} />
        </mesh>

        {/* Foot Grounded on Platform */}
        <mesh position={[0, -1.02, 0.08]} castShadow>
          <boxGeometry args={[0.14, 0.1, 0.3]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.22, -0.06, 0]}>
        {/* Upper Thigh */}
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.09, 0.42, 16]} />
          <meshStandardMaterial color="#d8e2ec" metalness={0.9} roughness={0.18} />
        </mesh>
        <mesh position={[0, -0.24, 0.1]}>
          <boxGeometry args={[0.08, 0.32, 0.03]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Knee Joint */}
        <mesh position={[0, -0.48, 0.02]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={1.8} />
        </mesh>

        {/* Lower Shin / Calf */}
        <mesh position={[0, -0.74, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.44, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh position={[0, -0.74, 0.09]}>
          <boxGeometry args={[0.06, 0.35, 0.02]} />
          <meshStandardMaterial color="#20D9FF" emissive="#20D9FF" emissiveIntensity={2.0} />
        </mesh>

        {/* Foot Grounded on Platform */}
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

        {/* Orange Crown Antennae / Comm Fin */}
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

      {/* --- RIGHT ARM & PROJECTION HAND (RAISED TOWARDS GLOBE) --- */}
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

          {/* Elbow Joint */}
          <mesh position={[0.04, -0.46, 0]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Forearm */}
          <mesh position={[0.04, -0.72, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.38, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.16} />
          </mesh>

          {/* Right Hand Projector */}
          <group position={[0.04, -0.96, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.12, 0.14, 0.07]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Palm Hologram Emitter Beacon */}
            <mesh position={[0, -0.02, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
              <meshStandardMaterial color="#20D9FF" emissive="#20D9FF" emissiveIntensity={4.2} />
            </mesh>
            {/* Holographic light cone radiating towards globe */}
            <pointLight position={[0, 0.1, 0.1]} color="#20D9FF" intensity={3.5} distance={4} />
          </group>
        </group>
      </group>

      {/* --- LEFT ARM --- */}
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
          <mesh position={[-0.04, -0.46, 0]}>
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
