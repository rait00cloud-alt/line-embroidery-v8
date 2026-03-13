"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { Rotate3D } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import * as THREE from "three";

import CustomOrbitControls from "./CustomOrbitControls";
import { FivePanelHat } from "@/components/Models/Five-panel";
import { SnapbackHat } from "@/components/Models/Snapback";
import { TruckerHat } from "@/components/Models/TruckerHat";
import { BaseballCap } from "@/components/Models/Dad-hat";
import { hasTexture, getTextureUrl } from "@/utils/colorMapping";

/* ---------------- Canvas sem SSR ---------------- */

const Canvas = dynamic(
  () => import("@react-three/fiber").then((m) => m.Canvas),
  { ssr: false }
);

const Environment = dynamic(
  () => import("@react-three/drei").then((m) => m.Environment),
  { ssr: false }
);

/* ----------------------------------------------- */

interface ProductViewerProps {
  modelKey: string;
  selectedColor: string;
  colorName: string;
}

export default function ProductViewer({
  modelKey,
  selectedColor,
  colorName,
}: ProductViewerProps) {
  const t = useTranslations();
  const interactionRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  /* ---------------- Texture URL ---------------- */

  const [textureUrl, setTextureUrl] = useState<string | undefined>(() =>
    hasTexture(modelKey) ? getTextureUrl(modelKey, colorName) : undefined
  );

  useEffect(() => {
    if (hasTexture(modelKey)) {
      setTextureUrl(getTextureUrl(modelKey, colorName));
    } else {
      setTextureUrl(undefined);
    }
  }, [modelKey, colorName]);

  /* ---------------- Cleanup CORRETO ---------------- */

  // 🔹 limpa SOMENTE blob URLs quando trocar textura
  useEffect(() => {
    return () => {
      if (textureUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(textureUrl);
      }
    };
  }, [textureUrl]);

  // 🔹 cleanup pesado SOMENTE no unmount real
  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.domElement?.remove();
        rendererRef.current = null;
      }
    };
  }, []);

  /* ------------------------------------------------ */

  if (!mounted) {
    return (
      <div
        className="relative h-[520px] bg-gray-100 rounded-lg"
        suppressHydrationWarning
      />
    );
  }

  const decals: any[] = [];

  return (
    <div
      className="relative h-[520px] bg-gray-100 rounded-lg overflow-hidden"
      suppressHydrationWarning
    >
      {/* Interaction Layer */}
      <div
        ref={interactionRef}
        className="absolute z-20"
        style={{
          width: "50%",
          height: "50%",
          top: "25%",
          left: "25%",
          cursor: "grab",
          touchAction: "none",
          pointerEvents: "auto",
        }}
      />

      {/* 3D Scene */}
      <Canvas
        camera={{ position: [5, 3, 10], fov: 45 }}
        style={{ pointerEvents: "none" }}
        gl={{ preserveDrawingBuffer: true }}
        frameloop="demand"
        onCreated={({ gl }) => {
          rendererRef.current = gl;
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <Suspense fallback={null}>
          {modelKey === "snapback" && (
            <SnapbackHat
              color={selectedColor}
              decals={decals}
              position={[0, -0.2, 0]}
            />
          )}

          {modelKey === "panel" && (
            <FivePanelHat
              color={selectedColor}
              decals={decals}
              position={[0, 0, 0]}
            />
          )}

          {modelKey === "trucker" && (
            <TruckerHat
              color={selectedColor}
              colorName={colorName}
              decals={decals}
              position={[0, -0.5, 0]}
            />
          )}

          {modelKey === "hat" && (
            <BaseballCap
              color={selectedColor}
              decals={decals}
              position={[0.1, 0, 0]}
            />
          )}
        </Suspense>

        <CustomOrbitControls domElementRef={interactionRef} />
        <Environment preset="sunset" background blur={4} />
      </Canvas>

      {/* UI Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute bottom-2 left-2 flex gap-2 pointer-events-none"
      >
        <Rotate3D />
        <p className="font-[HandoBold]">{t("rotate")}</p>
      </motion.div>
    </div>
  );
}
