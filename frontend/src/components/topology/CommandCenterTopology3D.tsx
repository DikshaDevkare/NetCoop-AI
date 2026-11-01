import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import type { DeviceItem } from '../../types/api';
import { CAMPUS_NODES } from '../../utils/mockTopology';
import { useDashboardStore } from '../../store/useDashboardStore';

interface CommandCenterTopology3DProps {
  onSelectDevice?: (device: DeviceItem) => void;
  selectedDeviceId?: string | null;
}

// Circular Spatial Positioning for Command Center Architecture
const COMMAND_CENTER_POSITIONS: Record<string, [number, number, number]> = {
  'RTR-CORE-01': [0, 0.4, 0], // Center hub elevated
  'RTR-BORDER-01': [2.8, 0.8, -1.8],
  'SW-DIST-01': [-3.0, 0.2, 1.4],
  'SW-DIST-02': [3.0, 0.1, 1.5],
  'SRV-DNS-01': [0, 0.2, -3.2],
  'SW-ACCESS-01': [-4.8, -0.6, 2.2],
  'SW-ACCESS-02': [4.8, -0.6, 2.2],
  'AP-LIB-01': [-2.2, -0.8, 3.6],
  'AP-DORM-01': [2.2, -0.8, 3.6],
};

function CommandScene({
  onSelectDevice,
  selectedDeviceId,
}: {
  onSelectDevice?: (device: DeviceItem) => void;
  selectedDeviceId?: string | null;
}) {
  const { topologySettings, devices } = useDashboardStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Rotating energy rings
  const platformRingsRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const midRingRef = useRef<THREE.Mesh>(null);

  // Merge backend devices with spatial coordinates
  const spatialNodes = useMemo(() => {
    return CAMPUS_NODES.map((mockNode) => {
      const liveDev = devices.find((d) => d.device_id === mockNode.id);
      const position = COMMAND_CENTER_POSITIONS[mockNode.id] || mockNode.position;
      return {
        ...mockNode,
        ...liveDev,
        position,
      };
    }).filter((node) => {
      if (
        topologySettings.filterType !== 'all' &&
        node.type !== topologySettings.filterType
      ) {
        return false;
      }
      if (
        topologySettings.filterStatus !== 'all' &&
        node.status !== topologySettings.filterStatus
      ) {
        return false;
      }
      return true;
    });
  }, [devices, topologySettings.filterType, topologySettings.filterStatus]);

  // Connection Arcs between nodes
  const connectionCurves = useMemo(() => {
    const curves: {
      id: string;
      curve: THREE.QuadraticBezierCurve3;
      fromNode: (typeof spatialNodes)[0];
      toNode: (typeof spatialNodes)[0];
    }[] = [];

    const map = new Map(spatialNodes.map((n) => [n.id, n]));

    spatialNodes.forEach((source) => {
      source.connectedTo.forEach((targetId) => {
        const target = map.get(targetId);
        if (target && source.id < target.id) {
          const p1 = new THREE.Vector3(...source.position);
          const p2 = new THREE.Vector3(...target.position);
          const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
          mid.y += 0.8; // Arch upward for volumetric fiber conduit feel

          curves.push({
            id: `${source.id}-${target.id}`,
            curve: new THREE.QuadraticBezierCurve3(p1, mid, p2),
            fromNode: source,
            toNode: target,
          });
        }
      });
    });

    return curves;
  }, [spatialNodes]);

  const packetMeshes = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (platformRingsRef.current) {
      platformRingsRef.current.rotation.y = time * 0.15;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = -time * 0.1;
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.z = time * 0.2;
    }

    // Animate traveling packet particles along connections
    if (topologySettings.animatePackets) {
      connectionCurves.forEach((item, idx) => {
        const mesh = packetMeshes.current[idx];
        if (mesh) {
          const t = (time * 0.45 + idx * 0.2) % 1;
          const p = item.curve.getPoint(t);
          mesh.position.set(p.x, p.y, p.z);
        }
      });
    }
  });

  return (
    <>
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        maxDistance={28}
        minDistance={4}
        maxPolarAngle={Math.PI / 2 + 0.1}
      />

      {/* Cinematic Studio Lighting */}
      <ambientLight intensity={0.8} color="#0A1018" />
      <directionalLight position={[8, 12, 10]} intensity={2.0} color="#f8fafc" />
      <directionalLight position={[-8, 6, -6]} intensity={2.8} color="#FF8A24" />
      <directionalLight position={[0, -6, 6]} intensity={1.5} color="#20D9FF" />
      <pointLight position={[0, 1.2, 0]} intensity={3.5} color="#FF8A24" distance={8} />

      {/* --- CENTRAL GLOWING ORANGE ENERGY PLATFORM --- */}
      <group position={[0, -1.2, 0]} ref={platformRingsRef}>
        {/* Outer Circular Energy Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} ref={outerRingRef}>
          <ringGeometry args={[5.2, 5.4, 64]} />
          <meshStandardMaterial
            color="#FF8A24"
            emissive="#FF8A24"
            emissiveIntensity={2.5}
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Middle Cyan Data Orbit Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} ref={midRingRef}>
          <ringGeometry args={[3.8, 3.95, 64]} />
          <meshStandardMaterial
            color="#20D9FF"
            emissive="#20D9FF"
            emissiveIntensity={2.5}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Center Core Platform Hub */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[2.0, 2.2, 0.2, 48]} />
          <meshStandardMaterial color="#0A1018" metalness={0.92} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.8, 48]} />
          <meshStandardMaterial
            color="#FF8A24"
            emissive="#FF8A24"
            emissiveIntensity={3.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Tech Grid Floor */}
      <gridHelper args={[26, 26, '#FF8A24', '#162232']} position={[0, -1.3, 0]} />

      {/* --- GLOWING FIBER CONNECTIONS --- */}
      {connectionCurves.map((item) => {
        const points = item.curve.getPoints(28);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const isRelated =
          selectedDeviceId &&
          (item.fromNode.id === selectedDeviceId || item.toNode.id === selectedDeviceId);
        const isCritical =
          item.fromNode.status === 'critical' || item.toNode.status === 'critical';
        const isWarning =
          item.fromNode.status === 'warning' || item.toNode.status === 'warning';

        let color = '#20D9FF';
        let opacity = 0.4;
        if (isCritical) {
          color = '#FF4D5A';
          opacity = 0.85;
        } else if (isWarning) {
          color = '#FFB547';
          opacity = 0.65;
        } else if (isRelated) {
          color = '#FF8A24';
          opacity = 0.95;
        }

        return (
          <primitive
            key={item.id}
            object={
              new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({
                  color,
                  transparent: true,
                  opacity,
                  linewidth: isRelated ? 2 : 1,
                })
              )
            }
          />
        );
      })}

      {/* --- ANIMATED DATA PACKETS --- */}
      {topologySettings.animatePackets &&
        connectionCurves.map((item, idx) => {
          const packetColor =
            item.fromNode.status === 'critical' || item.toNode.status === 'critical'
              ? '#FF4D5A'
              : '#20D9FF';

          return (
            <mesh
              key={`pkt-${item.id}`}
              ref={(el) => {
                packetMeshes.current[idx] = el;
              }}
            >
              <sphereGeometry args={[0.075, 12, 12]} />
              <meshBasicMaterial color={packetColor} />
            </mesh>
          );
        })}

      {/* --- HARDWARE DEVICES IN SPATIAL MESH --- */}
      {spatialNodes.map((node) => {
        const isSelected = selectedDeviceId === node.id;
        const isHovered = hoveredId === node.id;
        const isCore = node.id === 'RTR-CORE-01';
        const scale = isSelected ? 1.45 : isHovered ? 1.3 : isCore ? 1.35 : 1.1;

        let statusColor = '#26D7A0';
        if (node.status === 'warning') statusColor = '#FFB547';
        if (node.status === 'critical') statusColor = '#FF4D5A';

        return (
          <group
            key={node.id}
            position={node.position}
            scale={[scale, scale, scale]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectDevice?.(node as any);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredId(node.id);
            }}
            onPointerOut={() => setHoveredId(null)}
          >
            {/* Halo pulse */}
            {(isSelected || node.status === 'critical') && (
              <mesh>
                <sphereGeometry args={[0.6, 16, 16]} />
                <meshBasicMaterial
                  color={statusColor}
                  wireframe
                  transparent
                  opacity={0.35}
                />
              </mesh>
            )}

            {/* Router Hardware Geometry */}
            {node.type === 'router' && (
              <group>
                <mesh castShadow>
                  <octahedronGeometry args={[isCore ? 0.44 : 0.38, 0]} />
                  <meshStandardMaterial
                    color="#e2e8f0"
                    metalness={0.94}
                    roughness={0.16}
                  />
                </mesh>
                <mesh>
                  <sphereGeometry args={[isCore ? 0.22 : 0.18, 16, 16]} />
                  <meshStandardMaterial
                    color={isCore ? '#FF8A24' : statusColor}
                    emissive={isCore ? '#FF8A24' : statusColor}
                    emissiveIntensity={isSelected ? 3.5 : 2.5}
                  />
                </mesh>
                {/* Glowing Orange N Logo atop Core Router */}
                {isCore && (
                  <group position={[0, 0.45, 0]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                      <ringGeometry args={[0.22, 0.28, 32]} />
                      <meshStandardMaterial
                        color="#FF8A24"
                        emissive="#FF8A24"
                        emissiveIntensity={3.2}
                        side={THREE.DoubleSide}
                      />
                    </mesh>
                  </group>
                )}
              </group>
            )}

            {/* Switch Chassis Geometry with LEDs */}
            {node.type === 'switch' && (
              <group>
                <mesh castShadow>
                  <boxGeometry args={[0.65, 0.32, 0.5]} />
                  <meshStandardMaterial
                    color="#101A25"
                    metalness={0.88}
                    roughness={0.25}
                  />
                </mesh>
                {/* Front Port Status Bar */}
                <mesh position={[0, 0, 0.26]}>
                  <boxGeometry args={[0.58, 0.22, 0.02]} />
                  <meshStandardMaterial
                    color={statusColor}
                    emissive={statusColor}
                    emissiveIntensity={isSelected ? 3.2 : 2.0}
                  />
                </mesh>
              </group>
            )}

            {/* Server Rack Unit Geometry */}
            {node.type === 'server' && (
              <group>
                <mesh castShadow>
                  <boxGeometry args={[0.42, 0.75, 0.42]} />
                  <meshStandardMaterial
                    color="#141B25"
                    metalness={0.9}
                    roughness={0.2}
                  />
                </mesh>
                <mesh position={[0, 0, 0.22]}>
                  <boxGeometry args={[0.34, 0.65, 0.02]} />
                  <meshStandardMaterial
                    color={statusColor}
                    emissive={statusColor}
                    emissiveIntensity={isSelected ? 3.0 : 1.8}
                  />
                </mesh>
              </group>
            )}

            {/* Wireless Access Point Geometry */}
            {node.type === 'access_point' && (
              <group>
                <mesh castShadow>
                  <coneGeometry args={[0.34, 0.45, 16]} />
                  <meshStandardMaterial
                    color="#d8e2ec"
                    metalness={0.88}
                    roughness={0.2}
                  />
                </mesh>
                <mesh position={[0, 0.26, 0]}>
                  <sphereGeometry args={[0.1, 12, 12]} />
                  <meshStandardMaterial
                    color={statusColor}
                    emissive={statusColor}
                    emissiveIntensity={isSelected ? 3.5 : 2.2}
                  />
                </mesh>
              </group>
            )}

            {/* Labels Billboard */}
            {topologySettings.showLabels && (
              <Html distanceFactor={14} position={[0, 0.6, 0]} center>
                <div
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono whitespace-nowrap backdrop-blur-md border shadow-xl transition-all ${
                    isSelected
                      ? 'bg-[#FF8A24] text-[#05080D] font-bold border-[#FF8A24]'
                      : 'bg-[#0A1018]/90 text-[#F4F6FA] border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: statusColor }}
                    />
                    <span>{node.id}</span>
                  </div>
                  <span className="text-[8px] text-[#A2ACBA] block">{node.ip}</span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}

export function CommandCenterTopology3D({
  onSelectDevice,
  selectedDeviceId,
}: CommandCenterTopology3DProps) {
  return (
    <div className="w-full h-full min-h-[580px] relative rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
      <Canvas
        camera={{ position: [0, 5.5, 10.5], fov: 46 }}
        gl={{ antialias: true, alpha: true }}
      >
        <CommandScene
          onSelectDevice={onSelectDevice}
          selectedDeviceId={selectedDeviceId}
        />
      </Canvas>
    </div>
  );
}
