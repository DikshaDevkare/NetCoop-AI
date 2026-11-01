import * as THREE from 'three';

interface PerspectiveGridProps {
  size?: number;
  divisions?: number;
  colorCenterLine?: string;
  colorGrid?: string;
  position?: [number, number, number];
}

export function PerspectiveGrid({
  size = 14,
  divisions = 28,
  colorCenterLine = '#FF9A24',
  colorGrid = '#151722',
  position = [0, -0.42, 0],
}: PerspectiveGridProps) {
  return (
    <group position={position}>
      {/* Primary Grid Helper */}
      <gridHelper args={[size, divisions, colorCenterLine, colorGrid]} />

      {/* Subtle Radial Floor Glow to soften horizon */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[0.1, size / 1.8, 36]} />
        <meshBasicMaterial
          color="#FF6A16"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
