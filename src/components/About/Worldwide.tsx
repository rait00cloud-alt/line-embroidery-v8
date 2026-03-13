"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useRef } from "react";
import * as THREE from "three";

const Countries3DSection = () => {
  const t = useTranslations();

  const countries = ["USA", "Brazil", "Japan", "Germany", "France"];

  
  const [rotationTarget, setRotationTarget] = useState<[number, number, number]>([0, 0, Math.PI]);

  
  const rotations: Record<string, [number, number, number]> = {
    USA: [0, -1.2, 0],
    Brazil: [0, -0.5, 0],
    Japan: [0, 1.5, 0],
    Germany: [0, -0.8, 0],
    France: [0, -0.7, 0],
  };

  
  const GlobeModel = ({ rotationTarget }: { rotationTarget: [number, number, number] }) => {
    const gltf = useGLTF("/models/globe/scene.glb");
    const ref = useRef<THREE.Group>(null);

    
    const texture = useLoader(THREE.TextureLoader, "/models/globe/textures/Material.002_diffuse.jpeg");

    
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material.map = texture;
        child.material.needsUpdate = true;
      }
    });

    useFrame(() => {
      if (ref.current) {
        ref.current.rotation.y += (rotationTarget[1] - ref.current.rotation.y) * 0.05;
        ref.current.rotation.x += (rotationTarget[0] - ref.current.rotation.x) * 0.05;
      }
    });

    return <primitive ref={ref} object={gltf.scene} scale={1.5} />;
  };

  return (
    <section className="w-full py-16 px-4 md:px-16 flex">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row-reverse  gap-8 text-white">
        {/* Left Side - Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-2"
        >
          <h2 className="font-[HandoBold] sm:text-5xl text-3xl leading-tight">
            {t("countriesSection.title")}
          </h2>
          <p className="font-[HandoRegular] text-white/70 text-base md:text-lg leading-relaxed">
            {t("countriesSection.subtitle")}
          </p>

          <div className="mt-4 flex flex-wrap gap-4">
            {countries.map((country, index) => (
              <div
                key={index}
                onClick={() => setRotationTarget(rotations[country])}
                className="bg-black text-white px-4 py-2 rounded-full font-[HandoBold] text-sm cursor-pointer hover:bg-gray-800 transition"
              >
                {country}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - 3D Model */}
       <motion.div
  initial={{ opacity: 0, scale: 0 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  className="w-full h-[600px] max-w-[600px] rounded-3xl"
>
  <Canvas camera={{ position: [2, 2, 10], fov: 80 }}>
    <ambientLight intensity={0.5} />
    <directionalLight position={[5, 5, 5]} intensity={1} />
    
    <Stage environment="city" intensity={1}>
      <GlobeModel  rotationTarget={rotationTarget} />
    </Stage>
    
    <OrbitControls
      enablePan={false}
      enableZoom={true}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
    />
  </Canvas>
</motion.div>

      </div>
    </section>
  );
};

export default Countries3DSection;
