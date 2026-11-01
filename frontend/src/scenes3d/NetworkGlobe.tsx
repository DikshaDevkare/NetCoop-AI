import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CAMPUS_NODES } from '../utils/mockTopology';
import type { NetworkNode } from '../types';

interface NetworkGlobeProps {
  onSelectNode?: (node: NetworkNode) => void;
  selectedNodeId?: string | null;
  interactive?: boolean;
}

export function NetworkGlobe({
  onSelectNode,
  selectedNodeId,
  interactive = true,
}: NetworkGlobeProps) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const innerSphereRef = useRef<THREE.Mesh>(null);
  const outerSphereRef = useRef<THREE.Mesh>(null);
  const orbitRing1Ref = useRef<THREE.Mesh>(null);
  const orbitRing2Ref = useRef<THREE.Mesh>(null);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Drag interaction state
  const isDragging = useRef(false);
  const previousPointerPosition = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0.003 });

  // Map 3D positions onto sphere surface radius R = 2.4
  const sphereRadius = 2.4;
  const nodesWithSpherePositions = useMemo(() => {
    return CAMPUS_NODES.map((node) => {
      const vec = new THREE.Vector3(...node.position).normalize().multiplyScalar(sphereRadius);
      return {
        ...node,
        spherePos: [vec.x, vec.y, vec.z] as [number, number, number],
      };
    });
  }, []);

  // Compute Bezier curves connecting related nodes
  const connectionCurves = useMemo(() => {
    const curves: {
      id: string;
      curve: THREE.QuadraticBezierCurve3;
      fromNode: (typeof nodesWithSpherePositions)[0];
      toNode: (typeof nodesWithSpherePositions)[0];
    }[] = [];

    const nodeMap = new Map(nodesWithSpherePositions.map((n) => [n.id, n]));

    nodesWithSpherePositions.forEach((source) => {
      source.connectedTo.forEach((targetId) => {
        const target = nodeMap.get(targetId);
        if (target && source.id < target.id) {
          // Avoid duplicate lines
          const p1 = new THREE.Vector3(...source.spherePos);
          const p2 = new THREE.Vector3(...target.spherePos);

          // Control point pulled outwards for arching arc
          const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
          const dist = p1.distanceTo(p2);
          mid.normalize().multiplyScalar(sphereRadius + dist * 0.25);

          const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
          curves.push({
            id: `${source.id}-${target.id}`,
            curve,
            fromNode: source,
            toNode: target,
          });
        }
      });
    });

    return curves;
  }, [nodesWithSpherePositions]);

  // Packets traveling along connection curves
  const packetMeshes = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (globeGroupRef.current) {
      if (!isDragging.current) {
        // Continuous gentle rotation with damping
        globeGroupRef.current.rotation.y += rotationVelocity.current.y;
        globeGroupRef.current.rotation.x += rotationVelocity.current.x;

        // Dampen manual drag spin back to default
        rotationVelocity.current.y = THREE.MathUtils.lerp(rotationVelocity.current.y, 0.0025, 0.03);
        rotationVelocity.current.x = THREE.MathUtils.lerp(rotationVelocity.current.x, 0, 0.03);
      }
    }

    // Inner wireframe sphere subtle pulse
    if (innerSphereRef.current) {
      innerSphereRef.current.rotation.y = time * 0.05;
    }

    // Translucent outer holographic shell
    if (outerSphereRef.current) {
      outerSphereRef.current.rotation.y = -time * 0.03;
    }

    // Orbital rings counter-rotation
    if (orbitRing1Ref.current) {
      orbitRing1Ref.current.rotation.z = time * 0.15;
    }
    if (orbitRing2Ref.current) {
      orbitRing2Ref.current.rotation.x = time * 0.12;
    }

    // Animate data packets along curves
    connectionCurves.forEach((item, idx) => {
      const mesh = packetMeshes.current[idx];
      if (mesh) {
        // Stagger packet phases by index
        const t = (time * 0.35 + idx * 0.17) % 1;
        const point = item.curve.getPoint(t);
        mesh.position.set(point.x, point.y, point.z);
      }
    });
  });

  // Pointer drag handlers on globe group
  const handlePointerDown = (e: any) => {
    if (!interactive) return;
    e.stopPropagation();
    isDragging.current = true;
    previousPointerPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging.current || !interactive || !globeGroupRef.current) return;
    const deltaX = e.clientX - previousPointerPosition.current.x;
    const deltaY = e.clientY - previousPointerPosition.current.y;

    globeGroupRef.current.rotation.y += deltaX * 0.005;
    globeGroupRef.current.rotation.x += deltaY * 0.005;

    rotationVelocity.current = {
      x: deltaY * 0.001,
      y: deltaX * 0.001,
    };

    previousPointerPosition.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <group
      ref={globeGroupRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      {/* --- CENTRAL HOLOGRAPHIC SPHERE --- */}
      {/* 1. Core Dark Tech Base */}
      <mesh>
        <sphereGeometry args={[sphereRadius * 0.94, 32, 32]} />
        <meshStandardMaterial
          color="#0b1017"
          roughness={0.7}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* 2. Digital Holographic Grid Wireframe (Electric Cyan) */}
      <mesh ref={innerSphereRef}>
        <sphereGeometry args={[sphereRadius, 24, 24]} />
        <meshBasicMaterial
          color="#20D9FF"
          wireframe
          transparent
          opacity={0.18}
        />
      </mesh>

      {/* 3. Outer Translucent Holographic Atmosphere (Soft Orange Rim) */}
      <mesh ref={outerSphereRef}>
        <sphereGeometry args={[sphereRadius * 1.03, 32, 32]} />
        <meshStandardMaterial
          color="#FF8A24"
          transparent
          opacity={0.06}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* --- ORBITAL RINGS --- */}
      {/* Ring 1 - Warm Orange Accent */}
      <mesh ref={orbitRing1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[sphereRadius * 1.35, 0.015, 16, 80]} />
        <meshStandardMaterial
          color="#FF8A24"
          emissive="#FF8A24"
          emissiveIntensity={2.0}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Ring 2 - Electric Cyan Orbit */}
      <mesh ref={orbitRing2Ref} rotation={[-Math.PI / 3, Math.PI / 5, 0]}>
        <torusGeometry args={[sphereRadius * 1.48, 0.012, 16, 80]} />
        <meshStandardMaterial
          color="#20D9FF"
          emissive="#20D9FF"
          emissiveIntensity={2.2}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* --- BEZIER CONNECTION ARCS --- */}
      {connectionCurves.map((item) => {
        const points = item.curve.getPoints(30);
        const isSelectedConnection =
          selectedNodeId &&
          (item.fromNode.id === selectedNodeId || item.toNode.id === selectedNodeId);
        const hasWarning =
          item.fromNode.status === 'warning' || item.toNode.status === 'warning';
        const hasCritical =
          item.fromNode.status === 'critical' || item.toNode.status === 'critical';

        let lineColor = '#20D9FF';
        let opacity = 0.35;
        if (hasCritical) {
          lineColor = '#FF4D5A';
          opacity = 0.7;
        } else if (hasWarning) {
          lineColor = '#FFB547';
          opacity = 0.6;
        } else if (isSelectedConnection) {
          lineColor = '#FF8A24';
          opacity = 0.9;
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <primitive
            key={item.id}
            object={
              new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({
                  color: lineColor,
                  transparent: true,
                  opacity: opacity,
                  linewidth: isSelectedConnection ? 2 : 1,
                })
              )
            }
          />
        );
      })}

      {/* --- DATA PACKET PARTICLES TRAVELING ON ARCS --- */}
      {connectionCurves.map((item, idx) => {
        const packetColor =
          item.fromNode.status === 'critical' || item.toNode.status === 'critical'
            ? '#FF4D5A'
            : '#20D9FF';

        return (
          <mesh
            key={`packet-${item.id}`}
            ref={(el) => {
              packetMeshes.current[idx] = el;
            }}
          >
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial
              color={packetColor}
              emissive={packetColor}
              emissiveIntensity={3.0}
            />
          </mesh>
        );
      })}

      {/* --- NETWORK NODES --- */}
      {nodesWithSpherePositions.map((node) => {
        const isHovered = hoveredNodeId === node.id;
        const isSelected = selectedNodeId === node.id;

        let statusColor = '#26D7A0'; // Healthy green
        if (node.status === 'warning') statusColor = '#FFB547'; // Warning amber
        if (node.status === 'critical') statusColor = '#FF4D5A'; // Critical red

        const nodeScale = isSelected ? 1.5 : isHovered ? 1.3 : 1.0;

        return (
          <group
            key={node.id}
            position={node.spherePos}
            scale={[nodeScale, nodeScale, nodeScale]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredNodeId(node.id);
            }}
            onPointerOut={() => setHoveredNodeId(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode?.(node);
            }}
          >
            {/* Outer Halo on hover or select */}
            {(isHovered || isSelected) && (
              <mesh>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshBasicMaterial
                  color={statusColor}
                  transparent
                  opacity={0.3}
                  wireframe
                />
              </mesh>
            )}

            {/* Node Physical Mesh by Device Type */}
            {node.type === 'router' && (
              <mesh castShadow>
                <octahedronGeometry args={[0.13]} />
                <meshStandardMaterial
                  color={statusColor}
                  emissive={statusColor}
                  emissiveIntensity={isSelected ? 3.0 : 1.5}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
            )}

            {node.type === 'switch' && (
              <mesh castShadow>
                <boxGeometry args={[0.16, 0.16, 0.16]} />
                <meshStandardMaterial
                  color={statusColor}
                  emissive={statusColor}
                  emissiveIntensity={isSelected ? 3.0 : 1.5}
                  metalness={0.85}
                  roughness={0.2}
                />
              </mesh>
            )}

            {node.type === 'access_point' && (
              <mesh castShadow>
                <cylinderGeometry args={[0.12, 0.05, 0.16, 16]} />
                <meshStandardMaterial
                  color={statusColor}
                  emissive={statusColor}
                  emissiveIntensity={isSelected ? 3.0 : 1.8}
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
            )}

            {(node.type === 'server' || node.type === 'gateway') && (
              <mesh castShadow>
                <cylinderGeometry args={[0.11, 0.11, 0.22, 16]} />
                <meshStandardMaterial
                  color={statusColor}
                  emissive={statusColor}
                  emissiveIntensity={isSelected ? 3.0 : 1.5}
                  metalness={0.9}
                  roughness={0.2}
                />
              </mesh>
            )}

            {/* Glowing Center Core */}
            <mesh>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
