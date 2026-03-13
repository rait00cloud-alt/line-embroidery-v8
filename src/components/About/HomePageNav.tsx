'use client';

import { motion, easeOut } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function HomePageNav() {
  const tProducts = useTranslations("products"); // navigation texts

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


  return (
    <nav className="flex gap-4 py-2 mb-10 justify-center border-b-1 border-black/20 w-full">
      {/* All */}
      <motion.div custom={0} initial="hidden" animate="show" variants={fadeUp}>
        <Link
          href="/"
          className="text-sm font-[HandoRegular] underline decoration-2 underline-offset-13"
        >
          {tProducts("nav.all")}
        </Link>
      </motion.div>

      {/* Custom */}
      <motion.div custom={1} initial="hidden" animate="show" variants={fadeUp}>
        <Link
          href="/products/hats"
          className="text-sm font-[HandoRegular] hover:underline hover:decoration-2 underline-offset-13"
        >
          {tProducts("nav.custom")}
        </Link>
      </motion.div>

      {/* Vintage */}
      <motion.div custom={2} initial="hidden" animate="show" variants={fadeUp}>
        <Link
          href="/vintage"
          className="text-sm font-[HandoRegular] hover:underline hover:decoration-2 underline-offset-13"
        >
          {tProducts("nav.vintage")}
        </Link>
      </motion.div>

      {/* About */}
      <motion.div custom={3} initial="hidden" animate="show" variants={fadeUp}>
        <Link
          href="/about"
          className="text-sm font-[HandoRegular] hover:underline hover:decoration-2 underline-offset-13"
        >
          {tProducts("nav.about")}
        </Link>
      </motion.div>

      {/* Services */}
      <motion.div custom={4} initial="hidden" animate="show" variants={fadeUp}>
        <Link
          href="/enterprise"
          className="text-sm font-[HandoRegular] hover:underline hover:decoration-2 underline-offset-13"
        >
          {tProducts("nav.services")}
        </Link>
      </motion.div>
    </nav>
  );
}
