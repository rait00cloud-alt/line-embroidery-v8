'use client'; 

import { use } from 'react';
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import CreateContainer from "@/components/About/CreateContainer";
import ProductsCarouselContainer from "@/components/About/ProductsContainer";
import VideoFeatureContainer from "@/components/About/QualityContainer";
import CasesContainer from "@/components/About/CasesContainer";
import Countries3DSection from "@/components/About/Worldwide";
import FAQContainer from "@/components/About/FAQContainer";
  import { useLocale } from "next-intl";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function HomePage({ params }: Props) {
   const tProducts = useTranslations("products"); // navigation texts
  
   const fadeUp = {
      hidden: { opacity: 0, y: 20 },
      show: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { 
            delay: i * 0.15, 
            duration: 0.5, 
            ease: "easeOut" as const // <--- Add this
        },
      }),
    };
  
  const locale = useLocale();
  
  return (
    <main  className='' >
         <nav
  className={`
    flex gap-4 px-4 py-2 mt-18 border-b border-black/20 w-full 
    overflow-x-auto whitespace-nowrap scrollbar-hide
    ${locale === "pt" ? "justify-start" : "justify-center"}
  `}>
      {/* All */}
      <motion.div custom={0} initial="hidden" animate="show" variants={fadeUp}>
        <Link
          href="/products" 
          className="text-sm font-[HandoRegular] hover:underline hover:decoration-2 underline-offset-13"
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

    

      {/* Services */}
      <motion.div custom={4} initial="hidden" animate="show" variants={fadeUp}>
        <Link
          href="/enterprise"
          className="text-sm font-[HandoRegular] hover:underline hover:decoration-2 underline-offset-13"
        >
          {tProducts("nav.services")}
        </Link>
      </motion.div>
        {/* About */}
      <motion.div custom={3} initial="hidden" animate="show" variants={fadeUp}>
        <Link
          href="/about"
          className="text-sm font-[HandoRegular] underline decoration-2 underline-offset-13"
        >
          {tProducts("nav.about")}
        </Link>
      </motion.div>
    </nav>
    <div className="relative flex flex-col p-4 overflow-hidden">
        {/* 🔹 Background Video */}
        <video
        src="/videos/line-embroidery-v1.mp4" 
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-20"
        >
          
        </video>

        <div className="absolute inset-0 bg-black/40 z-30" />
        

        {/* 🔹 Foreground Content */}
        <div className="relative z-40">
          <CreateContainer />
          <ProductsCarouselContainer /> 
          <VideoFeatureContainer />
          <Countries3DSection />
          <FAQContainer />
        </div>
      </div>

    </main>
  );
}