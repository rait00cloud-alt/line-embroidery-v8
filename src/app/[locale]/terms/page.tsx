'use client';

import { use } from 'react';
import { motion, easeOut } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function TermsPage({ params }: Props) {
  const t = useTranslations("terms");
  const { locale } = use(params);

  const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: easeOut,
    },
  }),
};

  const sections = [
  "definitions",
  "general",
  "orders_labwearos",
  "formation",
  "prices",
  "billing",
  "delivery",
  "taking_delivery",
  "delivery_times",
  "retention",
  "no_warranty",
  "inspection_claims",
  "liability",
  "force_majeure",
  "execution_third",
  "authorizations",
  "ip_rights",
  "remedies",
  "law_court",
  "amendments"
];


  return (
    <main className="bg-gray-100 min-h-screen py-24">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
        }}
        className="flex flex-col p-6 md:p-10 max-w-4xl mx-auto bg-white rounded-xl shadow-lg font-[HandoRegular]"
      >
        <motion.h1
          variants={fadeUp}
          custom={0}
          className="text-3xl md:text-4xl font-[HandoBold] mb-8 text-center"
        >
          {t("title")}
        </motion.h1>

        {sections.map((sectionKey, index) => (
          <motion.section
            key={sectionKey}
            variants={fadeUp}
            custom={index + 1}
            className="mb-10"
          >
            <h2 className="text-xl font-[HandoBold] mb-4">{t(`${sectionKey}.title`)}</h2>
            <p>{t(`${sectionKey}.content`)}</p>
          </motion.section>
        ))}

        {/* Logo no final */}
        <motion.div variants={fadeUp} custom={sections.length + 1} className="flex justify-center mt-8">
          <img
            src="/logo/line-embroidery-logo.png"
            alt="Line Embroidery Logo"
            className="max-w-[80px]"
          />
        </motion.div>
      </motion.div>
    </main>
  );
}
