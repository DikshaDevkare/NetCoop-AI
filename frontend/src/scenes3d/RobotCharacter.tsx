import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface RobotCharacterProps {
  handRaised?: boolean;
  introProgress?: number; // 0 to 1
  isHeroState?: boolean;
}

export function RobotCharacter({
  handRaised = false,
  introProgress = 1,
  isHeroState = true,
}: RobotCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const visorRef = useRef<THREE.Mesh>(null);

  // Smooth animations on every frame
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      if (isHeroState) {
        // Subtle floating idle motion
        groupRef.current.position.y = Math.sin(time * 1.5) * 0.08 - 0.2;
        groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.06;
      }
    }

    // Subtle head tracking/breathing
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(time * 0.8) * 0.08;
      headRef.current.rotation.x = Math.sin(time * 1.2) * 0.04;
    }

    // Pulsing power core
    if (coreRef.current) {
      const pulse = 1 + Math.sin(time * 3) * 0.15;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }

    // Visor scanning flicker
    if (visorRef.current) {
      const mat = visorRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 1.8 + Math.sin(time * 4) * 0.4;
      }
    }

    // Right arm hand raised state (prospecting the holographic globe)
    if (rightArmRef.current) {
      const targetRotX = handRaised ? -1.35 : -0.2 + Math.sin(time * 1.2) * 0.05;
      const targetRotZ = handRaised ? -0.45 : -0.15;
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
        rightArmRef.current.rotation.x,
        targetRotX,
        0.05
      );
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
        rightArmRef.current.rotation.z,
        targetRotZ,
        0.05
      );
    }

    // Left arm relaxed idle
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = 0.1 + Math.sin(time * 1.0) * 0.04;
      leftArmRef.current.rotation.z = 0.15 + Math.sin(time * 0.7) * 0.02;
    }
  });

  // Calculate position during intro progression vs hero
  const posX = isHeroState ? 1.6 : THREE.MathUtils.lerp(-3, 1.6, introProgress);
  const posZ = isHeroState ? 0.2 : THREE.MathUtils.lerp(-8, 0.2, introProgress);
  const rotY = isHeroState ? -0.35 : THREE.MathUtils.lerp(Math.PI, -0.35, introProgress);

  return (
    <group ref={groupRef} position={[posX, 0, posZ]} rotation={[0, rotY, 0]} scale={1.2}>
      {/* --- CHEST & TORSO --- */}
      <group position={[0, 1.4, 0]}>
        {/* Main armored chest plate - metallic titanium */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.9, 1.1, 0.55]} />
          <meshStandardMaterial
            color="#d8e2ec"
            metalness={0.88}
            roughness={0.22}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Chest Carbon Fiber Accents */}
        <mesh position={[0, 0.1, 0.28]} castShadow>
          <boxGeometry args={[0.7, 0.7, 0.05]} />
          <meshStandardMaterial color="#161b24" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Central Arc Core - Glowing Vibrant Orange */}
        <mesh ref={coreRef} position={[0, 0.15, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.06, 32]} />
          <meshStandardMaterial
            color="#FF8A24"
            emissive="#FF8A24"
            emissiveIntensity={2.8}
            roughness={0.1}
          />
        </mesh>

        {/* Glowing Orange Conduit Lines */}
        <mesh position={[-0.26, -0.2, 0.29]}>
          <boxGeometry args={[0.04, 0.35, 0.02]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={2.0} />
        </mesh>
        <mesh position={[0.26, -0.2, 0.29]}>
          <boxGeometry args={[0.04, 0.35, 0.02]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={2.0} />
        </mesh>

        {/* Abdominal articulate spine */}
        <group position={[0, -0.65, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.25, 0.3, 0.35, 16]} />
            <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.14]}>
            <boxGeometry args={[0.18, 0.28, 0.05]} />
            <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={1.5} />
          </mesh>
        </group>
      </group>

      {/* --- PELVIS & LOWER CHASSIS --- */}
      <group position={[0, 0.55, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.75, 0.35, 0.45]} />
          <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Antigravity Thruster Emitters */}
        <mesh position={[-0.22, -0.2, 0]}>
          <cylinderGeometry args={[0.14, 0.08, 0.25, 16]} />
          <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.22, -0.32, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
          <meshStandardMaterial color="#20D9FF" emissive="#20D9FF" emissiveIntensity={3.0} />
        </mesh>

        <mesh position={[0.22, -0.2, 0]}>
          <cylinderGeometry args={[0.14, 0.08, 0.25, 16]} />
          <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.22, -0.32, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
          <meshStandardMaterial color="#20D9FF" emissive="#20D9FF" emissiveIntensity={3.0} />
        </mesh>
      </group>

      {/* --- HEAD & SENSOR VISOR --- */}
      <group ref={headRef} position={[0, 2.15, 0.05]}>
        {/* Titanium Head Helmet */}
        <mesh castShadow>
          <boxGeometry args={[0.48, 0.46, 0.46]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Cyan Sensor Visor Bar */}
        <mesh ref={visorRef} position={[0, 0.06, 0.24]}>
          <boxGeometry args={[0.38, 0.12, 0.06]} />
          <meshStandardMaterial
            color="#20D9FF"
            emissive="#20D9FF"
            emissiveIntensity={2.5}
            roughness={0.05}
          />
        </mesh>

        {/* Orange Crown Antennae / Comm Fin */}
        <mesh position={[0, 0.28, -0.05]}>
          <boxGeometry args={[0.06, 0.18, 0.32]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={1.8} />
        </mesh>

        {/* Ear Data Nodes */}
        <mesh position={[-0.26, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[0.26, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* --- RIGHT ARM & PROJECTION HAND --- */}
      <group position={[0.55, 1.85, 0]}>
        {/* Shoulder Pauldron */}
        <mesh castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.1, 0.08, 0]}>
          <torusGeometry args={[0.15, 0.02, 8, 24]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={2.0} />
        </mesh>

        {/* Articulated Arm Assembly */}
        <group ref={rightArmRef} position={[0, -0.1, 0]}>
          {/* Upper Arm Bicep */}
          <mesh position={[0.05, -0.28, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.1, 0.45, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Elbow Joint */}
          <mesh position={[0.05, -0.54, 0]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Forearm */}
          <mesh position={[0.05, -0.84, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.45, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.88} roughness={0.2} />
          </mesh>

          {/* Right Hand Projector */}
          <group position={[0.05, -1.12, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.14, 0.16, 0.08]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Palm Hologram Emitter Beacon */}
            <mesh position={[0, -0.02, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
              <meshStandardMaterial color="#20D9FF" emissive="#20D9FF" emissiveIntensity={3.5} />
            </mesh>
          </group>
        </group>
      </group>

      {/* --- LEFT ARM --- */}
      <group position={[-0.55, 1.85, 0]}>
        {/* Left Shoulder Pauldron */}
        <mesh castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.1, 0.08, 0]}>
          <torusGeometry args={[0.15, 0.02, 8, 24]} />
          <meshStandardMaterial color="#FF8A24" emissive="#FF8A24" emissiveIntensity={2.0} />
        </mesh>

        <group ref={leftArmRef} position={[0, -0.1, 0]}>
          <mesh position={[-0.05, -0.28, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.1, 0.45, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[-0.05, -0.54, 0]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[-0.05, -0.84, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.08, 0.45, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.88} roughness={0.2} />
          </mesh>
          <mesh position={[-0.05, -1.12, 0]} castShadow>
            <boxGeometry args={[0.14, 0.16, 0.08]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
