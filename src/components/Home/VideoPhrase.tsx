"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";


export default function VideoPhrase() {
  const t = useTranslations();
  
  return (
    <section className={`relative w-full sm:h-[60vh] h-[40vh] min-h-32 overflow-hidden`}>
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src='https://res.cloudinary.com/dmenn07uc/video/upload/v1764248943/line-embroidery-logo-animated_bwfdjg.mp4'
      />
      <div className="absolute inset-0 bg-black/30" />
      
      <div className="relative z-10 h-full flex items-end justify-center py-8">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1}}
          transition={{ duration: 1 }}
          className="text-xl sm:text-4xl font-[HandoRegular] uppercase text-left tracking-tighter text-white/70  max-w-4xl sm:max-w-6xl px-6"
        >
          {t("DesignPage.designed_by")}
        </motion.h2>
      </div>
    </section>
  );
}



