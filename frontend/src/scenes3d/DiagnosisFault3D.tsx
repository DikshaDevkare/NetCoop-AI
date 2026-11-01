import { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';

interface DiagnosisFault3DProps {
  faultyNodeId?: string;
  faultType?: string;
}

function FaultScene({
  faultyNodeId = 'SW-DIST-01',
  faultType = 'Buffer Congestion & Queue Tail Drops',
}: DiagnosisFault3DProps) {
  const faultMeshRef = useRef<THREE.Mesh>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (faultMeshRef.current) {
      faultMeshRef.current.rotation.y = t * 0.8;
    }
    if (pulseRingRef.current) {
      const scale = 1 + (t % 2) * 1.5;
      pulseRingRef.current.scale.set(scale, scale, scale);
      const mat = pulseRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = Math.max(0, 0.8 - (t % 2) * 0.4);
    }
    if (beaconRef.current) {
      beaconRef.current.scale.y = 1 + Math.sin(t * 4) * 0.2;
    }
  });

  // Nodes in the isolated fault domain
  const nodes = [
    { id: faultyNodeId, name: 'Core Dist Switch', pos: [0, 0.4, 0] as [number, number, number], isFault: true, color: '#FF4D5A' },
    { id: 'RTR-CORE-01', name: 'Campus Core Router', pos: [0, 2.0, -2.8] as [number, number, number], isFault: false, color: '#26D7A0' },
    { id: 'SW-ACCESS-01', name: 'West Edge Switch', pos: [-3.2, -0.6, 2.0] as [number, number, number], isFault: false, color: '#FFB547' },
    { id: 'SW-ACCESS-02', name: 'East Edge Switch', pos: [3.2, -0.6, 2.0] as [number, number, number], isFault: false, color: '#26D7A0' },
    { id: 'SRV-DNS-01', name: 'Internal DNS Server', pos: [-3.0, 1.4, -2.0] as [number, number, number], isFault: false, color: '#20D9FF' },
  ];

  // Fiber links connecting to the faulty node
  const links: Array<{ from: [number, number, number]; to: [number, number, number]; isChoked: boolean }> = [
    { from: [0, 0.4, 0], to: [0, 2.0, -2.8], isChoked: true },
    { from: [0, 0.4, 0], to: [-3.2, -0.6, 2.0], isChoked: true },
    { from: [0, 0.4, 0], to: [3.2, -0.6, 2.0], isChoked: false },
    { from: [0, 2.0, -2.8], to: [-3.0, 1.4, -2.0], isChoked: false },
  ];

  return (
    <group>
      {/* Ground Grid */}
      <gridHelper args={[16, 16, '#FF4D5A', '#101A25']} position={[0, -1.2, 0]} />

      {/* Fiber Links */}
      {links.map((link, idx) => (
        <Line
          key={idx}
          points={[
            link.from,
            link.to,
          ]}
          color={link.isChoked ? '#FF4D5A' : '#20D9FF'}
          lineWidth={link.isChoked ? 3 : 1}
          transparent
          opacity={link.isChoked ? 0.9 : 0.4}
        />
      ))}

      {/* Render Nodes */}
      {nodes.map((node) => {
        if (node.isFault) {
          return (
            <group key={node.id} position={node.pos}>
              {/* Fault Pulsing Ring */}
              <mesh ref={pulseRingRef} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.9, 1.2, 32]} />
                <meshBasicMaterial
                  color="#FF4D5A"
                  side={THREE.DoubleSide}
                  transparent
                  opacity={0.8}
                />
              </mesh>

              {/* Red Warning Core */}
              <mesh ref={faultMeshRef} castShadow>
                <boxGeometry args={[0.9, 0.9, 0.9]} />
                <meshStandardMaterial
                  color="#FF4D5A"
                  emissive="#FF4D5A"
                  emissiveIntensity={2.5}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>

              {/* Vertical Warning Light Beacon */}
              <mesh ref={beaconRef} position={[0, 1.8, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
                <meshBasicMaterial color="#FF4D5A" transparent opacity={0.7} />
              </mesh>

              <pointLight color="#FF4D5A" intensity={5} distance={6} decay={2} />

              {/* Billboard Alert Tag */}
              <Html distanceFactor={11} position={[0, 1.2, 0]} center>
                <div className="px-3 py-1.5 rounded-xl bg-[#05080D]/95 border-2 border-[#FF4D5A] text-xs font-mono shadow-2xl shadow-[#FF4D5A]/40 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-[#FF4D5A] font-black">
                    <span className="w-2 h-2 rounded-full bg-[#FF4D5A] animate-ping" />
                    <span>FAULT IDENTIFIED: {node.id}</span>
                  </div>
                  <div className="text-[10px] text-[#A2ACBA] mt-0.5">{faultType}</div>
                </div>
              </Html>
            </group>
          );
        }

        // Healthy / Adjacent Nodes
        return (
          <group key={node.id} position={node.pos}>
            <mesh castShadow>
              <boxGeometry args={[0.6, 0.6, 0.6]} />
              <meshStandardMaterial
                color={node.color}
                emissive={node.color}
                emissiveIntensity={0.8}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            <Html distanceFactor={12} position={[0, 0.7, 0]} center>
              <div className="px-2 py-0.5 rounded-md bg-[#080B10]/90 border border-white/10 text-[10px] font-mono whitespace-nowrap text-[#F4F6FA]">
                <div className="flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: node.color }}
                  />
                  <span>{node.id}</span>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export function DiagnosisFault3D({
  faultyNodeId = 'SW-DIST-01',
  faultType = 'Buffer Congestion & Queue Tail Drops',
}: DiagnosisFault3DProps) {
  return (
    <div className="w-full h-[520px] relative rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
      <Canvas
        camera={{ position: [0, 4.5, 7.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />

        <FaultScene faultyNodeId={faultyNodeId} faultType={faultType} />

        <OrbitControls
          enableZoom={true}
          minDistance={4}
          maxDistance={12}
          maxPolarAngle={Math.PI / 2.05}
          autoRotate={false}
        />
      </Canvas>

      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-[#080B10]/85 backdrop-blur-md border border-white/10 text-[11px] font-mono text-[#FF4D5A] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#FF4D5A] animate-ping" />
        3D Blast Radius &amp; Fault Domain Isolation
      </div>
    </div>
  );
}
