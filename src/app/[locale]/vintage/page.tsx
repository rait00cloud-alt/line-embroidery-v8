"use client";

import { useState } from "react";
import { motion, easeOut } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import FiltersBar from "../../../components/Products/FiltersBar";
import ProductCardNon3D from "../../../components/Products/ProductCardNon3D";
import { NON_CUSTOM_PRODUCTS } from "../../../data/nonCustomProducts";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useCurrency } from "@/components/providers/CurrencyProvider";


export default function VintagePage() {
  const tVintage = useTranslations("vintage"); // vintage texts
  const tProducts = useTranslations("products"); // navigation texts
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const { currency, format } = useCurrency();

  const filteredProducts = NON_CUSTOM_PRODUCTS.filter((product) => {
    return Object.entries(filters).every(([filterKey, filterValues]) => {
      if (!filterValues || filterValues.length === 0) return true;

      switch (filterKey) {
        case "type":
          const typeMapping: Record<string, string> = {
            "Line Embroidery": "line",
            "Blanks": "blank",
          };

          return filterValues.some(
            (value) => typeMapping[value] === product.modelKey
          );


        case "size":
          if (Array.isArray(product.sizes)) {
            return filterValues.some(size => product.sizes?.includes(size));
          }
          return filterValues.includes("One Size");

        case "color":
          if (Array.isArray(product.colors)) {
            return filterValues.some(color =>
              product.colors?.some(c => c.toLowerCase() === color.toLowerCase())
            );
          }
          return false;

        case "price":
          return filterValues.some(range => {
            const price = product.price;
            if (range === "Under $15") return price < 15;
            if (range === "$15 - $25") return price >= 15 && price <= 25;
            if (range === "$25 - $35") return price >= 25 && price <= 35;
            if (range === "Over $35") return price > 35;
            return false;
          });

        default:
          return true;
      }
    });
  });

  const locale = useLocale();

  const pathname = usePathname();
  const navLinks = [
    { href: "/", label: tProducts("nav.all") },
    { href: "/products/hats", label: tProducts("nav.custom") },
    { href: "/vintage", label: tProducts("nav.vintage") },
    { href: "/about", label: tProducts("nav.about") },
    { href: "/enterprise", label: tProducts("nav.services") },
  ];

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
    <div className="py-6 w-full flex flex-col items-center justify-center overflow-hidden mt-16">

      {/* Navigation */}
      <nav
        className={`
    flex gap-4 px-4 py-2 mb-10 border-b border-black/20 w-full
    overflow-x-auto whitespace-nowrap scrollbar-hide
    ${locale === "pt" ? "justify-start" : "justify-center"}
  `}
      >
        {/* All */}
        <motion.div custom={0} initial="hidden" animate="show" variants={fadeUp}>
          <Link
            href="/products"
            className={`text-sm font-[HandoRegular] underline-offset-13 ${
              pathname === "/products" ? "underline decoration-2" : "hover:underline hover:decoration-2"
            }`}
          >
            {tProducts("nav.all")}
          </Link>
        </motion.div>

        {/* Custom */}
        <motion.div custom={1} initial="hidden" animate="show" variants={fadeUp}>
          <Link
            href="/products/hats"
            className={`text-sm font-[HandoRegular] underline-offset-13 ${
              pathname === "/products/hats" ? "underline decoration-2" : "hover:underline hover:decoration-2"
            }`}
          >
            {tProducts("nav.custom")}
          </Link>
        </motion.div>

        {/* Vintage */}
        <motion.div custom={2} initial="hidden" animate="show" variants={fadeUp}>
          <Link
            href="/vintage"
            className={`text-sm font-[HandoRegular] underline-offset-13 underline decoration-2 hover:underline hover:decoration-2"`}
          >
            {tProducts("nav.vintage")}
          </Link>
        </motion.div>


        {/* Services */}
        <motion.div custom={4} initial="hidden" animate="show" variants={fadeUp}>
          <Link
            href="/enterprise"
            className={`text-sm font-[HandoRegular] underline-offset-13 ${
              pathname === "/enterprise" ? "underline decoration-2" : "hover:underline hover:decoration-2"
            }`}
          >
            {tProducts("nav.services")}
          </Link>
        </motion.div>
        {/* About */}
        <motion.div custom={3} initial="hidden" animate="show" variants={fadeUp}>
          <Link
            href="/about"
            className={`text-sm font-[HandoRegular] underline-offset-13 ${
              pathname === "/about" ? "underline decoration-2" : "hover:underline hover:decoration-2"
            }`}
          >
            {tProducts("nav.about")}
          </Link>
        </motion.div>

      </nav>
      {/* Title */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.2 } } }}
        className="text-center mb-8"
      >
        <motion.h1 variants={fadeUp} custom={0} className="text-3xl font-[HandoBold]">
          {tVintage("page_title")}
        </motion.h1>
        <motion.p variants={fadeUp} custom={1} className="text-gray-500 mt-2 font-[HandoRegular]">
          {tVintage("page_subtitle")}
        </motion.p>
      </motion.div>

      <div className="w-full flex flex-row gap-8 justify-center item-center">
        {/* Line Embroidery card */}
        <motion.div
          onClick={() => setFilters({ type: ["Line Embroidery"] })}
          className="cursor-pointer flex flex-col bg-[#f5f5f5]/40 shadow-xl justify-center items-center max-w-max rounded-xl border-1 border-black/80 p-2 mb-10"
        >
          <motion.img
            src="/images/hat.png"
            className="max-w-[124px] sm:max-w-[232px]"
            variants={fadeUp}
            custom={0}
          />
          <motion.p variants={fadeUp} custom={1} className="text-gray-500 font-[HandoRegular] tracking-tight">
            {tVintage("nav.line_embroidery")}
          </motion.p>
        </motion.div>


        {/* Blank card
        <motion.div
          onClick={() => setFilters({ type: ["Blank"] })}
          className="cursor-pointer flex flex-col bg-[#f5f5f5]/40 shadow-xl justify-center items-center max-w-max rounded-xl border-1 border-black/80 p-2 mb-10"
        >
          <motion.img
            src="/photos/blanks/shirt.png"
            className="invert max-w-[124px] sm:max-w-[232px]"
            variants={fadeUp}
            custom={0}
          />
          <motion.p variants={fadeUp} custom={1} className="text-gray-500 font-[HandoRegular] tracking-tight">
            {tVintage("nav.blanks")}
          </motion.p>
        </motion.div> */}

      </div>

      <FiltersBar
        onFilterChange={setFilters}
        variant="vintage"
        productCount={filteredProducts.length}
        products={NON_CUSTOM_PRODUCTS}
      />

      {/* Product Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4"
      >
        {filteredProducts.map((product, i) => (
          <motion.div key={product.slug} variants={fadeUp} custom={i}>
            <ProductCardNon3D product={product} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
