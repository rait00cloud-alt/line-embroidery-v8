"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function InfoPretty() {
  const t = useTranslations();
  return (
    <section className="relative bg-[#0a0a0a] text-white py-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-pink-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-[420px] h-[420px] bg-indigo-500/10 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {[t('about.title'), t('about.description'), t('about.created')].map((text, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
          >
            <p className="font-[HandoRegular] text-white/80 text-base leading-relaxed">{text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}





