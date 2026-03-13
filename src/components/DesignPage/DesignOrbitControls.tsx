"use client";

import { useRef, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

interface DesignOrbitControlsProps {
  enableZoom?: boolean;
  autoReturn?: boolean;
  returnDelay?: number;
  homePosition?: [number, number, number];
  homeTarget?: [number, number, number];
  activePosition?: "front" | "left" | "right" | "back" | "top";
}

export default function DesignOrbitControls({ 
  enableZoom = true,
  autoReturn = true, 
  returnDelay = 1500,
  homePosition = [5, 3, 10],
  homeTarget = [0, 0, 0],
  activePosition = "front"
}: DesignOrbitControlsProps) {
  const controlsRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const homePos = useRef(new Vector3(...homePosition));
  const homeTargetPos = useRef(new Vector3(...homeTarget));
  const isReturning = useRef(false);
  
  // Calculate context-aware home position based on active view
  const getContextualHomePosition = (): [number, number, number] => {
    const distance = 8; // Distance from target
    const height = 3;   // Height for perspective views
    
    switch (activePosition) {
      case "front":
        return [0, height, distance];
      case "left":
        return [-distance, height, 0];
      case "right":
        return [distance, height, 0];
      case "back":
        return [0, height, -distance];
      case "top":
        return [0, distance, 0];
      default:
        return homePosition;
    }
  };

  // Update home position when activePosition changes
  useEffect(() => {
    if (controlsRef.current) {
      const contextualPosition = getContextualHomePosition();
      homePos.current.set(...contextualPosition);
      homeTargetPos.current.set(...homeTarget);
    }
  }, [homePosition, homeTarget, activePosition]);

  const returnToHome = () => {
    if (!controlsRef.current || isReturning.current) return;
    
    isReturning.current = true;
    const startPosition = controlsRef.current.object.position.clone();
    const startTarget = controlsRef.current.target.clone();
    
    let progress = 0;
    const animate = () => {
      progress += 0.04; // Slightly slower for smoother animation
      
      if (progress >= 1) {
        controlsRef.current.object.position.copy(homePos.current);
        controlsRef.current.target.copy(homeTargetPos.current);
        controlsRef.current.update();
        isReturning.current = false;
        return;
      }
      
      // Smooth interpolation with easeOut
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      controlsRef.current.object.position.lerpVectors(
        startPosition, 
        homePos.current, 
        easedProgress
      );
      controlsRef.current.target.lerpVectors(
        startTarget, 
        homeTargetPos.current, 
        easedProgress
      );
      controlsRef.current.update();
      
      requestAnimationFrame(animate);
    };
    
    animate();
  };

  const handleChange = () => {
    if (!autoReturn || isReturning.current) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout to return to home
    timeoutRef.current = setTimeout(() => {
      returnToHome();
    }, returnDelay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={enableZoom}
      enableRotate={false}
      enableDamping={true}
      dampingFactor={0.05}
      onChange={handleChange}
      minDistance={3}
      maxDistance={15}
    />
  );
}
