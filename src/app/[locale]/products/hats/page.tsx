"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

import FiltersBar from "../../../../components/Products/FiltersBar";
import ProductCard from "../../../../components/ProductCard";
import { PRODUCTS } from "../../../../data/products";
import { useLocale } from "next-intl";
import { Variants, Easing } from "framer-motion";

export default function HatsPage() {
  const t = useTranslations("products");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
const hats = PRODUCTS.filter(p => p.slug.includes("hat"));
 const filteredProducts = PRODUCTS.filter((product) => {
  return Object.entries(filters).every(([key, values]) => {
    if (values.length === 0) return true;

    // --- TYPE → modelKey mapping ---
    if (key === "type") {
      return values.includes(
        {
          snapback: "Snapback",
          trucker: "Trucker Hat",
          panel: "5 Panel Hat",
          hat: "Baseball Cap",
        }[product.modelKey]
      );
    }

    // --- ARRAY fields (colors, sizes) ---
    if (Array.isArray(product[key])) {
      return product[key].some((v: string) => values.includes(v));
    }

    // --- STRING fields ---
    return values.includes(String(product[key]));
  });
});

const locale = useLocale();
  const applyHatFilter = (typeValue: string) => {
    const newFilters = {
      type: [typeValue],
      size: [],
      color: [],
      price: [],
    };
    setFilters(newFilters);
  };

const ease: Easing = [0.42, 0, 0.58, 1]; // equivalente a easeInOut

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, duration: 0.5, ease }
  }),
};


  return (
    <div className="py-6 w-full flex flex-col items-center justify-center overflow-hidden mt-12">

      {/* Navigation */}
          <nav
  className={`
    flex gap-4 px-4 py-2 mb-10 border-b border-black/20 w-full 
    overflow-x-auto whitespace-nowrap scrollbar-hide
    ${locale === "pt" ? "justify-start" : "justify-center"}
  `}
>
        <motion.div custom={0} initial="hidden" animate="show" variants={fadeUp}>
          <Link
            href="/products"
            className="text-sm font-[HandoRegular] hover:underline hover:decoration-2 underline-offset-13"
          >
            {t("nav.all")}
          </Link>
        </motion.div>

        <motion.div custom={1} initial="hidden" animate="show" variants={fadeUp}>
          <Link
            href="/products/hats"
            className="text-sm font-[HandoRegular] underline decoration-2 underline-offset-13"
          >
            {t("nav.custom")}
          </Link>
        </motion.div>

        <motion.div custom={2} initial="hidden" animate="show" variants={fadeUp}>
          <Link
            href="/vintage"
            className="text-sm font-[HandoRegular] hover:underline hover:decoration-2 underline-offset-13"
          >
            {t("nav.vintage")}
          </Link>
        </motion.div>

        <motion.div custom={3} initial="hidden" animate="show" variants={fadeUp}>
          <Link
            href="/enterprise"
            className="text-sm font-[HandoRegular] hover:underline hover:decoration-2 underline-offset-13"
          >
            {t("nav.services")}
          </Link>
        </motion.div>

        <motion.div custom={3} initial="hidden" animate="show" variants={fadeUp}>
          <Link
            href="/about"
            className="text-sm font-[HandoRegular] hover:underline hover:decoration-2 underline-offset-13"
          >
            {t("nav.about")}
          </Link>
        </motion.div>
      </nav>

      {/* Title */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.2 } } }}
        className="flex flex-col gap-4 py-2 sm:py-8 max-w-max justify-center items-center px-4"
      >
        <motion.h1 variants={fadeUp} custom={0} className="text-3xl font-[HandoBold]">
          {t("nav.hats")}
        </motion.h1>
        <motion.p variants={fadeUp} custom={1} className="text-gray-500 mt-2 font-[HandoRegular] px-2 text-center">
          {t("page_hats")}
        </motion.p>
      </motion.div>

      {/* Example hat types */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
        }}
        className="overflow-x-hidden w-full py-4 flex justify-center items-center"
      >
        <motion.div
          className="flex gap-4 justify-center items-center"
          drag="x"
          dragConstraints={{ left: -150, right: 150 }}
          whileTap={{ cursor: "grabbing" }}
        >
          {[
            { img: "/photos/snapback/panel-1.png", label: t("nav.snap"), filter: "Snapback" },
            { img: "/photos/hat/black-1.png", label: t("nav.base"), filter: "Baseball Cap" },
            { img: "/photos/trucker/black-1.png", label: t("nav.trucker"), filter: "Trucker Hat" },
            { img: "/photos/panel/panel.png", label: t("nav.panel"), filter: "5 Panel Hat" },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => applyHatFilter(item.filter)}
              className="shrink-0 flex flex-col bg-[#f5f5f5]/40 shadow-xl justify-center items-center w-[160px] h-[200px] rounded-xl border border-black/80 p-2 cursor-pointer hover:scale-[1.02] transition"
            >
              <img src={item.img} className="w-24 h-24 object-contain mb-2" />
              <p className="text-gray-500 font-[HandoRegular] text-center tracking-tight">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Filters */}
      {/* <FiltersBar onFilterChange={setFilters} productCount={filteredProducts.length} 
      variant="hats"
  products={hats}/> */}

      {/* Products grid */}
      {filteredProducts.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 mt-10 gap-4"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </motion.div>
      ) : (
        <div className="flex justify-center items-center h-[200px] w-full">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-gray-400 font-[HandoRegular]"
          >
            {t("no_products")}
          </motion.p>
        </div>
      )}
    </div>
  );
}
