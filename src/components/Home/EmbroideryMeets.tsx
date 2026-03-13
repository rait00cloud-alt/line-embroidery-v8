"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface Slide {
  src: string;
}

const slides: Slide[] = [
  { src: "https://res.cloudinary.com/dmenn07uc/video/upload/v1764248941/cassidy-line_hqbaim.mp4" },
  { src: "https://res.cloudinary.com/dmenn07uc/video/upload/v1764249246/double-b-line_k1slhz.mp4" },
  { src: "https://res.cloudinary.com/dmenn07uc/video/upload/v1764249259/vitao_avrmol.mp4" },
  { src: "https://res.cloudinary.com/dmenn07uc/video/upload/v1764248953/dane-line_ewryfw.mp4" },
];

export default function EmbroideryMeets() {
  const t = useTranslations();

  return (
    <section
      className="
        relative w-full 
        min-h-[480px] sm:h-[640px] 
        lg:h-screen
        overflow-hidden flex justify-between
      "
    >
      <Link href='/register'>
      {/* Mosaic Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden object-cover">
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
          {slides.map((slide, index) => (
            <div key={index} className="relative w-full h-full">
              <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                src={slide.src}
                preload="auto"
              />
            </div>
          ))}
        </div>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

        <div className="flex flex-col h-[640px] sm:h-full justify-between w-full">
     {/* Texto da esquerda */}
           <div className="absolute bottom-0 left-0  z-10 h-full flex items-start justify-center py-16">
             <motion.h2
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               transition={{ duration: 1 }}
               className="text-md sm:text-xl font-[HandoBold] uppercase text-left tracking-tighter text-white/70 max-w-4xl px-6"
             >
               {t("DesignPage.embroideryMeets")}
             </motion.h2>
           </div>
   
        
      {/* Texto da direita – agora bottom-right */}
            <div className="absolute bottom-6 right-0 z-10 p-6">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-md sm:text-xl font-[HandoRegular] uppercase tracking-tighter text-white/70 flex flex-row gap-2"
              >
                {t("DesignPage.explore")} <span>→</span>
              </motion.h2>
            </div>
      </div>
      </Link>
    </section>
  );
}
