import * as THREE from 'three'
import React, { useMemo } from 'react'
import { useGLTF, Decal } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    truckercap_thick_unweld_genesis8_1: THREE.Mesh // brim
    truckercap_thick_unweld_genesis8_2: THREE.Mesh
    truckercap_thick_unweld_genesis8_3: THREE.Mesh
    truckercap_thick_unweld_genesis8_4: THREE.Mesh // ✅ MESH PRINCIPAL (back/left/right)
    truckercap_thick_unweld_genesis8_5: THREE.Mesh
    truckercap_thick_unweld_genesis8_6: THREE.Mesh
    truckercap_thick_unweld_genesis8_7: THREE.Mesh
    truckercap_thick_unweld_genesis8_8: THREE.Mesh // front editable
  }
  materials: {
    front: THREE.MeshStandardMaterial
    brim: THREE.MeshStandardMaterial
    mesh: THREE.MeshStandardMaterial
    ['Material580939.001']: THREE.MeshStandardMaterial
    ['Material580926.001']: THREE.MeshStandardMaterial
    Material3202343: THREE.MeshStandardMaterial
    Material7824471: THREE.MeshStandardMaterial
    Material20932546: THREE.MeshStandardMaterial
  }
}

export type DecalData = {
  id: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  map: THREE.Texture
  opacity?: number
  placement?: 'front' | 'back' | 'left' | 'right'
}

interface TruckerHatProps {
  color: string
  colorName?: string
  decals?: DecalData[]
  [key: string]: any
}

const WHITE_COMBO_HEXES = [
  "#444446","#1E398A","#374153","#DC2828","#F471B7","#1D4FD7","#00FFFF","#88CEEC",
  "#A16108","#A3A380","#9233EB","#FFD900","#006602","#A3A380","#00FF00","#FF8C00",
  "#FFFF00","#800020","#E5E5FB","#7E7E01","#98FB99"
]

const SPECIAL_HEXES: Record<string, { front?: string, brim?: string, mesh?: string, useCamo?: boolean }> = {
  "#495C23": { useCamo: true },
  "#4D5421": { useCamo: true, mesh: "#000000" },
  "#C3B192": { front: "#F0E68C", brim: "#A16207", mesh: "#A16207" },
  "#E6B800": { front: "#E6B800", brim: "#000000", mesh: "#000000" },
  "#FFCC00": { front: "#FFCC00", brim: "#1D4ED8", mesh: "#1D4ED8" },
  "#FFBB00": { front: "#FFCC00", brim: "#4169E1", mesh: "#4169E1" },
  "#FF1A1A": { front: "#FFFFFF", brim: "#FF0000", mesh: "#1D4ED8" },
  "#CC0000": { front: "#FFFFFF", brim: "#FF0000", mesh: "#000000" },
  "#990000": { front: "#FFFFFF", brim: "#000000", mesh: "#FF0000" }
}

const normalizeHex = (hex: string) => {
  let h = hex.toUpperCase()
  if (!h.startsWith('#')) h = '#' + h
  return h
}

const camoTextureCache = new Map<string, THREE.Texture>()

function getCamoTexture() {
  const key = 'camo-texture'
  
  if (camoTextureCache.has(key)) {
    return camoTextureCache.get(key)!
  }
  
  const loader = new THREE.TextureLoader()
  const texture = loader.load('/textures/camo/camo.jpg')
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.needsUpdate = true
  
  camoTextureCache.set(key, texture)
  return texture
}

export function TruckerHat({ 
  color, 
  colorName = '', 
  decals = [], 
  ...props 
}: TruckerHatProps) {
  const { nodes, materials } = useGLTF('/models/trucker/trucker-design.glb') as unknown as GLTFResult

  const upperHex = normalizeHex(color)
  const isWhiteCombo = WHITE_COMBO_HEXES.includes(upperHex)
  const specialHexConfig = SPECIAL_HEXES[upperHex] || null
  const isCamoName = colorName.toUpperCase().includes('CAMO')

  let frontColor = color
  let brimColor = color
  let meshColor = color
  let frontMap: THREE.Texture | null = null
  let brimMap: THREE.Texture | null = null
  let meshOpacity = 0.6

  if (isWhiteCombo) {
    frontColor = '#FFFFFF'
  } else if (specialHexConfig) {
    if (specialHexConfig.useCamo) {
      frontMap = getCamoTexture()
      brimMap = getCamoTexture()
      meshColor = specialHexConfig.mesh ?? '#000000'
    } else {
      frontColor = specialHexConfig.front ?? color
      brimColor = specialHexConfig.brim ?? color
      meshColor = specialHexConfig.mesh ?? color
    }
  } else if (isCamoName) {
    frontMap = getCamoTexture()
    brimMap = getCamoTexture()
    meshColor = '#000000'
  }

  const brimMaterial = useMemo(() => {
    const mat = materials.brim.clone()
    mat.color.set(brimColor)
    mat.map = brimMap
    mat.needsUpdate = true
    return mat
  }, [materials.brim, brimColor, brimMap])

  const meshMaterial = useMemo(() => {
    const mat = materials.mesh.clone()
    mat.color.set(meshColor)
    mat.opacity = meshOpacity
    mat.transparent = true
    mat.needsUpdate = true
    return mat
  }, [materials.mesh, meshColor, meshOpacity])

  const editableMaterial = useMemo(() => {
    const mat = materials.front.clone()
    mat.color.set(frontColor)
    mat.map = frontMap
    mat.transparent = true
    mat.depthWrite = false
    mat.side = THREE.DoubleSide
    mat.needsUpdate = true
    return mat
  }, [materials.front, frontColor, frontMap])

  const material580939 = useMemo(() => {
    const mat = materials['Material580939.001'].clone()
    mat.color.set(color)
    if (!isCamoName) mat.map = null
    mat.needsUpdate = true
    return mat
  }, [materials, color, isCamoName])

  const material580926 = useMemo(() => {
    const mat = materials['Material580926.001'].clone()
    mat.color.set(color)
    if (!isCamoName) mat.map = null
    mat.needsUpdate = true
    return mat
  }, [materials, color, isCamoName])

  // ✅ Separar decals: FRONT vai para mesh 8, BACK/LEFT/RIGHT vão para mesh 4
  const decalsByMesh = useMemo(() => {
    return {
      front: decals.filter(d => !d.placement || d.placement === 'front'),
      backLeftRight: decals.filter(d => 
        d.placement === 'back' || 
        d.placement === 'left' || 
        d.placement === 'right'
      ),
    }
  }, [decals])

  return (
    <group {...props} dispose={null}>
      {/* ✅ MESH 1: Brim */}
      <mesh 
        geometry={nodes.truckercap_thick_unweld_genesis8_1.geometry} 
        material={brimMaterial}
        userData={{ isDesignModel: true }}
      />

      {/* ✅ MESH 2 */}
      <mesh 
        geometry={nodes.truckercap_thick_unweld_genesis8_2.geometry} 
        material={material580939}
        userData={{ isDesignModel: true }}
      />

      {/* ✅ MESH 3 */}
      <mesh 
        geometry={nodes.truckercap_thick_unweld_genesis8_3.geometry} 
        material={material580926}
        userData={{ isDesignModel: true }}
      />

      {/* ✅ MESH 4: BACK, LEFT, RIGHT (mesh principal com decals) */}
      <mesh 
        geometry={nodes.truckercap_thick_unweld_genesis8_4.geometry} 
        material={meshMaterial}
        userData={{ isDesignModel: true }}
      >
        {decalsByMesh.backLeftRight.map(decal => (
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

      {/* ✅ MESH 5 */}
      <mesh 
        geometry={nodes.truckercap_thick_unweld_genesis8_5.geometry} 
        material={materials.Material3202343}
        userData={{ isDesignModel: true }}
      />

      {/* ✅ MESH 6 */}
      <mesh 
        geometry={nodes.truckercap_thick_unweld_genesis8_6.geometry} 
        material={materials.Material7824471}
        userData={{ isDesignModel: true }}
      />

      {/* ✅ MESH 7 */}
      <mesh 
        geometry={nodes.truckercap_thick_unweld_genesis8_7.geometry} 
        material={materials.Material20932546}
        userData={{ isDesignModel: true }}
      />

      {/* ✅ MESH 8: FRONT (painel frontal com decals) */}
      <mesh 
        geometry={nodes.truckercap_thick_unweld_genesis8_8.geometry} 
        material={editableMaterial}
        userData={{ isDesignModel: true }}
      >
        {decalsByMesh.front.map(decal => (
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
  )
}

useGLTF.preload('/models/trucker/trucker-design.glb')