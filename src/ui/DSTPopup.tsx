"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { supabase } from "@/components/lib/supabase"; // same client as your login

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } },
  exit: { opacity: 0, transition: { duration: 1 } },
};

const slideContentFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function DSTPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("");

  useEffect(() => {
    const checkPopup = async () => {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

     if (!session) {
        // Not logged in → fallback to sessionStorage
        const dismissed = sessionStorage.getItem("releasePopupDismissed");
        if (!dismissed) {
          setTimeout(() => setIsVisible(true), 500);
        }
      } else {
        // Logged in → check show_dst in users table
        const { data: user, error } = await supabase
          .from("users")
          .select("show_dst")
          .eq("id", session.user.id)
          .single();

        if (!error && !user?.show_dst) {
          setTimeout(() => setIsVisible(true), 500);
        }
      }
    };

    checkPopup();
  }, []);

  useEffect(() => {
  if (isVisible) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [isVisible]);

  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setIsScrolledToBottom(true);
    }
  };

  const handleClose = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (dontShowAgain && session) {
      // Update show_dst in users table
      await supabase
        .from("users")
        .update({ show_dst: true })
        .eq("id", session.user.id);
    } else if (dontShowAgain) {
      // Fallback for guests
      sessionStorage.setItem("releasePopupDismissed", "true");
    }

    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeIn}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            className="relative bg-white border border-black/70 max-w-md w-full p-6 rounded-md flex flex-col"
            initial="hidden"
            animate="visible"
            
          >
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-white hover:text-[#c9f711]"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Logo */}
            <div className="mb-4 flex justify-center">
              <img src="/logo/line-embroidery-logo.png" alt="Logo" className="h-12 w-auto" />
            </div>

            {/* Scrollable text */}
         <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto border border-black/70 p-4 rounded-md mb-4 max-h-64 text-black"
        >
          <div className="space-y-4">
            {[
              "alert.dst_text_01",
              "alert.dst_text_02",
              "alert.dst_text_03",
              "alert.dst_text_04",
              "alert.dst_text_05",
            ].map((key) => (
              <p key={key} className="whitespace-pre-line font-[HandoRegular] text-sm tracking-tight">
                {t(key)}
              </p>
            ))}
          </div>
        </div>

            {/* Checkbox + button */}
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 font-[HandoRegular] text-sm tracking-tight">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="accent-[#59ff00]"
                />
                {t("alert.show")}
              </label>

              <button
                onClick={handleClose}
                disabled={!isScrolledToBottom}
                className={`w-full py-2 rounded-md font-[HandoBold] tracking-tight ${
                  isScrolledToBottom
                    ? "bg-[#131313] text-white hover:bg-[#59ff00] hover:text-black transition"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                {t('alert.continue')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
