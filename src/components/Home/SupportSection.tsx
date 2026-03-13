"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SupportSection() {
  const t = useTranslations("Support"); // make sure you have keys under "Support" in your messages file

  return (
    <section className="relative w-full py-20 bg-[#f5f5f5] flex justify-center items-center px-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-10 flex flex-col sm:flex-row justify-between gap-10">
        
        {/* Left side */}
        <div className="flex-1 flex flex-col justify-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-[HandoBold] tracking-tighter text-gray-900 mb-6"
          >
            {t("needMoreSupport")}
          </motion.h2>

          <p className="text-gray-600 mb-8 tracking-tighter font-[HandoRegular]">
            {t("supportDescription")}
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-black text-white rounded-full px-6 py-3 text-sm tracking-tighter font-[HandoRegular] hover:bg-gray-900 transition-all duration-300 w-fit"
          >
            {t("bookCall")}
          </Link>
        </div>

        {/* Right side */}
        <div className="flex-1 flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-gray-200 sm:pl-10 pt-10 sm:pt-0">
          <h3 className="text-2xl font-[HandoBold] tracking-tighter text-gray-900 mb-4">
            {t("checkFaqs")}
          </h3>
          <p className="text-gray-600 mb-8 tracking-tighter font-[HandoRegular]">{t("faqDescription")}</p>

          <Link
            href="/about#faq"
            className="inline-flex items-center justify-center tracking-tighter bg-black text-white rounded-full px-6 py-3 text-sm font-[HandoRegular] hover:bg-gray-900 transition-all duration-300 w-fit"
          >
            {t("checkFaqButton")}
          </Link>
        </div>
      </div>
    </section>
  );
}
