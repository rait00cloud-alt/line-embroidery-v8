"use client";

import { useState } from "react";
import { motion, easeOut } from "framer-motion";

import { useTranslations } from "next-intl";
import Link from "next/link";

import FiltersBar from "../../../../components/Products/FiltersBar";
import ProductCard from "../../../../components/Common/ProductCard";
import { PRODUCTS } from "../../../../data/products";

export default function ShirtsPage() {
  const t = useTranslations("products");
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const filteredProducts = PRODUCTS.filter((product) => {
    return Object.entries(filters).every(([key, values]) => {
      if (!values || values.length === 0) return true;
      const productValue = product[key as keyof typeof product];
      return values.includes(productValue as string);
    });
  });

  // Animation variants
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
    <div className=" py-10 w-full flex flex-col items-center justify-center overflow-hidden mt-12">
      {/* Navigation */}
      <nav className="flex gap-6 py-2 mb-10 justify-center border-b-1 border-black/20 w-full">
        {[
          { href: "/", label: t("nav.all") },
          { href: "/products/hats", label: t("nav.hats") },
          { href: "/products/hoodies", label: t("nav.hoodies") },
          { href: "/products/shirts", label: t("nav.shirts") },
        ].map((link, i) => (
          <motion.div
            key={link.href}
            custom={i}
            initial="hidden"
            animate="show"
            variants={fadeUp}
          >
            <Link
              href={link.href}
              className={`text-sm font-[HandoRegular] underline-offset-13 hover:underline ${
                link.href === "/products/shirts" ? "underline decoration-2" : ""
              }`}
            >
              {link.label}
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* Title */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.2 } },
        }}
        className="flex flex-col gap-4 py-2 sm:py-8 max-w-max justify-center items-center px-4"
      >
        <motion.h1
          variants={fadeUp}
          custom={0}
          className="text-3xl font-[HandoBold]"
        >
          {t("nav.shirts")}
        </motion.h1>
        <motion.p
          variants={fadeUp}
          custom={1}
          className="text-gray-500 mt-2 font-[HandoRegular] px-2 text-center"
        >
          {t("page_shirts")}
        </motion.p>
      </motion.div>

      {/* Example shirt types */}
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
          dragConstraints={{ left: 0, right: 0 }}
          whileTap={{ cursor: "grabbing" }}
        >
          {[
            { href: "/products/shirts", img: "/tech/t-shirt.jpg", label: t("nav.shirts") },
          ].map((item, idx) => (
            <Link key={idx} href={item.href}>
              <div className="flex-shrink-0 flex flex-col bg-[#f5f5f5]/40 shadow-xl justify-center items-center w-[160px] h-[200px] rounded-xl border border-black/80 p-2">
                <img src={item.img} className="w-24 h-24 object-contain mb-2" />
                <p className="text-gray-500 font-[HandoRegular] text-center tracking-tight">
                  {item.label}
                </p>
              </div>
            </Link>
          ))}
        </motion.div>
      </motion.div>

      {/* Filters */}
      {/* <FiltersBar products={PRODUCTS} onFilterChange={setFilters} /> */}

      {/* No Products Message */}
      
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
      
    </div>
  );
}
