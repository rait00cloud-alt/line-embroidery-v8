"use client";

import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { NON_CUSTOM_PRODUCTS } from "@/data/nonCustomProducts";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { getColorHex } from "@/utils/colorMapping";
import { useCurrency } from "@/components/providers/CurrencyProvider";


export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug || "";
  const t = useTranslations("ProductPage");
  const { addToCart } = useCart();

  const product = NON_CUSTOM_PRODUCTS.find((p) => p.slug === slug) || NON_CUSTOM_PRODUCTS[0];

  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [activeTab, setActiveTab] = useState<"customize" | "details">("customize");
  const [added, setAdded] = useState(false);
  const { currency, format } = useCurrency();


  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      size: selectedSize,
      color: selectedColor,
      price: product.price,
      quantity: 1,
   designUrl: product.designUrl
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500); // volta ao estado normal depois de 1.5s
  };

  return (
    <div className="min-h-screen bg-white mt-18">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto text-sm text-gray-600 font-[HandoRegular]">
          <span className="hover:text-black cursor-pointer">{t("breadcrumb.all")}</span>
          <span className="mx-2">/</span>
          <span className="hover:text-black cursor-pointer">{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Product Image */}
          <div className="lg:col-span-7">
            <img
              src={product.designUrl}
              alt={product.name}
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>

          {/* Right: Product Info & Options */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h1 className="text-3xl font-[HandoBold]">{product.name}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-600 font-[HandoRegular]">
              <span>{product.sizes.length} {t("labels.size")}{product.sizes.length > 1 ? "s" : ""}</span>
              <span>•</span>
              <span>{product.colors.length} {t("labels.color")}</span>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-8 font-[HandoBold]">
                <button
                  onClick={() => setActiveTab("customize")}
                  className={`pb-3 text-sm transition-colors relative ${
                    activeTab === "customize"
                      ? "text-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t("labels.customizationOptions")}
                  {activeTab === "customize" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`pb-3 text-sm transition-colors relative ${
                    activeTab === "details"
                      ? "text-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t("labels.productDetails")}
                  {activeTab === "details" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "customize" ? (
              <div className="space-y-6 font-[HandoRegular]">
                {/* Sizes */}
                <div>
                  <h3 className="text-base font-[HandoBold] mb-3">{t("labels.size")}</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 text-sm font-medium border rounded-md transition-colors ${
                          selectedSize === size
                            ? "border-black bg-black text-white"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h3 className="text-base font-[HandoBold] mb-3">{t("labels.color")}</h3>
                  {/* Mobile: Horizontal scroll */}
                  <div className="md:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {product.colors.map((color) => {
                      const colorHex = getColorHex(color);
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className="relative group flex flex-col items-center shrink-0"
                          title={color}
                        >
                          <div
                            className={`w-12 h-12 rounded-full border-2 transition-all flex justify-center items-center relative ${
                              selectedColor === color
                                ? "border-black "
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            style={{
                              backgroundColor: colorHex,
                              boxShadow: colorHex === "#FFFFFF" ? "inset 0 0 0 1px rgba(0,0,0,0.1)" : undefined
                            }}
                          >
                            {selectedColor === color && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg
                                  className={`w-6 h-6 ${colorHex === "#FFFFFF" ? "text-black" : "text-white"}`}
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-600 mt-1 text-center font-[HandoRegular] leading-tight">
                            {color}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Desktop: Grid layout */}
                  <div className="hidden md:grid grid-cols-6 gap-3 max-h-32 overflow-y-auto">
                    {product.colors.map((color) => {
                      const colorHex = getColorHex(color);
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className="relative group flex flex-col items-center"
                          title={color}
                        >
                          <div
                            className={`w-12 h-12 rounded-full border-2 transition-all ${
                              selectedColor === color
                                ? "border-black scale-110"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            style={{
                              backgroundColor: colorHex,
                              boxShadow: colorHex === "#FFFFFF" ? "inset 0 0 0 1px rgba(0,0,0,0.1)" : undefined
                            }}
                          >
                            {selectedColor === color && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg
                                  className={`w-6 h-6 ${colorHex === "#FFFFFF" ? "text-black" : "text-white"}`}
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-600 mt-1 text-center font-[HandoRegular] leading-tight">
                            {color}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fulfillment */}
                <div>
                  <h3 className="text-base font-[HandoBold] mb-3">{t("labels.fulfillment")}</h3>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex items-start gap-3">
                    <Globe className="w-4 h-4 mt-1" />
                    <div>
                      <h4 className="font-[HandoBold]">{t("labels.internationalFulfillment")}</h4>
                      <p className="text-sm text-gray-600 font-[HandoRegular]">{t("labels.internationalFulfillmentDesc")}</p>
                    </div>
                  </div>
                </div>
                
                {/* Price & Add to Cart */}
                <div className="mt-4 flex flex-col gap-3 relative">
                  <div className="text-2xl font-[HandoBold]">{format(product.price)}</div>

                  <motion.button
                    onClick={handleAddToCart}
                    className="w-full py-6 rounded-md font-[HandoBold] relative overflow-hidden flex items-center justify-center"
                    style={{
                      backgroundColor: added ? "#22c55e" : "#000000",
                      color: "#ffffff"
                    }}
                  >
                    {/* Texto do botão */}
                    <motion.span
                      key="text"
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{ opacity: added ? 0 : 1, scale: added ? 0.8 : 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute"
                    >
                      {t("labels.addToCart")}
                    </motion.span>

                    {/* Ícone de check */}
                    <motion.div
                      key="check"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: added ? 1 : 0, scale: added ? 1 : 0.5 }}
                      transition={{ duration: 0.3 }}
                      className="absolute flex items-center justify-center"
                    >
                      <Check size={24} />
                    </motion.div>
                  </motion.button>
                </div>

              </div>
            ) : (
              <div className="space-y-4 text-sm font-[HandoRegular]">
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
