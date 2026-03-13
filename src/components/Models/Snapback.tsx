import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useGLTF, Decal } from "@react-three/drei";
import { GLTF } from "three-stdlib";

/* ---------------- Types ---------------- */

type GLTFResult = GLTF & {
  nodes: {
    ["5panelcap_thick_unweld_genesis8"]: THREE.Mesh;
    ["5panelcap_thick_unweld_genesis8_1"]: THREE.Mesh;
    ["5panelcap_thick_unweld_genesis8_2"]: THREE.Mesh; // editable
  };
  materials: {
    strapback: THREE.MeshStandardMaterial;
    strings: THREE.MeshStandardMaterial;
    editable: THREE.MeshStandardMaterial;
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

interface SnapbackProps {
  color?: string;
  baseTexture?: THREE.Texture | null; // ✅ vem do Canvas
  decals?: DecalData[];
  [key: string]: any;
}

/* ---------------- Component ---------------- */

export function SnapbackHat({
  color = "#ffffff",
  baseTexture = null,
  decals = [],
  ...props
}: SnapbackProps) {
  const { nodes, materials } = useGLTF(
    "https://res.cloudinary.com/dmenn07uc/image/upload/v1764247417/snapback_il5xwz.glb"
  ) as unknown as GLTFResult;

  const editableRef = useRef<THREE.Mesh>(null);

  /* ---------- Clone materials ---------- */
  const strapbackMat = useMemo(
    () => materials.strapback.clone(),
    [materials]
  );
  const stringsMat = useMemo(
    () => materials.strings.clone(),
    [materials]
  );

  /* ---------- Editable material ---------- */
  const editableMat = useMemo(() => {
    const m = materials.editable.clone();

    m.map = null;
    m.emissiveMap = null;
    m.emissive.set(0x000000);
    m.vertexColors = false;
    m.toneMapped = false;

    m.color.set(color);

    if (baseTexture) {
      m.map = baseTexture;
      m.needsUpdate = true;
    }

    return m;
  }, [materials.editable, color, baseTexture]);

  return (
    <group {...props} dispose={null}>
      {/* Strapback */}
      <mesh
        geometry={nodes["5panelcap_thick_unweld_genesis8"].geometry}
        material={strapbackMat}
        castShadow
        receiveShadow
      />

      {/* Strings */}
      <mesh
        geometry={nodes["5panelcap_thick_unweld_genesis8_1"].geometry}
        material={stringsMat}
        castShadow
        receiveShadow
      />

      {/* Editable mesh (DECALS) */}
      <mesh
        ref={editableRef}
        geometry={nodes["5panelcap_thick_unweld_genesis8_2"].geometry}
        material={editableMat}
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
              polygonOffsetFactor={-1}
            />
          </Decal>
        ))}
      </mesh>
    </group>
  );
}

useGLTF.preload(
  "https://res.cloudinary.com/dmenn07uc/image/upload/v1764247417/snapback_il5xwz.glb"
);
