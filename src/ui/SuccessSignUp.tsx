"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface SignUpSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpSuccessPopup({ isOpen, onClose }: SignUpSuccessPopupProps) {
  const t = useTranslations("signUp");

  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => setCanClose(true), 500); // delay para habilitar fechar
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  const slideContent = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeIn}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            variants={slideContent}
            className="relative bg-white border border-black/50 max-w-md w-full p-6 rounded-md flex flex-col items-center"
          >
            <button
              onClick={onClose}
              disabled={!canClose}
              className="absolute top-2 right-2 text-black hover:text-[#59ff00] disabled:opacity-50"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <img src="/logo/line-embroidery-logo.png" alt="Logo" className="h-12 w-auto mb-4" />

            <div className="flex flex-col gap-2 text-center">
              <h3 className="font-[HandoBold] text-2xl text-black">{t("success_title")}</h3>
              <p className="font-[HandoRegular] text-sm text-gray-800">{t("success_message")}</p>
            </div>

            <button
              onClick={onClose}
              disabled={!canClose}
              className={`mt-6 w-full py-2 rounded-md font-[HandoBold] tracking-tight ${
                canClose
                  ? "bg-black text-white hover:bg-[#59ff00] hover:text-black transition"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}
            >
              {t("success_continue")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
