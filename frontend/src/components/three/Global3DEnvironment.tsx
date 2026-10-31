import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Global3DEnvironmentProps } from '../../types/three.types.ts';
import { getScenePreset } from '../../scenes/presets.ts';
import { NetworkNodes } from './NetworkNodes.tsx';
import { EnergyBeams } from './EnergyBeams.tsx';
import { ParticleSwarm } from './ParticleSwarm.tsx';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { useWindowDimensions } from '../../hooks/useWindowDimensions.ts';
import { cn } from '../../lib/utils.ts';

export function Global3DEnvironment({
  preset = 'default',
  reducedMotionOverride,
  className,
}: Global3DEnvironmentProps) {
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = reducedMotionOverride ?? systemReducedMotion;
  const { isMobile } = useWindowDimensions();

  const sceneConfig = useMemo(() => getScenePreset(preset), [preset]);

  // Adjust camera distance for mobile responsiveness
  const cameraZ = isMobile ? sceneConfig.cameraZ * 1.35 : sceneConfig.cameraZ;

  return (
    <div
      className={cn('global-3d-canvas-container', className)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
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
          {/* Subtle Ambient & Directional Lighting */}
          <ambientLight intensity={0.4} color="#191C26" />
          <directionalLight position={[10, 10, 10]} intensity={0.8} color="#FFF0DB" />

          {/* Primary Ember Point Lights */}
          <pointLight position={[6, 5, 4]} intensity={2.2} color="#FF7A18" distance={20} decay={2} />
          <pointLight position={[-6, -4, 3]} intensity={1.8} color="#FFB347" distance={18} decay={2} />
          <pointLight position={[0, 6, -5]} intensity={1.4} color="#A855F7" distance={16} decay={2} />
          <pointLight position={[0, -6, 2]} intensity={1.2} color="#38D9FF" distance={14} decay={2} />

          {/* Real 3D Geometries */}
          <NetworkNodes nodes={sceneConfig.nodes} reducedMotion={reducedMotion} />
          <EnergyBeams connections={sceneConfig.connections} reducedMotion={reducedMotion} />
          <ParticleSwarm count={sceneConfig.particleCount} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
