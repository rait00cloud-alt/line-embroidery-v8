"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import FloatingLogoAI from "@/ui/FloatingLogoAI";

export default function LogoGeneratorPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [logoAIOpen, setLogoAIOpen] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    const checkPopup = () => {
      const dismissed = sessionStorage.getItem("logoGeneratorPopupDismissed");
      if (!dismissed) {
        setTimeout(() => setIsVisible(true), 2000);
      }
    };

    checkPopup();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isVisible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  const dismissPopup = () => {
    if (dontShowAgain) {
      sessionStorage.setItem("logoGeneratorPopupDismissed", "true");
    }
    setIsVisible(false);
  };

  const handleGenerateLogo = () => {
    dismissPopup();
    setLogoAIOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div className="relative bg-white max-w-md w-full p-6 rounded-xl flex flex-col">
              <button
                onClick={dismissPopup}
                className="absolute top-3 right-3 text-black hover:text-gray-600"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              {/* Logo */}
              <div className="mb-4 flex justify-center">
                <img
                  src="/favicon/favicon.png"
                  alt="Logo AI"
                  className="h-12"
                />
              </div>

              <h2 className="text-center font-[HandoBold] text-xl mb-2">
                {t("logoPopup.title")}
              </h2>

              <div className="flex-1 overflow-y-auto p-4 mb-4 max-h-52 text-black">
                <div className="space-y-4 text-sm font-[HandoRegular] text-center">
                  <p>{t("logoPopup.description")}</p>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Sparkles size={16} />
                    <span className="font-[HandoBold]">{t("logoPopup.feature")}</span>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-[HandoRegular] mb-3">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="accent-black"
                />
                {t("alert.show")}
              </label>

              <button
                onClick={handleGenerateLogo}
                className="w-full py-3 rounded-xl font-[HandoBold] bg-black text-white hover:bg-gray-800 transition flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                {t("logoPopup.cta")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo AI Modal */}
      <FloatingLogoAI 
        isOpen={logoAIOpen} 
        onClose={() => setLogoAIOpen(false)} 
      />
    </>
  );
}