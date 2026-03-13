"use client";

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, Float } from "@react-three/drei";
import { Shirt, Scissors, WashingMachine } from "lucide-react";
import { useTranslations } from "next-intl";

const Model3D = ({ modelUrl }) => {
  const gltf = useGLTF(modelUrl, true);
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <primitive object={gltf.scene} scale={1.8} />
    </Float>
  );
};

// 3D Cube icon box
const IconBox = ({ icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, rotateX: -20, rotateY: 20 }}
    whileInView={{ opacity: 1, rotateX: 0, rotateY: 0 }}
    transition={{ duration: 0.8, delay }}
    whileHover={{ scale: 1.1, rotateY: 180, transition: { duration: 0.6 } }}
    style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
    className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-white/20 to-white/5 border-2 border-white/30 backdrop-blur-md rounded-lg shadow-2xl flex items-center justify-center text-white relative"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg" />
    <div className="relative z-10">{icon}</div>
  </motion.div>
);

const EnterpriseContainer = () => {
    const t = useTranslations();
  return (
    <motion.section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="relative flex flex-col items-center justify-center py-16 w-full px-8 bg-[#131313] rounded-xl mt-8 overflow-hidden"
    >
      {/* Grid Stitch Background */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,#1f1f1f_0_1px,transparent_1px_20px),repeating-linear-gradient(90deg,#1f1f1f_0_1px,transparent_1px_20px)] pointer-events-none" />

      {/* Headings */}
      <div className="flex flex-col justify-center items-center w-full max-w-2xl z-10 gap-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="font-[HandoBold] text-4xl sm:text-5xl text-white text-center shadow-xl"
        >
          {t('enterprise.title')}
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-[HandoBold] text-sm sm:text-xl text-white/70 tracking-tight text-center mt-2"
        >
        {t('enterprise.subtitle')}
        </motion.h2>

         <motion.a
                       initial={{ backgroundColor: "#000000", scale:0 }}
                       animate={{ scale:1}}
                       whileHover={{ backgroundColor: "#ffffff" }}
                       transition={{ duration: 0.2, ease: "easeIn" }}
                       
                       href="#get_in_touch"
                       className="border border-white rounded-sm px-4 py-1 flex justify-center items-center"
                     >
                       <motion.span
                         initial={{ color: "#ffffff" }}
                         whileHover={{ color: "#000000" }}
                         transition={{ duration: 0.3, ease: "easeIn" }}
                         className="font-[HandoBold] text-lg flex justify-center items-center gap-2"
                       >
                    {t("enterprise.start")} <span className="text-xs">↗</span>
                </motion.span>
            </motion.a>
      </div>

      {/* 3D Canvas */}
      <motion.div 
      initial={{opacity:0}}
      animate={{opacity:1}}
      viewport={{once:false}}
      className="w-full max-w-3xl h-[400px] mt-10 z-10">
        <Canvas camera={{ position: [0, 0, 1.5] }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[4, 4, 4]} intensity={1.2} />
          <Suspense >
            <Model3D modelUrl="/models/shirt/oversized_t-shirt.glb" />
          </Suspense>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
        </Canvas>
      </motion.div>

      {/* Icon Grid - Scattered Layout */}
      <div className="absolute w-full max-w-5xl h-32 mt-12 z-0">
      
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute top-60 right-[5%]"
        >
          <IconBox icon={<WashingMachine size={36} />} delay={0.4} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="absolute top-40 left-[10%]"
        >
          <IconBox icon={<Scissors size={36} />} delay={0.6} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute top-5 right-[20%]"
        >
          <IconBox icon={<Shirt size={36} />} delay={0.8} />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default EnterpriseContainer;