import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { EnergyConnectionData } from '../../types/three.types.ts';

interface EnergyBeamsProps {
  connections: EnergyConnectionData[];
  reducedMotion?: boolean;
}

export function EnergyBeams({ connections, reducedMotion = false }: EnergyBeamsProps) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const { positions, colors } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];

    connections.forEach((conn) => {
      pos.push(...conn.from);
      pos.push(...conn.to);

      const colorObj = new THREE.Color(conn.color);
      col.push(colorObj.r, colorObj.g, colorObj.b);
      col.push(colorObj.r, colorObj.g, colorObj.b);
    });

    return {
      positions: new Float32Array(pos),
      colors: new Float32Array(col),
    };
  }, [connections]);

  useFrame((state) => {
    if (!lineRef.current || reducedMotion) return;

    const material = lineRef.current.material as THREE.LineBasicMaterial;
    if (material) {
      // Subtle pulsing energy intensity
      const pulse = 0.45 + Math.sin(state.clock.elapsedTime * 1.8) * 0.2;
      material.opacity = pulse;
    }
  });

  return (
    <lineSegments ref={lineRef}>
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
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}
