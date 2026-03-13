"use client";

import React, { useMemo } from "react";
import { Html } from "@react-three/drei";
import ModelInstance from "./ModelInstance";

interface ModelProps {
  modelKey: string;
  activePosition: "front" | "left" | "right";
  textAsset: string | null;
  publicAsset: string | null;
  userAsset: File | null;
}

export default function Model({
  modelKey,
  activePosition,
  textAsset,
  publicAsset,
  userAsset,
}: ModelProps) {
  
  const uploadedUrl = useMemo(
    () => (userAsset ? URL.createObjectURL(userAsset) : null),
    [userAsset]
  );

  
  let displayAsset: "text" | "public" | "upload" | null = null;
  if (textAsset) displayAsset = "text";
  else if (publicAsset) displayAsset = "public";
  else if (uploadedUrl) displayAsset = "upload";

  // Position map for Html overlay
  const positionMap: Record<string, [number, number, number]> = {
    front: [0, 1, 0.5],
    left: [-0.5, 1, 0],
    right: [0.5, 1, 0],
  };

  return (
    <>
      <ModelInstance modelKey={modelKey} designUrl={null} />

      {displayAsset && (
        <Html position={positionMap[activePosition]} center>
          {displayAsset === "text" && <div className="text-2xl font-bold">{textAsset}</div>}
          {displayAsset === "public" && <img src={publicAsset!} className="w-16 h-16" />}
          {displayAsset === "upload" && uploadedUrl && <img src={uploadedUrl} className="w-16 h-16" />}
        </Html>
      )}
    </>
  );
}
