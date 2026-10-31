import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { NetworkNodeData } from '../../types/three.types.ts';

interface NetworkNodesProps {
  nodes: NetworkNodeData[];
  reducedMotion?: boolean;
}

export function NetworkNodes({ nodes, reducedMotion = false }: NetworkNodesProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!reducedMotion) {
      // Gentle breathing rotation of the entire cluster
      groupRef.current.rotation.y += delta * 0.08;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.05;

      // Subtle mouse parallax
      const targetX = state.pointer.x * 0.4;
      const targetY = state.pointer.y * 0.3;
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.04;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, index) => (
        <SingleNode key={node.id} node={node} index={index} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

function SingleNode({
  node,
  index,
  reducedMotion,
}: {
  node: NetworkNodeData;
  index: number;
  reducedMotion: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const initialY = node.position[1];

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (!reducedMotion) {
      // Individual nodal floating oscillation
      const time = state.clock.elapsedTime;
      const floatOffset = Math.sin(time * node.pulseRate + index) * 0.12;
      meshRef.current.position.y = initialY + floatOffset;

      // Axial spin
      meshRef.current.rotation.y += delta * 0.35;
      meshRef.current.rotation.z += delta * 0.15;

      if (ringRef.current) {
        ringRef.current.rotation.x += delta * 0.5;
        ringRef.current.rotation.y -= delta * 0.25;
      }
    }
  });

  // Different geometry based on node type
  return (
    <group position={node.position}>
      {/* Primary 3D Node Mesh */}
      <mesh ref={meshRef}>
        {node.type === 'core' ? (
          <octahedronGeometry args={[node.size, 0]} />
        ) : node.type === 'agent' ? (
          <icosahedronGeometry args={[node.size, 1]} />
        ) : (
          <dodecahedronGeometry args={[node.size, 0]} />
        )}
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={node.type === 'core' ? 0.9 : 0.6}
          roughness={0.25}
          metalness={0.85}
          wireframe={node.type === 'switch'}
        />
      </mesh>

      {/* Orbiting Specular Ring for Core & Agent nodes */}
      {(node.type === 'core' || node.type === 'agent') && (
        <mesh ref={ringRef}>
          <torusGeometry args={[node.size * 1.45, 0.02, 16, 48]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.65} />
        </mesh>
      )}

      {/* Point light glow attached to Core Nexus node */}
      {node.type === 'core' && (
        <pointLight color={node.color} intensity={2.5} distance={6} decay={2} />
      )}
    </group>
  );
}
