"use client";
import React, {  useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function RotatingGroup({
  rotation,
  children,
  modelKey,
}: {
  rotation: [number, number, number];
  children: React.ReactNode;
  modelKey?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef<[number, number, number]>(rotation);
  const isAutoRotating = useRef(false);

  
  useEffect(() => {
    if (modelKey === 'five-panelbrim') {
      targetRotation.current = [rotation[0], Math.PI / 2, rotation[2]];
    } else {
      targetRotation.current = rotation;
    }

    
    isAutoRotating.current = modelKey === 'underbrim';
  }, [rotation, modelKey]);

  useFrame(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;
    if (isAutoRotating.current) { 
      group.rotation.y += 0.005;
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotation.current[0], 0.1);
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, targetRotation.current[2], 0.1);
    } 
    
    else {
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotation.current[0], 0.1);
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotation.current[1], 0.1);
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, targetRotation.current[2], 0.1);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}