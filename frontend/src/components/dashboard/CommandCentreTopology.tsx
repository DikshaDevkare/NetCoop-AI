import { useState, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import { NetworkHub3D } from '../three/NetworkHub3D.tsx';
import { NetworkDevice3D, type DeviceNodeData } from '../three/NetworkDevice3D.tsx';

interface CommandCentreTopologyProps {
  onNodeSelect?: (nodeName: string) => void;
}

const TOPOLOGY_DEVICES: DeviceNodeData[] = [
  {
    id: 'core-switch-left',
    name: 'Core Switch HQ-01',
    type: 'switch',
    status: 'healthy',
    position: [-2.6, 0.1, 0.6],
    badge: 'Core Switch • Healthy',
    ip: '10.254.1.1',
    throughput: '420 Gbps',
  },
  {
    id: 'edge-switch-front',
    name: 'Edge Switch SW-02',
    type: 'switch',
    status: 'healthy',
    position: [-1.4, -0.1, 2.3],
    badge: 'Edge Switch • Healthy',
    ip: '10.254.1.2',
    throughput: '280 Gbps',
  },
  {
    id: 'branch-router-front',
    name: 'Branch Router 01',
    type: 'router',
    status: 'degraded',
    position: [1.2, -0.1, 2.3],
    badge: 'Branch Router • Degraded',
    ip: '10.20.14.254',
    throughput: '92% Saturated',
  },
  {
    id: 'access-point-right',
    name: 'Access Point HQ-East',
    type: 'ap',
    status: 'online',
    position: [2.6, 0.2, 0.6],
    badge: 'Access Point • Online',
    ip: '10.30.5.1',
    throughput: '1.2 Gbps Wi-Fi 6',
  },
];

// Glowing Circuit Traces connecting each device to the central hub
function CircuitBuses() {
  return (
    <group position={[0, -0.4, 0]}>
      {TOPOLOGY_DEVICES.map((dev) => {
        const points = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(dev.position[0] * 0.5, 0, dev.position[2] * 0.5),
          new THREE.Vector3(dev.position[0], 0, dev.position[2]),
        ];
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);

        return (
          <group key={dev.id}>
            {/* Outer Glow Tube */}
            <mesh geometry={tubeGeom}>
              <meshBasicMaterial
                color={dev.status === 'degraded' ? '#FFB347' : '#FF7A18'}
                transparent
                opacity={0.8}
              />
            </mesh>
            {/* Point on floor beneath device */}
            <mesh position={[dev.position[0], 0, dev.position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.45, 24]} />
              <meshBasicMaterial
                color={dev.status === 'degraded' ? '#FFB347' : '#FF7A18'}
                transparent
                opacity={0.15}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function CommandCentreTopology({ onNodeSelect }: CommandCentreTopologyProps) {
  const reducedMotion = useReducedMotion();
  const [selectedDevice, setSelectedDevice] = useState<DeviceNodeData | null>(null);

  const handleDeviceSelect = (dev: DeviceNodeData) => {
    setSelectedDevice(dev);
    if (onNodeSelect) onNodeSelect(dev.name);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        backgroundColor: 'rgba(10, 12, 18, 0.75)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 122, 24, 0.25)',
        boxShadow: '0 0 24px -6px rgba(255, 122, 24, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 4.2, 5.8], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[6, 8, 5]} intensity={1.2} color="#FFFFFF" />
        <pointLight position={[0, 1.5, 0]} intensity={2.5} color="#FF7A18" distance={10} />
        <pointLight position={[-3, 2, 2]} intensity={1.0} color="#38D9FF" distance={8} />
        <pointLight position={[3, 2, 2]} intensity={1.0} color="#A855F7" distance={8} />

        {/* Perspective Cyber Grid Floor */}
        <gridHelper
          args={[14, 28, '#FF7A18', '#1A1D2B']}
          position={[0, -0.42, 0]}
        />

        <Suspense fallback={null}>
          {/* Central Elevated Hub */}
          <NetworkHub3D reducedMotion={reducedMotion} />

          {/* Connected Circuit Lines */}
          <CircuitBuses />

          {/* Surrounding Network Devices */}
          {TOPOLOGY_DEVICES.map((device) => (
            <NetworkDevice3D
              key={device.id}
              device={device}
              isSelected={selectedDevice?.id === device.id}
              onSelect={handleDeviceSelect}
              reducedMotion={reducedMotion}
            />
          ))}
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 4}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.4}
        />
      </Canvas>

      {/* Selected Node Mini HUD overlay */}
      {selectedDevice && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(10, 12, 18, 0.92)',
            border: '1px solid rgba(255, 122, 24, 0.4)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#F5F5F7' }}>
              {selectedDevice.name}
            </div>
            <div style={{ fontSize: '11px', color: '#A3A6B3' }}>
              IP: {selectedDevice.ip} • {selectedDevice.throughput}
            </div>
          </div>
          <button
            onClick={() => setSelectedDevice(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6A6D7C',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '2px 4px',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
