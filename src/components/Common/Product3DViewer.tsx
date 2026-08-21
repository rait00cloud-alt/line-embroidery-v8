"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const ModelInstance = dynamic(() => import("./ModelInstance"), { ssr: false });

interface Product3DViewerProps {
  modelKey: string;
  designUrl: string;
}

export default function Product3DViewer({ modelKey, designUrl }: Product3DViewerProps) {
  return (
    <div className="w-full h-full mb-16 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Suspense fallback={null}>
          <ModelInstance modelKey={modelKey} designUrl={designUrl} />
        </Suspense>
        <Environment preset="studio" />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}