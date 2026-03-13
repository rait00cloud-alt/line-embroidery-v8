// components/Design/DesignToolsModal.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Type, ImageIcon, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

import { removeBackground } from "@/hooks/bgRemover";
import { removeBackgroundClipdrop } from "@/hooks/clipdrop";
import { isMobileDevice } from "@/hooks/shouldRemoveBg";

type DesignTool = "text" | "upload" | "assets";

interface DesignToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTool: DesignTool;
  onToolChange: (tool: DesignTool) => void;
  userText: string;
  onTextChange: (text: string) => void;
  onFileUpload: (blob: Blob) => void;
  publicAsset: string;
  onPublicAssetSelect: (path: string) => void;
  currentAsset: { type: string; value: any } | null;
  onAddAsset: () => void;
}

export function DesignToolsModal({
  isOpen,
  onClose,
  activeTool,
  onToolChange,
  userText,
  onTextChange,
  onFileUpload,
  publicAsset,
  onPublicAssetSelect,
  currentAsset,
  onAddAsset,
}: DesignToolsModalProps) {
  const t = useTranslations("DesignPage");

  const [loading, setLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* 🔒 Bloquear scroll do body */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* Reset ao fechar */
  useEffect(() => {
    if (!isOpen && processedImage) {
      URL.revokeObjectURL(processedImage);
      setProcessedImage(null);
    }
  }, [isOpen, processedImage]);

  /* Reset ao trocar de tool */
  useEffect(() => {
    if (activeTool !== "upload" && processedImage) {
      URL.revokeObjectURL(processedImage);
      setProcessedImage(null);
    }
    setLoading(false);
  }, [activeTool, processedImage]);

  if (!isOpen) return null;

  const handleUploadClick = () => {
    if (processedImage) {
      URL.revokeObjectURL(processedImage);
      setProcessedImage(null);
    }

    setLoading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileUploadWithCanvas = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    setLoading(true);

    try {
      let finalBlob: Blob;

      if (isMobileDevice()) {
        // 📱 Mobile → ClipDrop
        finalBlob = await removeBackgroundClipdrop(file);
      } else {
        // 🖥 Desktop → bgRemover local
        finalBlob = await removeBackground(file);
      }

      const previewUrl = URL.createObjectURL(finalBlob);
      setProcessedImage(previewUrl);
      onFileUpload(finalBlob);
    } catch (err) {
      console.error("BG remove failed:", err);
      onFileUpload(file);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-white rounded-t-2xl shadow-lg z-50 p-6 max-h-[90vh] overflow-y-auto sm:max-w-2xl"
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

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-200 flex-wrap mb-2">
          {[
            { type: "text", icon: <Type size={22} /> },
            { type: "upload", icon: <Upload size={22} /> },
            { type: "assets", icon: <ImageIcon size={22} /> },
          ].map(tab => (
            <motion.button
              key={tab.type}
              onClick={() => onToolChange(tab.type as DesignTool)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg font-[HandoBold] transition-all ${
                activeTool === tab.type
                  ? "bg-black text-white scale-105"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {tab.icon}
              <span className="text-xs mt-1">{t(tab.type)}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* TEXT */}
          {activeTool === "text" && (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-3"
            >
              <label className="text-sm font-[HandoBold]">
                {t("add_text")}
              </label>
              <input
                type="text"
                value={userText}
                onChange={e => onTextChange(e.target.value)}
                placeholder={t("enter_text")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </motion.div>
          )}

          {/* UPLOAD */}
          {activeTool === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-3 items-center py-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUploadWithCanvas}
                className="hidden"
              />

              <motion.button
                onClick={handleUploadClick}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-[HandoBold] hover:bg-gray-800 transition w-full justify-center"
              >
                <Upload size={20} />
                {t("upload_image_button")}
              </motion.button>

              {loading && (
                <img
                  src="/loading/loading.gif"
                  className="max-w-16"
                  alt="Loading"
                />
              )}

              {processedImage && (
                <img
                  src={processedImage}
                  alt="Processed"
                  className="mt-3 max-w-32 rounded-lg border"
                />
              )}
            </motion.div>
          )}

          {/* ASSETS */}
          {activeTool === "assets" && (
            <motion.div
              key="assets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 gap-2 justify-center items-center"
            >
              {["/patches/patch-01.png", "/patches/patch-02.png"].map(path => (
                <img
                  key={path}
                  src={path}
                  alt="Asset"
                  className={`rounded-lg cursor-pointer border max-w-32 transition-all ${
                    publicAsset === path
                      ? "border-black scale-105"
                      : "border-transparent hover:scale-105"
                  }`}
                  onClick={() => onPublicAssetSelect(path)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {currentAsset && (
          <motion.button
            onClick={onAddAsset}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full py-2 bg-black text-white rounded-lg font-[HandoBold] hover:bg-gray-800"
          >
            {t("add_to_design")}
          </motion.button>
        )}
      </motion.div>
    </>
  );
}
