import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Deterministic pseudo-random number generator for pure rendering
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function NetworkParticles({ count = 240 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const colorOrange = new THREE.Color('#FF8A24');
    const colorCyan = new THREE.Color('#20D9FF');
    const colorWhite = new THREE.Color('#ffffff');

    for (let i = 0; i < count; i++) {
      // Deterministic spatial distribution across space
      pos[i * 3] = (pseudoRandom(i * 3 + 1) - 0.5) * 22;
      pos[i * 3 + 1] = (pseudoRandom(i * 3 + 2) - 0.5) * 16;
      pos[i * 3 + 2] = (pseudoRandom(i * 3 + 3) - 0.5) * 18;

      // Color distribution: 50% orange, 40% cyan, 10% white
      const rand = pseudoRandom(i * 7 + 4);
      let chosenColor = colorOrange;
      if (rand < 0.45) chosenColor = colorCyan;
      else if (rand < 0.55) chosenColor = colorWhite;

      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.015;
      pointsRef.current.rotation.x = Math.sin(time * 0.01) * 0.05;
    }
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
        size={0.06}
        vertexColors
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
