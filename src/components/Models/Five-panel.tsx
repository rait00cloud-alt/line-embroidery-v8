import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useGLTF, Decal } from "@react-three/drei";
import { GLTF } from "three-stdlib";

/* ---------------- Types ---------------- */

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.MeshStandardMaterial;
  };
};

export type DecalData = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  map: THREE.Texture; // ✅ TEXTURE, NÃO URL
  opacity?: number;
};

interface FivePanelProps {
  baseTexture?: THREE.Texture | null; // ✅ vem do Canvas
  decals?: DecalData[];
  color?: string;
  [key: string]: any;
}

/* ---------------- Component ---------------- */

export function FivePanelHat({
  baseTexture = null,
  decals = [],
  color = "#ffffff",
  ...props
}: FivePanelProps) {
  const { nodes, materials } = useGLTF(
    "/models/five-panel/five-panel.glb"
  ) as unknown as GLTFResult;

  const editableRef = useRef<THREE.Mesh>(null);

  /* ---------- Editable material ---------- */
  const editableMaterial = useMemo(() => {
    const m = materials.editable.clone();

    m.color.set(color);
    m.toneMapped = false;

    if (baseTexture) {
      m.map = baseTexture;
      m.needsUpdate = true;
    } else {
      m.map = null;
    }

    return m;
  }, [materials.editable, baseTexture, color]);

  return (
    <group {...props} dispose={null}>
      {/* -------- Static meshes -------- */}
      {Object.entries(nodes).map(([key, mesh]) => {
        if (key.endsWith("_10")) return null; // editable mesh

        const materialName = (mesh.material as any)?.name;

        return (
          <mesh
            key={key}
            geometry={mesh.geometry}
            material={materials[materialName]}
            castShadow
            receiveShadow
          />
        );
      })}

      {/* -------- Editable mesh (DECALS) -------- */}
      <mesh
        ref={editableRef}
        geometry={
          nodes["5panel_cap_mv2luka_thick_unweld_toshitimo_10"].geometry
        }
        material={editableMaterial}
        castShadow
        receiveShadow
        userData={{ isDesignModel: true }}
      >
        {decals.map((decal) => (
          <Decal
            key={decal.id}
            position={decal.position}
            rotation={decal.rotation}
            scale={decal.scale}
          >
            <meshStandardMaterial
              map={decal.map}
              transparent
              opacity={decal.opacity ?? 1}
              toneMapped={false}
              polygonOffset
              polygonOffsetFactor={-4}
              depthTest
            />
          </Decal>
        ))}
      </mesh>
    </group>
  );
}

useGLTF.preload("/models/five-panel/five-panel.glb");
