import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import type { DeviceItem } from '../../types/api';
import { CAMPUS_NODES } from '../../utils/mockTopology';
import { useDashboardStore } from '../../store/useDashboardStore';

interface NetworkTopology3DProps {
  onSelectDevice?: (device: DeviceItem) => void;
  selectedDeviceId?: string | null;
}

// 3D Hierarchical Coordinates for Topology Nodes
const HIERARCHICAL_POSITIONS: Record<string, [number, number, number]> = {
  'RTR-CORE-01': [0, 2.5, 0],
  'RTR-BORDER-01': [3.5, 2.8, -1.0],
  'SW-DIST-01': [-3.2, 0.5, 1.2],
  'SW-DIST-02': [3.0, 0.4, 1.0],
  'SRV-DNS-01': [0, 0.2, -2.5],
  'SW-ACCESS-01': [-4.5, -1.8, 1.8],
  'SW-ACCESS-02': [4.5, -1.8, 1.6],
  'AP-LIB-01': [-2.0, -2.0, 2.8],
  'AP-DORM-01': [2.2, -2.2, 2.6],
};

function TopologyScene({
  onSelectDevice,
  selectedDeviceId,
}: {
  onSelectDevice?: (device: DeviceItem) => void;
  selectedDeviceId?: string | null;
}) {
  const { topologySettings, devices } = useDashboardStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  // Merge backend devices with spatial coordinates
  const spatialNodes = useMemo(() => {
    return CAMPUS_NODES.map((mockNode) => {
      const liveDev = devices.find((d) => d.device_id === mockNode.id);
      const position = HIERARCHICAL_POSITIONS[mockNode.id] || mockNode.position;
      return {
        ...mockNode,
        ...liveDev,
        position,
      };
    }).filter((node) => {
      // Apply filters
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
          // Arch upward in Y
          mid.y += 0.6;

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

    // Animate traveling packet particles along connections
    if (topologySettings.animatePackets) {
      connectionCurves.forEach((item, idx) => {
        const mesh = packetMeshes.current[idx];
        if (mesh) {
          const t = (time * 0.4 + idx * 0.22) % 1;
          const p = item.curve.getPoint(t);
          mesh.position.set(p.x, p.y, p.z);
        }
      });
    }
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        maxDistance={25}
        minDistance={3}
      />

      <ambientLight intensity={0.8} color="#0f172a" />
      <directionalLight position={[6, 10, 8]} intensity={1.6} color="#f8fafc" />
      <directionalLight position={[-6, -4, -6]} intensity={2.0} color="#FF8A24" />
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#20D9FF" />

      {/* Grid Floor for spatial perspective */}
      <gridHelper args={[24, 24, '#FF8A24', '#1e293b']} position={[0, -3.2, 0]} />

      {/* --- CONNECTION ARCS --- */}
      {connectionCurves.map((item) => {
        const points = item.curve.getPoints(24);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const isRelated =
          selectedDeviceId &&
          (item.fromNode.id === selectedDeviceId || item.toNode.id === selectedDeviceId);
        const isCritical =
          item.fromNode.status === 'critical' || item.toNode.status === 'critical';
        const isWarning =
          item.fromNode.status === 'warning' || item.toNode.status === 'warning';

        let color = '#20D9FF';
        let opacity = 0.35;
        if (isCritical) {
          color = '#FF4D5A';
          opacity = 0.8;
        } else if (isWarning) {
          color = '#FFB547';
          opacity = 0.6;
        } else if (isRelated) {
          color = '#FF8A24';
          opacity = 0.9;
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

      {/* --- TRAVELING DATA PACKETS --- */}
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
              <sphereGeometry args={[0.065, 8, 8]} />
              <meshBasicMaterial color={packetColor} />
            </mesh>
          );
        })}

      {/* --- SPATIAL HARDWARE NODES --- */}
      {spatialNodes.map((node) => {
        const isSelected = selectedDeviceId === node.id;
        const isHovered = hoveredId === node.id;
        const scale = isSelected ? 1.4 : isHovered ? 1.2 : 1.0;

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
            {/* Halo pulse for selected or critical nodes */}
            {(isSelected || node.status === 'critical') && (
              <mesh>
                <sphereGeometry args={[0.55, 16, 16]} />
                <meshBasicMaterial
                  color={statusColor}
                  wireframe
                  transparent
                  opacity={0.3}
                />
              </mesh>
            )}

            {/* Custom 3D Shape by Device Type */}
            {node.type === 'router' && (
              <mesh castShadow>
                <octahedronGeometry args={[0.32, 0]} />
                <meshStandardMaterial
                  color={statusColor}
                  emissive={statusColor}
                  emissiveIntensity={isSelected ? 3.0 : 1.5}
                  metalness={0.9}
                  roughness={0.2}
                />
              </mesh>
            )}

            {node.type === 'switch' && (
              <group>
                <mesh castShadow>
                  <boxGeometry args={[0.55, 0.28, 0.45]} />
                  <meshStandardMaterial
                    color="#141B25"
                    metalness={0.8}
                    roughness={0.3}
                  />
                </mesh>
                <mesh position={[0, 0, 0.24]}>
                  <boxGeometry args={[0.5, 0.22, 0.02]} />
                  <meshStandardMaterial
                    color={statusColor}
                    emissive={statusColor}
                    emissiveIntensity={isSelected ? 3.0 : 1.8}
                  />
                </mesh>
              </group>
            )}

            {node.type === 'server' && (
              <mesh castShadow>
                <boxGeometry args={[0.35, 0.65, 0.35]} />
                <meshStandardMaterial
                  color={statusColor}
                  emissive={statusColor}
                  emissiveIntensity={isSelected ? 3.0 : 1.6}
                  metalness={0.9}
                  roughness={0.15}
                />
              </mesh>
            )}

            {node.type === 'access_point' && (
              <group>
                <mesh castShadow>
                  <coneGeometry args={[0.3, 0.4, 16]} />
                  <meshStandardMaterial
                    color={statusColor}
                    emissive={statusColor}
                    emissiveIntensity={isSelected ? 3.0 : 1.8}
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>
                <mesh position={[0, 0.22, 0]}>
                  <sphereGeometry args={[0.08, 8, 8]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
            )}

            {/* Device Label Billboard */}
            {topologySettings.showLabels && (
              <Html distanceFactor={14} position={[0, 0.55, 0]} center>
                <div
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono whitespace-nowrap backdrop-blur-md border shadow-lg transition-all ${
                    isSelected
                      ? 'bg-[#FF8A24] text-[#080B10] font-bold border-[#FF8A24]'
                      : 'bg-[#10151D]/90 text-[#F4F6FA] border-white/10'
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

export function NetworkTopology3D({
  onSelectDevice,
  selectedDeviceId,
}: NetworkTopology3DProps) {
  return (
    <div className="w-full h-full min-h-[550px] relative rounded-3xl overflow-hidden glass-panel border border-white/10">
      <Canvas
        camera={{ position: [0, 4, 11], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <TopologyScene
          onSelectDevice={onSelectDevice}
          selectedDeviceId={selectedDeviceId}
        />
      </Canvas>
    </div>
  );
}
