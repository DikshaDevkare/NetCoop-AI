import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export interface DeviceNodeData {
  id: string;
  name: string;
  type: 'core' | 'switch' | 'router' | 'ap';
  status: 'healthy' | 'degraded' | 'online' | 'affected';
  position: [number, number, number];
  badge: string;
  ip: string;
  throughput: string;
}

interface NetworkDeviceMeshProps {
  device: DeviceNodeData;
  isSelected?: boolean;
  onSelect?: (dev: DeviceNodeData) => void;
  reducedMotion?: boolean;
}

export function NetworkDeviceMesh({
  device,
  isSelected = false,
  onSelect,
  reducedMotion = false,
}: NetworkDeviceMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wifiRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const statusColor =
    device.status === 'healthy' || device.status === 'online'
      ? '#21D69A'
      : device.status === 'degraded'
      ? '#FF9A24'
      : '#F05252';

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y =
        device.position[1] + Math.sin(t * 1.6 + device.position[0]) * 0.035;
    }
    // Access Point Wi-Fi waves pulse
    if (wifiRef.current) {
      wifiRef.current.children.forEach((child, idx) => {
        const mesh = child as THREE.Mesh;
        const scale = 1 + ((t * 1.6 + idx * 0.4) % 1) * 0.45;
        mesh.scale.set(scale, scale, scale);
      });
    }
  });

  return (
    <group
      ref={groupRef}
      position={device.position}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(device);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* ACCESS POINT: Dome + 3 Glowing Purple Concentric Wi-Fi Wave Rings */}
      {device.type === 'ap' ? (
        <group>
          {/* AP Base Chassis */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.3, 0.36, 0.1, 24]} />
            <meshStandardMaterial color="#151722" metalness={0.85} roughness={0.2} />
          </mesh>

          {/* Glowing Status Ring on chassis */}
          <mesh position={[0, -0.1, 0]}>
            <torusGeometry args={[0.31, 0.02, 16, 32]} />
            <meshBasicMaterial color={statusColor} />
          </mesh>

          {/* Wi-Fi Wave Rings (Concentric Violet Arcs Radiating Upward) */}
          <group ref={wifiRef} position={[0, 0.06, 0]}>
            <mesh rotation={[-Math.PI / 4, 0, 0]}>
              <torusGeometry args={[0.2, 0.018, 12, 24, Math.PI]} />
              <meshBasicMaterial color="#9A45FF" transparent opacity={0.9} />
            </mesh>
            <mesh position={[0, 0.12, -0.06]} rotation={[-Math.PI / 4, 0, 0]}>
              <torusGeometry args={[0.32, 0.016, 12, 24, Math.PI]} />
              <meshBasicMaterial color="#9A45FF" transparent opacity={0.65} />
            </mesh>
            <mesh position={[0, 0.24, -0.12]} rotation={[-Math.PI / 4, 0, 0]}>
              <torusGeometry args={[0.44, 0.014, 12, 24, Math.PI]} />
              <meshBasicMaterial color="#9A45FF" transparent opacity={0.45} />
            </mesh>
          </group>
        </group>
      ) : (
        /* RACK SWITCH / ROUTER 3D HARDWARE CHASSIS */
        <group>
          {/* Metallic 2U Chassis Box */}
          <mesh position={[0, -0.1, 0]} castShadow>
            <boxGeometry args={[0.7, 0.28, 0.7]} />
            <meshStandardMaterial
              color={isSelected ? '#1A1D2B' : hovered ? '#151722' : '#11131C'}
              metalness={0.88}
              roughness={0.22}
            />
          </mesh>

          {/* Front Faceplate Bezel */}
          <mesh position={[0, -0.1, 0.355]}>
            <planeGeometry args={[0.66, 0.22]} />
            <meshStandardMaterial color="#08090D" roughness={0.4} />
          </mesh>

          {/* Status LED line */}
          <mesh position={[0, -0.02, 0.356]}>
            <planeGeometry args={[0.55, 0.03]} />
            <meshBasicMaterial color={statusColor} />
          </mesh>

          {/* Port LED Activity indicators */}
          {[-0.22, -0.11, 0, 0.11, 0.22].map((x, i) => (
            <mesh key={i} position={[x, -0.14, 0.357]}>
              <planeGeometry args={[0.04, 0.04]} />
              <meshBasicMaterial color={i % 2 === 0 ? '#36CBE8' : '#FF9A24'} />
            </mesh>
          ))}

          {/* Selective Highlight Wireframe on hover/selection */}
          {(isSelected || hovered) && (
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[0.74, 0.32, 0.74]} />
              <meshBasicMaterial
                color={statusColor}
                wireframe
                transparent
                opacity={0.75}
              />
            </mesh>
          )}
        </group>
      )}

      {/* HTML Status Badge Label (Exact match to reference screenshots) */}
      <Html position={[0, 0.36, 0]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'rgba(8, 9, 13, 0.92)',
            border: `1px solid ${statusColor}70`,
            boxShadow: `0 0 10px ${statusColor}30`,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
            fontSize: '11px',
            fontWeight: 600,
            color: '#F4F4F7',
            transition: 'all 0.2s ease',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: statusColor,
              boxShadow: `0 0 6px ${statusColor}`,
            }}
          />
          <span>{device.badge}</span>
        </div>
      </Html>
    </group>
  );
}

// Re-export alias for compatibility
export { NetworkDeviceMesh as NetworkDevice3D };
