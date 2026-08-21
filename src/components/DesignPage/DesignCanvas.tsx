import React, {
  Suspense,
  useRef,
  useImperativeHandle,
  useMemo,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

import CustomOrbitControls from "@/components/Common/CustomOrbitControls";
import { RotatingGroup } from "@/components/Design/RotatingGroup";
import { FivePanelHat } from "@/components/Models/Five-panel";
import { SnapbackHat } from "@/components/Models/Snapback";
import { TruckerHat } from "@/components/Models/Trucker";
import { BaseballCap } from "@/components/Models/Dad-hat";

interface DecalInput {
  id: string;
  textureKey?: string; // 👈 IMPORTANTE
  map: THREE.Texture
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  opacity?: number;

}

interface DesignCanvasProps {
  modelKey: string;
  color: string;
  decals: DecalInput[];
  sceneRotation: [number, number, number];
  children?: React.ReactNode;
  colorName?: string;
  activePosition?: string;
}

export interface DesignCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

// Camera FOV handler
const CameraHandler = ({ modelKey }: { modelKey: string }) => {
  const { camera } = useThree();

  React.useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 90;
      camera.updateProjectionMatrix();
    }
  }, [camera, modelKey]);

  return null;
};

export const DesignCanvas = React.forwardRef<
  DesignCanvasHandle,
  DesignCanvasProps
>(({ modelKey, color, decals, sceneRotation, children, colorName, activePosition }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const interactionRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));

  // 🔥 TEXTURE CACHE (KEY = CONTENT, NOT POSITION)
  const textureCache = useRef<Map<string, THREE.Texture>>(new Map());

  function getTexture(textureKey: string, url: string) {
    const cached = textureCache.current.get(textureKey);
    if (cached) return cached;

    const loader = new THREE.TextureLoader();
    const texture = loader.load(url);

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;

    textureCache.current.set(textureKey, texture);
    console.count("TEXTURE CREATED");

    return texture;
  }

    React.useEffect(() => {
      return () => {
        // Dispose de todas as texturas criadas
        textureCache.current.forEach((texture) => {
          texture.dispose();
        });
        textureCache.current.clear();

        // Se você quiser, também pode limpar o canvas (opcional)
        if (canvasRef.current) {
          const gl = canvasRef.current.getContext("webgl2") || canvasRef.current.getContext("webgl");
          if (gl) gl.getExtension("WEBGL_lose_context")?.loseContext();
        }
      };
    }, []);

  // ✅ PREPARE DECALS (UPLOAD SAFE)
  const preparedDecals = useMemo(
    () =>
      decals.map((decal) => {
        const textureKey =
          decal.textureKey ?? `${decal.id}-${decal.map}`;

        return {
          ...decal,
          textureKey,
          map: getTexture(textureKey, decal.map),
        };
      }),
    [decals]
  );

  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] bg-white rounded-lg overflow-hidden">
      {/* Interaction layer */}
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

      <Canvas
        camera={{ position: [0, 1, 5], fov: 50 }}
        style={{ pointerEvents: "none" }}
        gl={{
          preserveDrawingBuffer: false,
          powerPreference: "low-power",
          antialias: false,
        }}
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement;
        }}
      >
        <CameraHandler modelKey={modelKey} />

        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 3]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />

        <CustomOrbitControls domElementRef={interactionRef} />

        <Suspense fallback={null}>
          <Environment preset="sunset" background blur={4} />

          <RotatingGroup rotation={sceneRotation}>
            <Float>
              {modelKey === "snapback" && (
                <SnapbackHat
                  color={color}
                  decals={preparedDecals}
                  position={[0, -0.2, 0]}
                />
              )}

              {modelKey === "panel" && (
                <FivePanelHat
                  color={color}
                  decals={preparedDecals}
                  position={[0, 0, -0.5]}
                />
              )}

              {modelKey === "trucker" && (
                <TruckerHat
                  color={color}
                  colorName={colorName}
                  decals={preparedDecals}
                  activePosition={activePosition} 
                  position={[0, -0.5, 0]}
                />
              )}

              {modelKey === "hat" && (
                <BaseballCap
                  color={color}
                  decals={preparedDecals}
                  position={[0, 0, -0.8]}
                />
              )}
            </Float>
          </RotatingGroup>
        </Suspense>
      </Canvas>

      {children}
    </div>
  );
});

DesignCanvas.displayName = "DesignCanvas";
