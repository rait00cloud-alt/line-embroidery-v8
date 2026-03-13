import * as THREE from "three";
import React, { useMemo } from "react";
import { useGLTF, Decal } from "@react-three/drei";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    baseballcap_thick_unweld_genesis8_1: THREE.Mesh;
    baseballcap_thick_unweld_genesis8_2: THREE.Mesh;
    baseballcap_thick_unweld_genesis8_3: THREE.Mesh;
  };
  materials: {
    metal: THREE.MeshStandardMaterial;
    lines: THREE.MeshStandardMaterial;
    editable: THREE.MeshStandardMaterial;
  };
};

export type DecalData = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  map: THREE.Texture;
  opacity?: number;
};

interface BaseballCapProps {
  color: string;
  decals?: DecalData[];
  [key: string]: any;
}

export function BaseballCap({
  color,
  decals = [],
  ...props
}: BaseballCapProps) {
  const { nodes, materials } = useGLTF(
    "/models/baseball-cap/baseball-cap-finale.glb"
  ) as unknown as GLTFResult;

  const capMaterials = useMemo(() => {
    const metal = materials.metal.clone();
    const lines = materials.lines.clone();
    const editable = materials.editable.clone();

    editable.map = null;
    editable.normalMap = null;
    editable.roughnessMap = null;
    editable.metalnessMap = null;
    editable.color.set(color);
    editable.toneMapped = false;
    editable.needsUpdate = true;

    return { metal, lines, editable };
  }, [materials, color]);

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.baseballcap_thick_unweld_genesis8_1.geometry}
        material={capMaterials.metal}
      />
      <mesh
        geometry={nodes.baseballcap_thick_unweld_genesis8_2.geometry}
        material={capMaterials.lines}
      />
      <mesh
        key={color} // 🔑 força rebind do material
        geometry={nodes.baseballcap_thick_unweld_genesis8_3.geometry}
        material={capMaterials.editable}
        castShadow
        receiveShadow
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

useGLTF.preload("/models/baseball-cap/baseball-cap-finale.glb");
