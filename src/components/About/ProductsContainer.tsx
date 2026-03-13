"use client";

import React, { useRef, useState } from "react";
import ProductCard from "../ProductCard";
import { PRODUCTS } from "../../data/products";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const ProductsCarouselContainer: React.FC = () => {
  const t = useTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Update scroll progress
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const progress = scrollLeft / (scrollWidth - clientWidth);
    setScrollProgress(progress);
  };

  return (
    <section className="py-8 px-4 w-full flex justify-center items-center flex-col">
      {/* Title */}
      <div className="flex flex-col justify-center items-center text-center gap-4 max-w-xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-[HandoBold] text-white"
        >
          {t("home.product_title")}
        </motion.h2>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-xl font-[HandoRegular] text-white/70"
        >
          {t("home.product_subtitle")}
        </motion.h2>

        {/* Links */}
        <div className="flex flex-row justify-center items-center gap-4 mt-4">
          <motion.a
            whileHover={{ background: "black" }}
            transition={{ duration: 0.3, ease: "easeIn" }}
            href="/products"
            className="border border-white rounded-sm px-4 py-1 flex justify-center items-center"
          >
            <span className="font-[HandoBold] text-lg text-white flex justify-center items-center gap-2 hover:text-white">
              {t("products.hats")} <span className="text-xs">↗</span>
            </span>
          </motion.a>

          <motion.a
            initial={{ backgroundColor: "#000000" }}
            whileHover={{ backgroundColor: "#ffffff" }}
            transition={{ duration: 0.3, ease: "easeIn" }}
            href="/products"
            className="border border-white rounded-sm px-4 py-1 flex justify-center items-center"
          >
            <motion.span
              initial={{ color: "#ffffff" }}
              whileHover={{ color: "#000000" }}
              transition={{ duration: 0.3, ease: "easeIn" }}
              className="font-[HandoBold] text-lg flex justify-center items-center gap-2"
            >
              {t("products.all")} <span className="text-xs">↗</span>
            </motion.span>
          </motion.a>
        </div>
      </div>

      {/* Carousel */}
      <div className="w-full mt-8 relative">
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide sm:justify-center sm:items-center"
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 min-w-[80%] sm:min-w-[20%] lg:min-w-[20%]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-1/2 w-full max-w-12 h-1 bg-white/20 rounded sm:hidden translate-y-8 -translate-x-8">
          <div
            className="h-full bg-white rounded "
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
};

export default ProductsCarouselContainer;
