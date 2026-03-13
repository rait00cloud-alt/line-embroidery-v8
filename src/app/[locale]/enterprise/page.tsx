'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

import EnterpriseContainer from '@/components/Enterprise/EnterpriseContainer';
import FormContainer from '@/components/Enterprise/FormContainer';
import TagCard from "@/components/Enterprise/BlanksContainer";
import { WashingMachine, Globe, FileCheck, ChartNoAxesCombined } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function EnterprisePage({ params }: Props) {
  const tProducts = useTranslations("products");
  const tCarousel = useTranslations("carousel");
  const locale = useLocale();

  // Variants simples
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Navegação
  const navLinks = [
    { href: "/products", label: tProducts("nav.all") },
    { href: "/products/hats", label: tProducts("nav.custom") },
    { href: "/vintage", label: tProducts("nav.vintage") },
    { href: "/enterprise", label: tProducts("nav.services") },
    { href: "/about", label: tProducts("nav.about") },
    
  ];

  return (
    <main className="mt-18">
      {/* Navigation */}
      <nav
        className={`
          flex gap-4  py-2  border-b border-black/20 w-full 
          overflow-x-auto whitespace-nowrap scrollbar-hide
          ${locale === "pt" ? "justify-start" : "justify-center"}
        `}
      >
        {navLinks.map((link, i) => (
          <motion.div
            key={link.href}
            custom={i} // passa índice para usar no transition
            initial="hidden"
            animate="show"
            variants={fadeUpVariants}
            transition={{ delay: i * 0.15, duration: 0.5, ease: "easeOut" }}
          >
            <Link
              href={link.href}
              className={`
                text-sm font-[HandoRegular] underline-offset-13
                ${link.href === "/enterprise" ? "underline decoration-2" : "hover:underline hover:decoration-2"}
              `}
            >
              {link.label}
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* Page content */}
      <div className="flex flex-col overflow-hidden p-4">
        <EnterpriseContainer />
        <div className="w-full flex justify-center items-center bg-[#f5f5f5]">
        <div className="flex flex-col sm:grid sm:grid-cols-2 max-h-max max-w-max justify-center items-center">
        <TagCard
          paragraphs={[
            tCarousel("hero_description_01"),
          ]}
          bottomContent={
        <>
          <WashingMachine size={28} />

        </>
      }

        />

          <TagCard
          paragraphs={[
            tCarousel("hero_description_02"),
          ]}
          bottomContent={
        <>
          <FileCheck size={28} />

        </>
      }

        />
          <TagCard
          paragraphs={[
            tCarousel("hero_description_03"),
          ]}
          bottomContent={
        <>
          <Globe size={28} />

        </>
      }

        />
          <TagCard
          paragraphs={[
            tCarousel("hero_description_04"),
          ]}
          bottomContent={
        <>
          <ChartNoAxesCombined size={28} />

        </>
      }

        />
        </div>
        </div>
  
        <FormContainer />
      </div>
    </main>
  );
}
