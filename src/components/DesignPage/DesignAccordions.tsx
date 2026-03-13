// components/DesignPage/DesignAccordions.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Move } from "lucide-react";
import { getColorHex } from "@/utils/colorMapping";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { TEXTURE_OPTIONS } from "@/components/constants/designConstatns";

type Position = "front" | "left" | "right" | "back"

interface DesignAccordionsProps {
  product: any;
  selectedColor: { h: number; s: number; l: number };
  onColorChange: (color: { h: number; s: number; l: number }) => void;
  selectedTexture: string | null;
  onTextureChange: (url: string | null) => void;
  onColorNameChange?: (name: string) => void;
  selectedRegionPosition: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
    opacity: number;
  };
  isPanning: boolean;
  onPanStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onPanMove: (e: React.MouseEvent | React.TouchEvent) => void;
  onPanEnd: () => void;
  isPositionOpen: boolean;
  onTogglePosition: () => void;
  isColorOpen: boolean;
  onToggleColor: () => void;
  isTextureOpen: boolean;
  onToggleTexture: () => void;
  onOpenDesignTools?: () => void;
  onPlaceDecalAt?: (x: number, y: number) => void;
  selectedAssetIndex: number | null;
  assetsByPosition: Record<Position, any[]>;
  activePosition: Position;
  onStretchDecal?: (axis: "x" | "y", value: number) => void;

}

export function DesignAccordions({
  product,
  selectedColor,
  onColorChange,
  selectedTexture,
  onTextureChange,
  onColorNameChange,
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
  onOpenDesignTools,
  onPlaceDecalAt,
  selectedAssetIndex,
  assetsByPosition,
  activePosition,
  onStretchDecal
}: DesignAccordionsProps) {
  const t = useTranslations("DesignPage");
  const selectedAsset =
  selectedAssetIndex !== null
    ? assetsByPosition[activePosition]?.[selectedAssetIndex]
    : null;

    

  // Get the actual position to display - selected asset position or default position
  const displayPosition = selectedAssetIndex !== null && assetsByPosition[activePosition][selectedAssetIndex] 
    ? assetsByPosition[activePosition][selectedAssetIndex].properties.position
    : selectedRegionPosition.position;
  const selectedColorCss = `hsl(${selectedColor.h}, ${selectedColor.s}%, ${selectedColor.l}%)`;

  const [isStretchOpen, setIsStretchOpen] = useState(true)

const onToggleStretch = () => {
  setIsStretchOpen((prev) => !prev)
}


 
  return (
    <div className="flex flex-col gap-2">

      
{/* Stretch Controls */}
<div className="w-full bg-white/90 backdrop-blur-md rounded-lg shadow-lg z-10">
  <button
    className="w-full flex justify-between items-center p-4 font-[HandoBold] tracking-tighter text-sm"
    onClick={onToggleStretch}
  >
    {t("stretch_controls")}
    <span className="text-gray-500 font-[HandoBold] text-md">
      {isStretchOpen ? "−" : "+"}
    </span>
  </button>

  <AnimatePresence initial={false}>
    {isStretchOpen && (
      <motion.div
        key="stretch-content"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden p-4 flex flex-col gap-4"
      >
        {/* Horizontal */}
        <div className="flex items-center gap-3">
          <img src="/logo/horizontal.png" className="w-6" />
          <input
            type="range"
            min={0.2}
            max={3}
            step={0.05}
            value={selectedAsset?.properties.scale.x ?? 1}
            onChange={(e) => {
              if (!selectedAsset) return
              onStretchDecal?.(
                "x",
                Math.max(0.2, parseFloat(e.target.value))
              )
            }}
            className="w-full"
          />
        </div>

        {/* Vertical */}
        <div className="flex items-center gap-3">
          <img src="/logo/vertical.png" className="w-6" />
          <input
            type="range"
            min={0.2}
            max={3}
            step={0.05}
            value={selectedAsset?.properties.scale.y ?? 1}
            onChange={(e) => {
              if (!selectedAsset) return
              onStretchDecal?.(
                "y",
                Math.max(0.2, parseFloat(e.target.value))
              )
            }}
            className="w-full"
          />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>


      {/* Color Controls */}
      {!["panel_laser", "panel_mesh", "panel-dye"].includes(product.modelKey) && (
      <div className="w-full bg-white/90 backdrop-blur-md rounded-lg shadow-lg z-10">
        <button
          className="w-full flex justify-between items-center p-4 font-[HandoBold] tracking-tighter text-sm"
          onClick={onToggleColor}
        >
          {t("color_controls")}
          <span className="text-gray-500 font-[HandoBold] text-md">{isColorOpen ? "−" : "+"}</span>
        </button>
        <AnimatePresence initial={false}>
          {isColorOpen && (
            <motion.div
              key="color-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden p-4 flex flex-col items-center gap-4"
            >
              <div className="w-full grid grid-cols-4 gap-2">
                {Array.isArray(product.colors) && product.colors.map((colorName: string) => {
                  const hex = getColorHex(colorName || "");

                  // convert hex to HSL for existing onColorChange handler
                  const hexToHsl = (hexColor: string) => {
                    const parsed = hexColor.replace('#','');
                    const r = parseInt(parsed.substring(0,2),16) / 255;
                    const g = parseInt(parsed.substring(2,4),16) / 255;
                    const b = parseInt(parsed.substring(4,6),16) / 255;
                    const max = Math.max(r,g,b), min = Math.min(r,g,b);
                    let h = 0, s = 0, l = (max + min) / 2;
                    if (max !== min) {
                      const d = max - min;
                      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                      switch (max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: h = (b - r) / d + 2; break;
                        case b: h = (r - g) / d + 4; break;
                      }
                      h = Math.round(h * 60);
                    }
                    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
                  };

                  const isSelected = (() => {
                    try {
                      

                      const sel = selectedColor;
                      
                      // use an offscreen canvas to get hex from HSL for robust comparison
                      const c = document.createElement('canvas');
                      c.width = c.height = 1;
                      const ctx = c.getContext('2d');
                      if (!ctx) return false;
                      ctx.fillStyle = `hsl(${sel.h}, ${sel.s}%, ${sel.l}%)`;
                      ctx.fillRect(0,0,1,1);
                      const d = ctx.getImageData(0,0,1,1).data;
                      const toHex = (v:number) => v.toString(16).padStart(2,'0');
                      const selHex = `#${toHex(d[0])}${toHex(d[1])}${toHex(d[2])}`;
                      return selHex.toLowerCase() === hex.toLowerCase();
                    } catch {
                      return false;
                    }
                  })();

                  return (
                    <button
                      key={colorName}
                      onClick={() => {
                        onColorChange(hexToHsl(hex));
                        onColorNameChange?.(colorName as string);
                      }}
                      className={`p-2 rounded-lg border-2 transition flex flex-col items-center justify-center ${isSelected ? 'border-black bg-gray-100' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      <div className="w-10 h-10 rounded" style={{ background: hex }} />
                      <div className="text-xs font-[HandoBold] mt-1 text-center">{colorName}</div>
                    </button>
                  );
                })}
              </div>
              <div className="text-sm font-[HandoBold]">
                Selected: <span className="font-normal">{selectedColorCss}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      {/* Texture Controls (only for panel models) */}
      {(['panel_laser', 'panel_mesh', "panel-dye"].includes(product.modelKey)) && (
        <div className="w-full bg-white/90 backdrop-blur-md rounded-lg shadow-lg z-10">
          <button
            className="w-full flex justify-between items-center p-4 font-[HandoBold] tracking-tighter text-sm"
            onClick={onToggleTexture}
          >
            {t("texture_controls")}
            <span className="text-gray-500 font-[HandoBold] text-md">{isTextureOpen ? "−" : "+"}</span>
          </button>
          <AnimatePresence initial={false}>
            {isTextureOpen && (
              <motion.div
                key="texture-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden p-4"
              >
                <div className="grid grid-cols-2 gap-2">
                  {TEXTURE_OPTIONS[product.modelKey]?.map((texture: any) => (
                    <button
                      key={texture.id}
                      onClick={() => onTextureChange(texture.url)}
                      className={`p-2 rounded-lg border-2 transition ${
                        selectedTexture === texture.url
                          ? "border-black bg-gray-100"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="text-xs font-[HandoBold] mb-1">{texture.name}</div>
                      {texture.url && (
                        <img
                          src={texture.url}
                          alt={texture.name}
                          className="w-full h-16 object-cover rounded"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
