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

interface NetworkDevice3DProps {
  device: DeviceNodeData;
  isSelected: boolean;
  onSelect: (dev: DeviceNodeData) => void;
  reducedMotion?: boolean;
}

export function NetworkDevice3D({
  device,
  isSelected,
  onSelect,
  reducedMotion = false,
}: NetworkDevice3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wifiRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const statusColor =
    device.status === 'healthy'
      ? '#10B981'
      : device.status === 'online'
      ? '#10B981'
      : device.status === 'degraded'
      ? '#FFB347'
      : '#FF4D4D';

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle idle bobbing
      groupRef.current.position.y = device.position[1] + Math.sin(t * 1.5 + device.position[0]) * 0.03;
    }
    // Animate Wi-Fi wave pulses
    if (wifiRef.current) {
      wifiRef.current.children.forEach((child, idx) => {
        const mesh = child as THREE.Mesh;
        const scale = 1 + ((t * 1.5 + idx * 0.4) % 1) * 0.4;
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
        onSelect(device);
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
      {/* ACCESS POINT: Dome + 3 Glowing Purple Wi-Fi Wave Rings */}
      {device.type === 'ap' ? (
        <group>
          {/* AP Base Chassis */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.3, 0.35, 0.1, 24]} />
            <meshStandardMaterial
              color="#191C26"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Glowing Green/Cyan Status Ring */}
          <mesh position={[0, -0.1, 0]}>
            <torusGeometry args={[0.31, 0.02, 16, 32]} />
            <meshBasicMaterial color={statusColor} />
          </mesh>

          {/* Wi-Fi Wave Rings (Concentric Violet Arcs Radiating Upward) */}
          <group ref={wifiRef} position={[0, 0.05, 0]}>
            <mesh rotation={[-Math.PI / 4, 0, 0]}>
              <torusGeometry args={[0.2, 0.018, 12, 24, Math.PI]} />
              <meshBasicMaterial color="#A855F7" transparent opacity={0.85} />
            </mesh>
            <mesh position={[0, 0.12, -0.06]} rotation={[-Math.PI / 4, 0, 0]}>
              <torusGeometry args={[0.32, 0.016, 12, 24, Math.PI]} />
              <meshBasicMaterial color="#A855F7" transparent opacity={0.65} />
            </mesh>
            <mesh position={[0, 0.24, -0.12]} rotation={[-Math.PI / 4, 0, 0]}>
              <torusGeometry args={[0.44, 0.014, 12, 24, Math.PI]} />
              <meshBasicMaterial color="#A855F7" transparent opacity={0.45} />
            </mesh>
          </group>
        </group>
      ) : (
        /* RACK SWITCH / ROUTER CHASSIS */
        <group>
          {/* Device Box (2-Unit Chassis) */}
          <mesh position={[0, -0.1, 0]} castShadow>
            <boxGeometry args={[0.7, 0.28, 0.7]} />
            <meshStandardMaterial
              color={isSelected ? '#202434' : hovered ? '#1B1E2B' : '#141722'}
              metalness={0.85}
              roughness={0.25}
            />
          </mesh>

          {/* Front Bezel Faceplate with Port Rows */}
          <mesh position={[0, -0.1, 0.355]}>
            <planeGeometry args={[0.66, 0.22]} />
            <meshStandardMaterial color="#0A0C12" roughness={0.5} />
          </mesh>

          {/* Glowing LED status line */}
          <mesh position={[0, -0.02, 0.356]}>
            <planeGeometry args={[0.55, 0.03]} />
            <meshBasicMaterial color={statusColor} />
          </mesh>

          {/* Port indicator dots */}
          {[-0.22, -0.11, 0, 0.11, 0.22].map((x, i) => (
            <mesh key={i} position={[x, -0.14, 0.357]}>
              <planeGeometry args={[0.04, 0.04]} />
              <meshBasicMaterial color={i % 2 === 0 ? '#38D9FF' : '#FF7A18'} />
            </mesh>
          ))}

          {/* Edge Glow Outline when selected or hovered */}
          {(isSelected || hovered) && (
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[0.74, 0.32, 0.74]} />
              <meshBasicMaterial
                color={statusColor}
                wireframe
                transparent
                opacity={0.7}
              />
            </mesh>
          )}
        </group>
      )}

      {/* HTML Status Badge Label (Exact match to reference screenshots) */}
      <Html
        position={[0, 0.35, 0]}
        center
        distanceFactor={9}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'rgba(8, 9, 13, 0.88)',
            border: `1px solid ${statusColor}60`,
            boxShadow: `0 0 10px ${statusColor}30`,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
            fontSize: '11px',
            fontWeight: 600,
            color: '#F5F5F7',
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
