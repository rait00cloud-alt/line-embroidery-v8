"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "../../types/product";
import { useTranslations } from "next-intl";
import { getColorHex } from "../../utils/colorMapping";
import { useCurrency } from "../providers/CurrencyProvider";

export default function ProductCardNon3D({ product }: { product: Product }) {
  const t = useTranslations();
  const { format } = useCurrency();

  return (
    <Link href={`/vintage/${product.slug}`} className="group">
      <div className="bg-white cursor-pointer transition border border-black/20 p-4 flex flex-col h-full">
        {/* Image */}
        <div className="w-full h-64 mb-6 overflow-hidden rounded-lg">
          <img
            src={product.photos && product.colors && product.colors[0] && product.photos[product.colors[0]] 
              ? product.photos[product.colors[0]][0] 
              : product.designUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-2 flex-1">
          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2 min-h-[20px]">
              {product.colors.slice(0, 3).map((color, index) => (
                <span
                  key={index}
                  className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                ></span>
              ))}
              {product.colors.length > 3 && (
                <span className="text-xs text-gray-500 font-[HandoRegular] ml-1 flex-shrink-0">
                  +{product.colors.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Name + Description */}
          <h2 className="text-md font-[HandoBold] tracking-tight min-h-[24px] flex items-center">
            {product.name}
          </h2>
          <p className="text-xs text-gray-600 font-[HandoBold] min-h-[16px] flex items-center">
            {product.description}
          </p>

          {/* Price */}
           <p className="text-sm font-[HandoRegular] min-h-[20px] flex items-center">
          <span className="text-gray-400">{t("from")}</span>{" "}
          {format(product.price)}
        </p>

          {/* Hover Button */}
          <div className="mt-auto">
            <motion.div
              initial={{ opacity: 1, y: 5 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 px-4 py-2 bg-black text-center text-white font-[HandoBold] rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition"
            >
              {t("buy_now")}
            </motion.div>
          </div>
        </div>
      </div>
    </Link>
  );
}
