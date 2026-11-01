import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FIVE_AGENTS } from '../utils/mockTopology';
import type { AgentInfo } from '../types';

interface AgentCore3DProps {
  selectedAgentId?: string;
  onSelectAgent?: (agent: AgentInfo) => void;
}

export function AgentCore3D({
  selectedAgentId,
  onSelectAgent,
}: AgentCore3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const centralCoreRef = useRef<THREE.Mesh>(null);
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);

  // Orbit radius for the 5 agents around the central hub
  const orbitRadius = 2.6;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Central intelligence hub rotation & breathing pulse
    if (centralCoreRef.current) {
      centralCoreRef.current.rotation.y = time * 0.4;
      centralCoreRef.current.rotation.x = time * 0.2;
      const s = 1.0 + Math.sin(time * 2.5) * 0.08;
      centralCoreRef.current.scale.set(s, s, s);
    }

    // Slow planetary orbit
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* --- CENTRAL CONSENSUS INTELLIGENCE HUB --- */}
      <mesh ref={centralCoreRef}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color="#FF8A24"
          emissive="#FF8A24"
          emissiveIntensity={2.5}
          wireframe
        />
      </mesh>
      {/* Center Solid Nucleus */}
      <mesh>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Central Rotating Orbit Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.85, 0.02, 16, 48]} />
        <meshStandardMaterial
          color="#20D9FF"
          emissive="#20D9FF"
          emissiveIntensity={2.0}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* --- 5 ORBITING AGENT CORES --- */}
      {FIVE_AGENTS.map((agent, index) => {
        const angle = (index / FIVE_AGENTS.length) * Math.PI * 2;
        const x = Math.cos(angle) * orbitRadius;
        const z = Math.sin(angle) * orbitRadius;

        const isHovered = hoveredAgentId === agent.id;
        const isSelected = selectedAgentId === agent.id;
        const scale = isSelected ? 1.4 : isHovered ? 1.25 : 1.0;

        return (
          <group
            key={agent.id}
            position={[x, 0, z]}
            scale={[scale, scale, scale]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredAgentId(agent.id);
            }}
            onPointerOut={() => setHoveredAgentId(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectAgent?.(agent);
            }}
          >
            {/* Connecting Laser Beam to Central Hub */}
            <primitive
              object={
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(-x, 0, -z),
                  ]),
                  new THREE.LineBasicMaterial({
                    color: agent.accentColor,
                    transparent: true,
                    opacity: isSelected ? 0.9 : 0.4,
                  })
                )
              }
            />

            {/* Individualized 3D Agent Geometry */}
            {agent.id === 'telemetry-performance' && (
              // Pulsating Signal Core: Icosahedron + Outer Signal Rings
              <group>
                <mesh castShadow>
                  <icosahedronGeometry args={[0.28, 0]} />
                  <meshStandardMaterial
                    color={agent.accentColor}
                    emissive={agent.accentColor}
                    emissiveIntensity={isSelected ? 3.5 : 2.0}
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>
                <mesh rotation={[Math.PI / 4, 0, 0]}>
                  <torusGeometry args={[0.42, 0.015, 8, 32]} />
                  <meshBasicMaterial color={agent.accentColor} wireframe />
                </mesh>
              </group>
            )}

            {agent.id === 'infrastructure-health' && (
              // Mechanical Server Core: Octahedron inside Cage Box
              <group>
                <mesh castShadow>
                  <octahedronGeometry args={[0.26, 0]} />
                  <meshStandardMaterial
                    color={agent.accentColor}
                    emissive={agent.accentColor}
                    emissiveIntensity={isSelected ? 3.5 : 2.0}
                    metalness={0.9}
                    roughness={0.1}
                  />
                </mesh>
                <mesh>
                  <boxGeometry args={[0.45, 0.45, 0.45]} />
                  <meshBasicMaterial
                    color={agent.secondaryColor}
                    wireframe
                    transparent
                    opacity={0.6}
                  />
                </mesh>
              </group>
            )}

            {agent.id === 'connectivity-analysis' && (
              // Interconnected Node Core: Dodecahedron with Satellite Nodes
              <group>
                <mesh castShadow>
                  <dodecahedronGeometry args={[0.25, 0]} />
                  <meshStandardMaterial
                    color={agent.accentColor}
                    emissive={agent.accentColor}
                    emissiveIntensity={isSelected ? 3.5 : 2.2}
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>
                <mesh position={[0.38, 0.1, 0]}>
                  <sphereGeometry args={[0.07, 8, 8]} />
                  <meshBasicMaterial color={agent.secondaryColor} />
                </mesh>
                <mesh position={[-0.38, -0.1, 0]}>
                  <sphereGeometry args={[0.07, 8, 8]} />
                  <meshBasicMaterial color={agent.secondaryColor} />
                </mesh>
              </group>
            )}

            {agent.id === 'fault-correlation' && (
              // Central Merging Intelligence Core: Dual intersecting rings
              <group>
                <mesh castShadow>
                  <sphereGeometry args={[0.24, 16, 16]} />
                  <meshStandardMaterial
                    color={agent.accentColor}
                    emissive={agent.accentColor}
                    emissiveIntensity={isSelected ? 3.8 : 2.2}
                    metalness={0.7}
                    roughness={0.3}
                  />
                </mesh>
                <mesh rotation={[0, Math.PI / 4, 0]}>
                  <torusGeometry args={[0.44, 0.02, 8, 32]} />
                  <meshStandardMaterial
                    color={agent.accentColor}
                    emissive={agent.accentColor}
                    emissiveIntensity={2.5}
                  />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.44, 0.02, 8, 32]} />
                  <meshStandardMaterial
                    color="#FF8A24"
                    emissive="#FF8A24"
                    emissiveIntensity={2.5}
                  />
                </mesh>
              </group>
            )}

            {agent.id === 'recommendation-reporting' && (
              // Holographic Output Core: Faceted diamond prism
              <group>
                <mesh castShadow>
                  <coneGeometry args={[0.26, 0.5, 6]} />
                  <meshStandardMaterial
                    color={agent.accentColor}
                    emissive={agent.accentColor}
                    emissiveIntensity={isSelected ? 3.5 : 2.2}
                    metalness={0.9}
                    roughness={0.1}
                  />
                </mesh>
                <mesh position={[0, -0.15, 0]} rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.26, 0.35, 6]} />
                  <meshStandardMaterial
                    color={agent.accentColor}
                    emissive={agent.accentColor}
                    emissiveIntensity={isSelected ? 3.5 : 2.2}
                  />
                </mesh>
              </group>
            )}

            {/* Glowing Aura Spheres */}
            {(isHovered || isSelected) && (
              <mesh>
                <sphereGeometry args={[0.55, 16, 16]} />
                <meshBasicMaterial
                  color={agent.accentColor}
                  transparent
                  opacity={0.25}
                  wireframe
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
