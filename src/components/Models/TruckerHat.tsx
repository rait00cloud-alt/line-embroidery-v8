import * as THREE from 'three'
import React, { useMemo } from 'react'
import { useGLTF, Decal, useTexture } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    truckercap_thick_unweld_genesis8_1: THREE.Mesh // brim
    truckercap_thick_unweld_genesis8_2: THREE.Mesh
    truckercap_thick_unweld_genesis8_3: THREE.Mesh
    truckercap_thick_unweld_genesis8_4: THREE.Mesh
    truckercap_thick_unweld_genesis8_5: THREE.Mesh // wool
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
  map: string
  opacity?: number
}

interface TruckerHatProps {
  color: string
  colorName: string
  decals?: DecalData[]
  [key: string]: any
}

const WHITE_COMBO_HEXES = [
  "#444445", "#1E3A8B", "#374152", "#DC2627", "#F472B7", "#FBCFE9", "#1D4ED9",
  "#00FFFF", "#87CEEC", "#A16208", "#A3A381", "#9333EB", "#FFD701", "#006401",
  "#A3A381", "#00FF01", "#FF8C01", "#FFFF01", "#800021", "#E6E6FB", "#808001", "#98FB99"
]

export function TruckerHat({ color, colorName, decals = [], ...props }: TruckerHatProps) {
  const { nodes, materials } = useGLTF('/models/trucker/trucker-design.glb') as unknown as GLTFResult

  const upperHex = color.toUpperCase()
  const isWhiteCombo = WHITE_COMBO_HEXES.includes(upperHex)

  /* =========================
     SPECIAL COLOR COMBOS
  ========================= */
  const camoTexture = useTexture('/textures/camo/camo.jpg')
  const upperColorName = colorName.toUpperCase()

  let frontColor = color
  let brimColor = color
  let meshColor = color
  let frontMap: THREE.Texture | null = null
  let brimMap: THREE.Texture | null = null
  let meshOpacity = 0.6

  if (isWhiteCombo) {
  frontColor = '#FFFFFF'
}

  if (upperColorName.includes('CAMO')) {
    frontMap = camoTexture
    brimMap = camoTexture
    meshColor = '#000000'
  } else if (upperColorName.startsWith('GOLD/')) {
    const secondColor = upperColorName.split('/')[1]
    frontColor = '#FFD700'
    brimColor = mapAbbreviationToHex(secondColor)
    meshColor = mapAbbreviationToHex(secondColor)
  } else if (upperColorName === 'KHI/BRO') {
    frontColor = mapAbbreviationToHex('KHI')
    meshColor = mapAbbreviationToHex('BRO')
    brimColor = meshColor
  } else if (['RED/WHT/ROY', 'RED/WHT/BLK', 'BLK/WHT/RED'].includes(upperColorName)) {
    const [brimHex, frontHex, meshHex] = upperColorName.split('/')
    brimColor = mapAbbreviationToHex(brimHex)
    frontColor = mapAbbreviationToHex(frontHex)
    meshColor = mapAbbreviationToHex(meshHex)
  }

  function mapAbbreviationToHex(abbr: string) {
    switch (abbr) {
      case 'RED': return '#DC2626'
      case 'WHT': return '#FFFFFF'
      case 'ROY': return '#1D4ED8'
      case 'BLK': return '#000000'
      case 'NAVY': return '#1E3A8B'
      case 'GOLD': return '#FFD700'
      case 'KHI': return '#F0E68C'
      case 'BRO': return '#A16207'
      default: return '#FFFFFF'
    }
  }

  /* =========================
     MATERIALS
  ========================= */
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
    mat.transparent = true
    mat.opacity = meshOpacity
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
    mat.map = null
    mat.color.set(color)
    mat.needsUpdate = true
    return mat
  }, [materials['Material580939.001'], color])

  const material580926 = useMemo(() => {
    const mat = materials['Material580926.001'].clone()
    mat.map = null
    mat.color.set(color)
    mat.needsUpdate = true
    return mat
  }, [materials['Material580926.001'], color])

  /* =========================
     DECALS
  ========================= */
  const validUrls = decals.map(d => d.map).filter(Boolean)
const textures = useTexture(validUrls)
const textureArray = Array.isArray(textures) ? textures : [textures]


  const woolDecals = decals.filter(d => {
    const [x, , z] = d.position
    return z < 0 || x < -0.05 || x > 0.05
  })
  const editableDecals = decals.filter(d => !woolDecals.includes(d))

  /* =========================
     RENDER
  ========================= */
  return (
    <group {...props} dispose={null}>
      {/* Front / Editable */}
      <mesh
        geometry={nodes.truckercap_thick_unweld_genesis8_8.geometry}
        material={editableMaterial}
        userData={{ isDesignModel: true }}
      >
        {editableDecals.map(decal => {
          const map = textureArray[validUrls.indexOf(decal.map)]
          if (!map) return null
          return (
            <Decal
              key={decal.id}
              position={decal.position}
              rotation={decal.rotation}
              scale={decal.scale}
            >
              <meshStandardMaterial
                map={map}
                transparent
                opacity={decal.opacity ?? 1}
                toneMapped={false}
              />
            </Decal>
          )
        })}
      </mesh>

      {/* Wool */}
      <mesh geometry={nodes.truckercap_thick_unweld_genesis8_5.geometry} material={meshMaterial}>
        {woolDecals.map(decal => {
          const map = textureArray[validUrls.indexOf(decal.map)]
          if (!map) return null
          return (
            <Decal
              key={decal.id}
              position={decal.position}
              rotation={decal.rotation}
              scale={decal.scale}
            >
              <meshStandardMaterial
                map={map}
                transparent
                opacity={decal.opacity ?? 1}
                toneMapped={false}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </Decal>
          )
        })}
      </mesh>

      {/* Brim */}
      <mesh geometry={nodes.truckercap_thick_unweld_genesis8_1.geometry} material={brimMaterial} />

      {/* Static meshes */}
      <mesh geometry={nodes.truckercap_thick_unweld_genesis8_2.geometry} material={material580939} />
      <mesh geometry={nodes.truckercap_thick_unweld_genesis8_3.geometry} material={material580926} />
      <mesh geometry={nodes.truckercap_thick_unweld_genesis8_4.geometry} material={meshMaterial} />
      <mesh geometry={nodes.truckercap_thick_unweld_genesis8_6.geometry} material={materials.Material7824471} />
      <mesh geometry={nodes.truckercap_thick_unweld_genesis8_7.geometry} material={materials.Material20932546} />
    </group>
  )
}

useGLTF.preload('/models/trucker/trucker-design.glb')
