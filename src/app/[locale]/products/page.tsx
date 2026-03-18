"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import ProductCard from "../../../components/ProductCard";
import { PRODUCTS } from "../../../data/products";
import { useLocale } from "next-intl";
import LogoGeneratorPopup from "../../../ui/LogoGeneratorPopup";

export default function ProductsPage() {
  const pathname = usePathname();
  const t = useTranslations("products");
  const locale = useLocale();

  type FiltersState = {
    type: string[];
    size: string[];
    color: string[];
    price: string[];
  };

  const [filters, setFilters] = useState<FiltersState>({
    type: [],
    size: [],
    color: [],
    price: [],
  });

  const ALL_PRODUCTS = [...PRODUCTS]; // apenas produtos custom

  // Filtragem
  const filteredProducts = ALL_PRODUCTS.filter((product) => {
    const { type = [], size = [], color = [], price = [] } = filters;

    if (type.length > 0 && !type.includes(product.name)) return false;
    if (size.length > 0 && !product.sizes?.some((s) => size.includes(s))) return false;
    if (color.length > 0 && !product.colors?.some((c) => color.includes(c))) return false;
    if (price.length > 0) {
      const matchesPrice = price.some((range) => {
        if (range === "Under $15") return product.price < 15;
        if (range === "$15 - $25") return product.price >= 15 && product.price <= 25;
        if (range === "$25 - $35") return product.price >= 25 && product.price <= 35;
        if (range === "Over $35") return product.price > 35;
        return false; // garante boolean
      });
      if (!matchesPrice) return false;
    }

    return true;
  });

  // -----------------------------
  // Links de navegação
  // -----------------------------
  const links = [
    { href: "/", label: t("nav.all") },
    { href: "/products/hats", label: t("nav.hats") },
    { href: "/products/hoodies", label: t("nav.hoodies") },
    { href: "/products/shirts", label: t("nav.shirts") },
  ];

  return (

    <>
    <div className="py-6 w-full flex flex-col items-center justify-center mt-12">

    

      {/* Navigation */}
       <nav
        className={`
          flex gap-4 px-4 -translate-y-2  border-b border-black/20 w-full 
          overflow-x-auto whitespace-nowrap scrollbar-hide
          ${locale === "pt" ? "justify-start" : "justify-center"}
        `}
      >
        {links.map((link, idx) => (
          <motion.div
            key={idx}
            custom={idx}
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0, y: -10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 * (idx + 1) } }
            }}
          >
      
          </motion.div>
        ))}
      </nav>


      {/* Products grid */}
      {filteredProducts.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.2 }
            }
          }}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 mt-10 gap-4 px-2"
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.slug}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ProductCard product={product} />
            </motion.div>
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
    
    
    <LogoGeneratorPopup />

    </>
  );
}
