"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { hasTexture, getTextureUrl, getColorHex } from "../../utils/colorMapping";

// --- Types ---

type ModelInstanceProps = {
  modelKey?: string;
  color?: string; // Hex string (e.g. "#FF0000") or CSS color name
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

// --- 1. Model Configuration ---
const MODEL_PATHS: Record<string, string> = {
  snapback: "https://res.cloudinary.com/dmenn07uc/image/upload/v1764247417/snapback_il5xwz.glb",
  trucker: "/models/trucker/trucker-design.glb",
  panel: "/models/five-panel/five-panel.glb",
  hat: "https://res.cloudinary.com/dmenn07uc/image/upload/v1764247250/baseball-cap-finale_rbgo62.glb",
};

// Preload models to prevent stutter
Object.values(MODEL_PATHS).forEach((path) => useGLTF.preload(path.trim()));

// --- 2. Sub-Component for Safe Texture Loading ---
// Handles loading specific textures (weave, camo, etc.) without breaking React Hooks
const TextureApplicator = ({ url, scene }: { url: string; scene: THREE.Group }) => {
  const texture = useTexture(url);

  useEffect(() => {
    if (!scene || !texture) return;
    
    // Configure texture
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
    
        (mesh.material as THREE.MeshStandardMaterial).map = texture;
        (mesh.material as THREE.MeshStandardMaterial).color.set("white");
        (mesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
    });
  }, [texture, scene]);

  return null;
};

// --- 3. Main Component ---
export default function ModelInstance({
  modelKey = "hat",
  color,
  position = [0, -0.2, 0],
  rotation = [0, 0, 0],
  scale = 1,
  decals = [], // optional decals array
}: ModelInstanceProps & { decals?: DecalData[] }) {
  
  const path = useMemo(() => MODEL_PATHS[modelKey] || MODEL_PATHS.hat, [modelKey]);
  const gltf: any = useGLTF(path);
  const groupRef = useRef<THREE.Group>(null);
  const scene = useMemo(() => gltf?.scene?.clone(), [gltf]);

  // Detect if this is the trucker hat
  const isTrucker = modelKey === "trucker";

  // Special color logic for trucker
  useEffect(() => {
    if (!scene) return;

    if (isTrucker) {
      scene.traverse((child: any) => {
        if (!child.isMesh) return;

        // Only modify wool and brim
        if (child.material?.name === "wool_color" && color) {
          const mat = (child.material = child.material.clone());
          mat.color.set(color);
          mat.needsUpdate = true;
        }

        if (child.material?.name === "brim" && color) {
          const mat = (child.material = child.material.clone());
          mat.color.set(color);
          mat.needsUpdate = true;
        }

        // Editable decals surface stays transparent
        if (child.material?.name === "editable") {
          const mat = (child.material = child.material.clone());
          mat.transparent = true;
          mat.depthWrite = false;
          mat.side = THREE.DoubleSide;
        }
      });
    } else {
      // Generic color application for other models
      scene.traverse((child: any) => {
        if (!child.isMesh || !child.material) return;
        if (color) {
          try {
            const c = new THREE.Color(getColorHex(color) || color);
            c.convertSRGBToLinear();
            child.material.color.set(c);
            child.material.map = null;
            child.material.needsUpdate = true;
          } catch {}
        }
      });
    }
  }, [scene, color, isTrucker]);

  if (!scene) return null;

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />

      {/* Apply decals if provided */}
      {decals?.length > 0 &&
        decals.map((decal) => {
          return (
            <Decal
              key={decal.id}
              position={decal.position}
              rotation={decal.rotation}
              scale={decal.scale}
            >
              <meshStandardMaterial
                map={useTexture(decal.map)}
                transparent
                opacity={decal.opacity ?? 1}
                toneMapped={false}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </Decal>
          );
        })}
    </group>
  );
}
