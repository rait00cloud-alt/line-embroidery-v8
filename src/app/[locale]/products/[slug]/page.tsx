"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import ProductViewer from "@/components/Common/ProductViewer";
import { PRODUCTS } from "@/data/products";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import { getColorHex } from "@/utils/colorMapping";
import Image from "next/image";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug || "";
  const t = useTranslations("ProductPage");
  const { addToCart } = useCart();

  const product = PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];
  const otherProducts = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 6);

  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"customize" | "details">("customize");
  const [selectedPriceTier, setSelectedPriceTier] = useState(0);
  const [added, setAdded] = useState(false);
  const [showPriceGuide, setShowPriceGuide] = useState(false);
  const { currency, format } = useCurrency();

  const selectedColorHex = getColorHex(selectedColor); 

  const selectedPhotos = product.photos?.[selectedColor] || [];
  const mainPhoto = selectedPhotos.length > 0 ? selectedPhotos[0] : product.designUrl;

  // keep photoIndex within bounds when color or photos change
  useEffect(() => {
    if (!product.photos) return;
    const photosForColor = product.photos[selectedColor] || [];
    if (photosForColor.length === 0) {
      setPhotoIndex(0);
    } else if (photoIndex >= photosForColor.length) {
      setPhotoIndex(0);
    }
  }, [selectedColor, product.photos, photoIndex]);

  // ----------------------
  // Price Breaks with minQty for automatic quantity
  // ----------------------
  const priceBreaks = [
    { range: t("priceBreaks.0-1"), price: 35.0, minQty: 1 },
    { range: t("priceBreaks.1-20"), price: 27.0, minQty: 20 },
    { range: t("priceBreaks.21-99"), price: 19.0, minQty: 21 },
    { range: t("priceBreaks.100≥"), price: 5.0, minQty: 100 },
  ];

  const currentPrice = priceBreaks[selectedPriceTier].price;
  const displayedPrice = format(currentPrice);

  // ----------------------
  // Helper: Quantity per Price Tier
  // ----------------------
  const getQuantityByPriceTier = (tierIndex: number) => {
    return priceBreaks[tierIndex]?.minQty || 1;
  };

  const handleDesignNow = () => {
    router.push(`/products/${slug}/design/`);
  };

  const handleAddBlank = () => {
    const qty = getQuantityByPriceTier(selectedPriceTier);

    addToCart({
      id: product.id,
      name: product.name,
      size: selectedSize,
      color: selectedColor,
      price: currentPrice,
      quantity: qty,
      designUrl: mainPhoto,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="min-h-screen bg-white mt-18">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-sm text-gray-600">
            <span className="hover:text-black cursor-pointer">{t("breadcrumb.all")}</span>
            <span className="mx-2">/</span>
            <span className="hover:text-black cursor-pointer">{t("breadcrumb.category")}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7">
            <ProductViewer
            modelKey={product.slug}
            selectedColor={selectedColorHex}  
            colorName={selectedColor}         
          />
          </div>

          {/* Right: Product Info & Options */}
          <div className="lg:col-span-5">
            {/* Product Header */}
            <div className="mb-6">
              <div className="inline-block bg-gray-100 text-xs font-[HandoRegular] px-3 py-1 rounded mb-3">
                {t("labels.bestseller")}
              </div>
              <h1 className="text-3xl font-[HandoBold] mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-600 font-[HandoRegular]">
                <span>{product.sku}</span>
                <span>•</span>
                <span>{product.sizes.length} {t("labels.size")}{product.sizes.length > 1 ? "s" : ""}</span>
                <span>•</span>
                <span>{product.colors.length} {t("colors.Black")}</span>
                <span>•</span>
                <span>{product.weight}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("customize")}
                  className={`pb-3 text-sm font-[HandoRegular] transition-colors relative ${
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
                  className={`pb-3 text-sm font-[HandoRegular] transition-colors relative ${
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
              <div className="space-y-6">
                {/* Size Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-[HandoBold]">{t("labels.size")}</h3>
                    {/* <button className="text-sm text-gray-600 hover:text-black underline">
                      {t("labels.sizeGuide")}
                    </button> */}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 text-sm font-[HandoRegular] border rounded-md transition-colors ${
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

                {/* Unit Price */}
                <div>
                  <div className="flex flex-row w-full justify-between items-center">
                  <h3 className="text-base font-[HandoBold] mb-3">{t("labels.unitPrice")}</h3>
                    <button
                        onClick={() => setShowPriceGuide(true)}
                        className="text-sm text-gray-600 hover:text-black underline"
                      >
                        {t("labels.priceGuide")}
                      </button>
                      </div>
                  <div className="grid grid-cols-2 gap-3">
                    {priceBreaks.map((tier, index) => (
                      <button
                        key={tier.range}
                        onClick={() => setSelectedPriceTier(index)}
                        className={`p-4 border rounded-lg text-left transition-all ${
                          selectedPriceTier === index
                            ? "border-black bg-gray-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="text-xs text-gray-600 mb-1">{tier.range}</div>
                        <div className="text-xl font-[HandoBold]">{format(tier.price)}</div>
                      </button>
                    ))}
                  </div>
                  <Link href='/enterprise#contact'>
                    <p className="text-xs text-gray-600 mt-3 font-[HandoRegular]">
                      <button className="underline hover:text-black">
                        {t("labels.talkToManager")}
                      </button>
                    </p>
                  </Link>
                </div>

                {/* Customization Options with Price Guide */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-[HandoBold]">{t("labels.customizationOptions")}</h3>
                    {/* <div className="flex gap-3">
                      <button className="text-sm text-gray-600 hover:text-black underline">
                        {t("labels.printGuide")}
                      </button>
                    
                    </div> */}
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <input type="radio" name="technique" checked readOnly className="mt-1" />
                      <div className="flex-1">
                        <h4 className="font-[HandoRegular] mb-1">{t("customization.embroidery")}</h4>
                        <p className="text-sm text-gray-600">{t("customization.embroideryDesc")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fulfillment */}
                <div>
                  <h3 className="text-base font-[HandoBold] mb-3">{t("labels.fulfillment")}</h3>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <input type="radio" name="fulfillment" checked readOnly className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="w-4 h-4" />
                          <h4 className="font-[HandoRegular]">{t("labels.internationalFulfillment")}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{t("labels.internationalFulfillmentDesc")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <h3 className="text-base font-[HandoBold] mb-3">{t("labels.color")}</h3>
                  {/* Mobile: Horizontal scroll */}
                  <div className="md:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {product.colors.map((color) => {
                      const colorHex = getColorHex(color);
                      return (
                        <button 
                          key={color}
                          onClick={() => {
                            setSelectedColor(color);
                            setPhotoIndex(0);
                          }}
                          className="relative group flex flex-col items-center shrink-0"
                          title={color}
                        >
                          <div
                            className={`w-12 h-12 rounded-full border-2 transition-all relative ${
                              selectedColor === color
                                ? "border-black"
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
                  <div className="hidden md:grid grid-cols-6 gap-3 ">
                    {product.colors.map((color) => {
                      const colorHex = getColorHex(color);
                      return (
                        <button
                          key={color}
                          onClick={() => {
                            setSelectedColor(color);
                            setPhotoIndex(0);
                          }}
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
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <p className="text-gray-700 font-[HandoRegular]">{product.description}</p>
                <div className="border-t pt-4">
                  <h4 className="font-[HandoBold] mb-2">{t("labels.specifications")}</h4>
                  <ul className="space-y-2 text-gray-600 font-[HandoRegular]">
                    <li>• {t("labels.material")}</li>
                    <li>• {product.weight}</li>
                    <li>• {t("labels.adjustableClosure")}</li>
                    <li>• {t("labels.structuredDesign")}</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Price Summary & CTA */}
            <div className="mt-8 border-t pt-6 space-y-3">
              <button
                onClick={handleDesignNow}
                className="w-full bg-black text-white py-3.5 rounded-md font-[HandoBold] hover:bg-gray-800 transition-colors"
              >
                {t("labels.designNow")}
              </button>

              <motion.button
                onClick={handleAddBlank}
                className="w-full py-6 rounded-md font-[HandoBold] relative flex items-center justify-center border-2 transition-colors"
                style={{
                  backgroundColor: added ? "#22c55e" : "#ffffff",
                  color: added ? "#fff" : "#000",
                  borderColor: "#000"
                }}
              >
                <motion.span
                  key="text"
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: added ? 0 : 1, scale: added ? 0.8 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute"
                >
                  {t("labels.addBlankToCart")}
                </motion.span>

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

              <p className="text-xs text-gray-500 text-center mt-3 font-[HandoRegular]">{t("labels.shippingInfo")}</p>
            </div>
          </div>

          {/* Other items preview */}
          <div className="lg:col-span-12 mt-6">
            <h3 className="text-lg font-[HandoBold] mb-3">{t('like')}</h3>
            <div className="flex gap-4 overflow-x-auto py-2">
              {otherProducts.map((p) => (
                <div key={p.slug} className="w-40 shrink-0">
                  <Link href={`/products/${p.slug}`} className="block" prefetch>
                    <div className="w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={p.photos ? (Object.values(p.photos)[0]?.[0] || p.designUrl) : p.designUrl}
                        alt={p.name}
                        width={500}      
                        height={500}     
                        className="w-full h-full object-contain"
                        unoptimized   
                      />
                    </div>
                    <div className="mt-2 text-sm font-[HandoRegular]">{p.name}</div>
                    <div className="text-xs text-gray-600">{format(p.price)}</div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Price Guide Modal ---------------- */}
      {showPriceGuide && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{duration: 1}}
        
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
          <div className="bg-white rounded-lg max-w-max w-full p-6 relative border-black border object-contain">

            <button
              onClick={() => setShowPriceGuide(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <img src='/price-guide/price-guide.jpeg' className="relative max-w-[324px]"/>

          </div>
        </motion.div>
      )}
    </div>
  );
}
