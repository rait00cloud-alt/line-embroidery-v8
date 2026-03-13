"use client";

import { useRef, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";

interface CustomOrbitControlsProps {
  autoReturn?: boolean;
  returnDelay?: number;
  domElementRef?: React.RefObject<HTMLDivElement>;
}

export default function CustomOrbitControls({ 
  autoReturn = true, 
  returnDelay = 200,
  domElementRef
}: CustomOrbitControlsProps) {
  
  const controlsRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const homePosition = useRef(new Vector3(5, 3, 10));
  const homeTarget = useRef(new Vector3(0, 0, 0));
  const isReturning = useRef(false);
  
  useEffect(() => {
    if (controlsRef.current) {
      homePosition.current.copy(controlsRef.current.object.position);
      homeTarget.current.copy(controlsRef.current.target);
    }
  }, []);

  const returnToHome = () => {
    if (!controlsRef.current || isReturning.current) return;
    
    isReturning.current = true;
    const startPosition = controlsRef.current.object.position.clone();
    const startTarget = controlsRef.current.target.clone();
    
    let progress = 0;

    const animate = () => {
      progress += 0.05;
      
      if (progress >= 1) {
        controlsRef.current.object.position.copy(homePosition.current);
        controlsRef.current.target.copy(homeTarget.current);
        controlsRef.current.update();
        isReturning.current = false;
        return;
      }
      
      const easedProgress = 1 - Math.pow(1 - progress, 3); 
      
      controlsRef.current.object.position.lerpVectors(
        startPosition, 
        homePosition.current, 
        easedProgress
      );
      controlsRef.current.target.lerpVectors(
        startTarget, 
        homeTarget.current, 
        easedProgress
      );
      controlsRef.current.update();
      
      requestAnimationFrame(animate);
    };
    
    animate();
  };

  const handleChange = () => {
    if (!autoReturn || isReturning.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      returnToHome();
    }, returnDelay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      domElement={domElementRef?.current || undefined}
      enablePan={false}
      enableZoom={false}
      enableDamping={true}
      dampingFactor={0.05}
      onChange={handleChange}
    />
  );
}
