import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { RobotCharacter } from './RobotCharacter';
import { HolographicPortal } from './HolographicPortal';
import { NetworkGlobe } from './NetworkGlobe';
import { AgentCore3D } from './AgentCore3D';
import { NetworkInfrastructure3D } from './NetworkInfrastructure3D';
import { NetworkParticles } from './NetworkParticles';
import type { NetworkNode, AgentInfo } from '../types';

interface CanvasContainerProps {
  scrollProgress: number;
  introComplete: boolean;
  introScene: number; // 1 to 6
  introProgress: number; // 0 to 1
  onSelectNode?: (node: NetworkNode) => void;
  selectedNodeId?: string | null;
  selectedAgentId?: string;
  onSelectAgent?: (agent: AgentInfo) => void;
  faultSimulated?: boolean;
}

export function CanvasContainer({
  scrollProgress,
  introComplete,
  introScene,
  introProgress,
  onSelectNode,
  selectedNodeId,
  selectedAgentId,
  onSelectAgent,
}: CanvasContainerProps) {
  // Determine which 3D objects are visible based on intro and scroll section
  const isIntro = !introComplete;

  // Hero section is visible during intro scene >= 3 or when scrollProgress < 0.35
  const showHeroRobot = isIntro ? introScene >= 3 : scrollProgress < 0.35;
  const showPortal = isIntro && introScene >= 1 && introScene <= 3;
  const showGlobe = isIntro ? introScene >= 5 : scrollProgress < 0.65;
  const showInfrastructure = !isIntro && scrollProgress >= 0.35 && scrollProgress < 0.75;
  const showAgents = !isIntro && scrollProgress >= 0.55 && scrollProgress < 0.95;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0.6, 1.4, 5.2], fov: 45, near: 0.1, far: 50 }}
        className="w-full h-full pointer-events-auto"
      >
        <Suspense fallback={null}>
          {/* --- CINEMATIC LIGHTING --- */}
          <ambientLight color="#0f172a" intensity={0.9} />
          
          {/* Main Key Light */}
          <directionalLight
            position={[4, 6, 5]}
            intensity={1.8}
            color="#f8fafc"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          {/* Warm Orange Rim Light */}
          <directionalLight
            position={[-5, 3, -3]}
            intensity={2.8}
            color="#FF8A24"
          />

          {/* Cool Electric Cyan Fill Light */}
          <directionalLight
            position={[0, -4, 3]}
            intensity={1.4}
            color="#20D9FF"
          />

          {/* Accent Point Light for Arc Energy */}
          <pointLight position={[1.6, 1.6, 0.6]} intensity={2.0} color="#FF8A24" distance={5} />

          {/* --- AMBIENT 3D PARTICLES --- */}
          <NetworkParticles count={180} />

          {/* --- CAMERA MOVEMENT CONTROLLER --- */}
          <CameraController
            scrollProgress={scrollProgress}
            introComplete={introComplete}
          />

          {/* --- INTRO PORTAL --- */}
          {showPortal && (
            <HolographicPortal
              active={showPortal}
              progress={introScene === 1 ? 0.3 : introScene === 2 ? 0.9 : 0.4}
            />
          )}

          {/* --- 3D ROBOT CHARACTER --- */}
          {showHeroRobot && (
            <group position={[0, 0, 0]}>
              <RobotCharacter
                handRaised={isIntro ? introScene >= 5 : scrollProgress < 0.25}
                introProgress={introProgress}
                isHeroState={introComplete}
              />
            </group>
          )}

          {/* --- INTERACTIVE 3D NETWORK GLOBE (ABOVE ROBOT'S EXTENDED HAND) --- */}
          {showGlobe && (
            <group
              position={
                isIntro
                  ? [1.2, 0.9, 0.3]
                  : scrollProgress < 0.25
                  ? [1.35, 1.15, 0.2]
                  : [0, 0.3, 0]
              }
              scale={isIntro || scrollProgress < 0.25 ? 0.48 : 0.95}
            >
              <NetworkGlobe
                onSelectNode={onSelectNode}
                selectedNodeId={selectedNodeId}
                interactive={true}
              />
            </group>
          )}

          {/* --- SPATIAL 3D NETWORK INFRASTRUCTURE --- */}
          {showInfrastructure && (
            <group position={[0, 0, 0]}>
              <NetworkInfrastructure3D />
            </group>
          )}

          {/* --- 5 ORBITING AI AGENT CORES --- */}
          {showAgents && (
            <group position={[0, 0.2, 0]}>
              <AgentCore3D
                selectedAgentId={selectedAgentId}
                onSelectAgent={onSelectAgent}
              />
            </group>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
