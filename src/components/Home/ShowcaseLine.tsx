"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function ShowcaseLine() {
  const t = useTranslations();

  return (
    <section className="w-full  pt-16 pb-8">
      <div className="relative w-full h-screen overflow-hidden rounded-b-4xl shadow-xl">
        {/* Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover  "
          src="/videos/line-embroidery-v1.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Overlay */}
        <div className="absolute inset-0 translate-y-40  flex items-center justify-center px-6">
          <div className="max-w-xl bg-black/70 p-4 w-full flex flex-col items-center text-center gap-2 rounded-xl">
            <p className="text-sm tracking-tight text-white/80 font-[HandoBold]">
              {t("showcase.custom.subtitle")}
            </p>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-5xl   text-white tracking-tighter font-[HandoBold]"
            >
              {t("showcase.custom.title")}
            </motion.h2>

            <div className="w-full flex flex-col gap-3 mt-4">
              <Link
                href="/register"
                className="bg-white text-black hover:bg-gray-100 px-5 py-3 rounded-sm font-[HandoBold] transition text-center"
              >
                {t("showcase.explore")}
              </Link>

              <Link
                href="/products"
                className="bg-white/10 border border-white/30 text-white hover:bg-white/20 px-5 py-3 rounded-sm font-[HandoBold] transition text-center"
              >
                {t("showcase.configure")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
