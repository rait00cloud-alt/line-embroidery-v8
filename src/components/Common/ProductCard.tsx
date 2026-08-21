"use client";

import React from "react";
import Link from "next/link";
import type { Product } from "../../types/product";
import { motion } from "framer-motion";
import { getColorHex } from "../../utils/colorMapping";
import { useTranslations } from "next-intl";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export default function ProductCard({ product }: { product: Product }) {
  const t = useTranslations();
  const { format } = useCurrency();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="cursor-pointer border border-black/20 p-4 flex flex-col relative h-full bg-white rounded-2xl "
    >
      {/* Image */}
      <div className="w-full h-64 mb-6 overflow-hidden rounded-lg flex justify-center items-center">
        <img
          src={
            product.photos &&
            product.colors &&
            product.colors[0] &&
            product.photos[product.colors[0]]
              ? product.photos[product.colors[0]][0]
              : product.designUrl
          }
          alt={product.name}
          className="w-full h-full object-contain max-w-48 transition-transform duration-300"
        />
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-2 flex-1">
        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <motion.div
            className="flex items-center gap-2 min-h-[20px]"
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {product.colors.slice(0, 3).map((color, index) => (
              <span
                key={index}
                className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: getColorHex(color) }}
                title={color}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-xs text-white/70 font-[HandoRegular] ml-1 shrink-0">
                +{product.colors.length - 3}
              </span>
            )}
          </motion.div>
        )}

        {/* Name */}
        <motion.h2 className="text-md font-[HandoBold] tracking-tight min-h-[24px] text-black">
          {product.name}
        </motion.h2>

        {/* Description */}
        <motion.p className="text-xs font-[HandoBold] min-h-[16px] text-gray-600">
          {product.description}
        </motion.p>

        {/* Price */}
        <p className="text-sm font-[HandoRegular] min-h-[20px] text-black">
          <span className="text-gray-400">{t("from")}</span> {format(product.price)}
        </p>

        {/* Button */}
        <Link href={`/products/${product.slug}`} className="mt-auto">
          <motion.div className="mt-2 px-4 py-2 text-center font-[HandoBold] rounded-lg shadow-md bg-black text-white">
            {t("design_now")}
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
