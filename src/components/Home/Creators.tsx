"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Creators() {
  const t = useTranslations();
  
  return (
    <section className="relative w-full h-[640px] sm:h-screen overflow-hidden flex justify-between">
      <Link href="/register" className="w-full h-full block relative">

        {/* Texto da esquerda */}
        <div className="absolute bottom-0 left-0  z-10 h-full flex items-start justify-center py-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-md sm:text-xl font-[HandoBold] uppercase text-left tracking-tighter text-white/70 max-w-4xl px-6"
          >
            {t("DesignPage.meet")}
          </motion.h2>
        </div>

        {/* Vídeo de fundo */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          src="https://res.cloudinary.com/dmenn07uc/video/upload/v1764248939/alber-line-black-camel_nddydp.mp4"
        />

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

      </Link>
    </section>
  );
}
