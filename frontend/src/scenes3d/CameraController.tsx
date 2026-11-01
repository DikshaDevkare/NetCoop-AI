import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface CameraControllerProps {
  scrollProgress: number; // 0 to 1
  introComplete: boolean;
}

export function CameraController({
  scrollProgress,
  introComplete,
}: CameraControllerProps) {
  const { camera } = useThree();
  const currentTarget = useRef(new THREE.Vector3(0.6, 1.2, 0));

  useFrame(() => {
    let targetPos = new THREE.Vector3(0.6, 1.4, 5.2);
    let targetLook = new THREE.Vector3(0.6, 1.2, 0);

    if (!introComplete) {
      // During intro, position smoothly frames the entrance
      targetPos.set(0, 1.0, 6.5);
      targetLook.set(0, 1.0, 0);
    } else if (scrollProgress < 0.2) {
      // Section 1: Hero (Focus on Robot on the right, wide aperture)
      targetPos.set(0.6, 1.4, 5.2);
      targetLook.set(0.8, 1.2, 0);
    } else if (scrollProgress < 0.4) {
      // Section 2: Globe (Center on the holographic globe)
      const t = (scrollProgress - 0.2) / 0.2;
      targetPos.lerpVectors(
        new THREE.Vector3(0.6, 1.4, 5.2),
        new THREE.Vector3(0, 0.4, 5.4),
        t
      );
      targetLook.lerpVectors(
        new THREE.Vector3(0.8, 1.2, 0),
        new THREE.Vector3(0, 0, 0),
        t
      );
    } else if (scrollProgress < 0.6) {
      // Section 3: Network Infrastructure & Features
      const t = (scrollProgress - 0.4) / 0.2;
      targetPos.lerpVectors(
        new THREE.Vector3(0, 0.4, 5.4),
        new THREE.Vector3(0.8, 0.8, 6.0),
        t
      );
      targetLook.lerpVectors(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.2, 0),
        t
      );
    } else if (scrollProgress < 0.8) {
      // Section 4: 5 AI Agents
      const t = (scrollProgress - 0.6) / 0.2;
      targetPos.lerpVectors(
        new THREE.Vector3(0.8, 0.8, 6.0),
        new THREE.Vector3(0, 1.8, 5.8),
        t
      );
      targetLook.lerpVectors(
        new THREE.Vector3(0, 0.2, 0),
        new THREE.Vector3(0, 0, 0),
        t
      );
    } else if (scrollProgress < 0.9) {
      // Section 5: Fault Diagnosis Demo (Zoom into problem locus)
      const t = (scrollProgress - 0.8) / 0.1;
      targetPos.lerpVectors(
        new THREE.Vector3(0, 1.8, 5.8),
        new THREE.Vector3(0.5, -0.4, 3.8),
        t
      );
      targetLook.lerpVectors(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.6, -1.0, -1.0),
        t
      );
    } else {
      // Section 6: Stabilized Network & Final CTA
      const t = (scrollProgress - 0.9) / 0.1;
      targetPos.lerpVectors(
        new THREE.Vector3(0.5, -0.4, 3.8),
        new THREE.Vector3(0, 1.0, 6.4),
        t
      );
      targetLook.lerpVectors(
        new THREE.Vector3(0.6, -1.0, -1.0),
        new THREE.Vector3(0, 0.5, 0),
        t
      );
    }

    // Smooth lerp to destination
    camera.position.lerp(targetPos, 0.06);
    currentTarget.current.lerp(targetLook, 0.06);
    camera.lookAt(currentTarget.current);
  });

  return null;
}
