// components/Design/DesignSidebar.tsx
import React from "react";
import { motion } from "framer-motion";
import { Box, RotateCcw, MoveLeft, MoveRight, MoveUp, ShoppingCart, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { DesignAccordions } from "./DesignAccordions";

type Position = "front" | "left" | "right" | "back";

interface DesignSidebarProps {
  activePosition: Position;
  onPositionChange: (pos: Position) => void;
  product?: any;
  selectedColor?: { h: number; s: number; l: number };
  onColorChange?: (color: { h: number; s: number; l: number }) => void;
  onColorNameChange?: (colorName: string) => void;
  selectedTexture?: string | null;
  onTextureChange?: (url: string | null) => void;
  selectedRegionPosition?: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
    opacity: number;
  };
  isPanning?: boolean;
  onPanStart?: (e: React.MouseEvent | React.TouchEvent) => void;
  onPanMove?: (e: React.MouseEvent | React.TouchEvent) => void;
  onPanEnd?: () => void;
  isPositionOpen?: boolean;
  onTogglePosition?: () => void;
  isColorOpen?: boolean;
  onToggleColor?: () => void;
  isTextureOpen?: boolean;
  onToggleTexture?: () => void;
  selectedAssetIndex?: number | null;
  assetsByPosition?: Record<Position, any[]>;
  onAddToCart?: () => void;
  loading?: boolean;
  addedToCart?: boolean;
}

export function DesignSidebar({
  activePosition,
  onPositionChange,
  product,
  selectedColor,
  onColorChange,
  onColorNameChange,
  selectedTexture,
  onTextureChange,
  selectedRegionPosition,
  isPanning,
  onPanStart,
  onPanMove,
  onPanEnd,
  isPositionOpen,
  onTogglePosition,
  isColorOpen,
  onToggleColor,
  isTextureOpen,
  onToggleTexture,
  selectedAssetIndex,
  assetsByPosition,
  onAddToCart,
  loading,
  addedToCart
}: DesignSidebarProps) {
  const t = useTranslations("DesignPage");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div className="bg-white shadow-xl w-full lg:w-1/2 xl:w-1/3 flex flex-col justify-start items-center">
      {/* Perspective Buttons Bar */}
      <motion.div className="relative left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-center p-4 font-[HandoBold] tracking-tight">
          {/* Perspective Buttons Grid */}
          <div className="flex flex-col gap-1">
            <div className="text-xs font-[HandoBold] text-gray-600 mb-1 text-center">{t('views')}</div>
            <div className="text-[10px] text-gray-500 text-center mb-2"> {t('decals')}</div>
            <div className="flex flex-col gap-2 justify-center items-center">
             
              
              <div className="flex flex-row gap-2">
                   <motion.button
                onClick={() => onPositionChange("back")}
                className={`px-3 py-2 rounded-lg text-xs font-[HandoBold] ${
                  activePosition === "back" 
                    ? "bg-black text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("back")}
              </motion.button>
              {/* Middle Row */}
              <motion.button
                onClick={() => onPositionChange("left")}
                className={`px-3 py-2 rounded-lg text-xs font-[HandoBold] ${
                  activePosition === "left" 
                    ? "bg-black text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("left")}
              </motion.button>
              <motion.button
                onClick={() => onPositionChange("front")}
                className={`px-3 py-2 rounded-lg text-xs font-[HandoBold] ${
                  activePosition === "front" 
                    ? "bg-black text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("front")}
              </motion.button>
              <motion.button
                onClick={() => onPositionChange("right")}
                className={`px-3 py-2 rounded-lg text-xs font-[HandoBold] ${
                  activePosition === "right" 
                    ? "bg-black text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("right")}
              </motion.button>
              </div>
            
            </div>
          </div>
        </div>
      </motion.div>

      {/* Desktop Controls - Reuse existing DesignAccordions + Add to Cart */}
      <div className="hidden lg:block w-full">
        {product && selectedColor && onColorChange && selectedTexture !== undefined && onTextureChange && selectedRegionPosition && (
          <DesignAccordions
            product={product}
            selectedColor={selectedColor}
            onColorChange={onColorChange}
            onColorNameChange={onColorNameChange}
            selectedTexture={selectedTexture}
            onTextureChange={onTextureChange}
            selectedRegionPosition={selectedRegionPosition}
            isPanning={isPanning || false}
            onPanStart={onPanStart || (() => {})}
            onPanMove={onPanMove || (() => {})}
            onPanEnd={onPanEnd || (() => {})}
            isPositionOpen={isPositionOpen || false}
            onTogglePosition={onTogglePosition || (() => {})}
            isColorOpen={isColorOpen || false}
            onToggleColor={onToggleColor || (() => {})}
            isTextureOpen={isTextureOpen || false}
            onToggleTexture={onToggleTexture || (() => {})}
            selectedAssetIndex={selectedAssetIndex || null}
            assetsByPosition={assetsByPosition || { front: [], left: [], right: [], back: [], top: [], bottom: [] }}
            activePosition={activePosition as "front" | "left" | "right" | "back" | "top"}
          />
        )}
        
        {/* Add to Cart Button */}
        {onAddToCart && (
          <div className="p-4">
            <motion.button
              onClick={onAddToCart}
              disabled={loading || addedToCart}
              className="w-full py-3 px-6 rounded-lg font-[HandoBold] flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 transition-all duration-150"
              style={mounted && addedToCart ? { backgroundColor: '#22c55e' } : {}}
              whileHover={!addedToCart && !loading ? { scale: 1.02 } : {}}
              whileTap={!addedToCart && !loading ? { scale: 0.98 } : {}}
            >
              {mounted && loading ? (
                <img src="/loading/loading.gif" alt="loading" className="w-5 h-5" />
              ) : mounted && addedToCart ? (
                <Check size={20} />
              ) : (
                <><ShoppingCart size={20} /> {t("add_to_cart")}</>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}