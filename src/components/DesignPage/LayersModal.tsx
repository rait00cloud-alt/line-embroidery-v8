// components/Design/LayersModal.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Type, ImageIcon, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

interface Asset {
  type: "text" | "upload" | "public";
  value: string | File;
  _url?: string;
}

interface LayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetsByPosition: Record<"front" | "left" | "right" | "back", Asset[]>;
  activePosition: "front" | "left" | "right" | "back";
  selectedAssetIndex: number | null;
  onSelectLayer: (pos: "front" | "left" | "right" | "back", idx: number) => void;
  onDeleteLayer: (pos: "front" | "left" | "right" | "back", idx: number) => void;
}

export function LayersModal({
  isOpen,
  onClose,
  assetsByPosition,
  activePosition,
  selectedAssetIndex,
  onSelectLayer,
  onDeleteLayer
}: LayersModalProps) {
  const t = useTranslations("DesignPage");

  if (!isOpen) return null;

  const getAssetDisplayName = (asset: Asset): string => {
    if (asset.type === "text") {
      const text = typeof asset.value === "string" ? asset.value : "";
      return text.length > 15 ? text.substring(0, 15) + "..." : text || "Text";
    } else if (asset.type === "upload") {
      if (asset.value instanceof File) {
        const name = asset.value.name;
        return name.length > 15 ? name.substring(0, 15) + "..." : name;
      }
      // Fallback for when value is empty string but _url exists
      return "Upload";
    } else {
      return "Asset";
    }
  };

  return (
    <>
      <motion.div
        className="absolute bottom-2 bg-black/50 z-50 w-screen h-screen "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-white rounded-t-2xl shadow-lg z-50 p-6 max-h-[90vh] overflow-y-auto max-w-2xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
        <button
          className="absolute top-4 right-4 text-gray-500 text-xl"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="text-lg font-[HandoBold] mb-4 text-center">
          {t("layers")}
        </h3>
        {Object.entries(assetsByPosition).map(([position, assets]) =>
          assets.length > 0 && (
            <div key={position} className="mb-4">
              <h4 className="font-bold text-gray-600 mb-2 capitalize">
                {t(position)}
              </h4>
              <div className="space-y-2">
                {assets.map((asset, index) => (
                  <div
                    key={`${position}-${index}`}
                    className={`p-3 rounded-lg border flex justify-between items-center ${
                      selectedAssetIndex === index && activePosition === position
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className="flex items-center gap-2 cursor-pointer flex-1"
                      onClick={() => onSelectLayer(position as any, index)}
                    >
                      {asset.type === "text" ? (
                        <Type size={18} className="text-blue-500" />
                      ) : asset.type === "upload" ? (
                        <Upload size={18} className="text-green-500" />
                      ) : (
                        <ImageIcon size={18} className="text-purple-500" />
                      )}
                      <span className="text-sm truncate max-w-[120px]">
                        {getAssetDisplayName(asset)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLayer(position as any, index);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
        {Object.values(assetsByPosition).flat().length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {t("no_layers")}
          </div>
        )}
      </motion.div>
    </>
  );
}