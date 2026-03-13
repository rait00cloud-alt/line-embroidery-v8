"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { supabase } from "@/components/lib/supabase";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";


export default function RegisterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [email, setEmail] = useState("");

  const contentRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const router = useRouter();




  useEffect(() => {
    const checkPopup = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const dismissed = sessionStorage.getItem("registerPopupDismissed");
        if (!dismissed) setTimeout(() => setIsVisible(true), 500);
      } else {
        const { data } = await supabase
          .from("users")
          .select("show_dst")
          .eq("id", session.user.id)
          .single();

        if (!data?.show_dst) setTimeout(() => setIsVisible(true), 500);
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

 

  const dismissPopup = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (dontShowAgain && session) {
      await supabase
        .from("users")
        .update({ show_dst: true })
        .eq("id", session.user.id);
    } else if (dontShowAgain) {
      sessionStorage.setItem("registerPopupDismissed", "true");
    }

    setIsVisible(false);
  };

  const handleRegister = async () => {
    await dismissPopup();
    router.push(`/register${email ? `?email=${encodeURIComponent(email)}` : ""}`);
  };

  return (
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
              className="absolute top-3 right-3 text-black hover:text-[#59ff00]"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Logo */}
            <div className="mb-4 flex justify-center">
              <img
                src="/logo/line-embroidery-logo.png"
                alt="Logo"
                className="h-12"
              />
            </div>

            <h2 className="text-center font-[HandoBold] text-xl mb-2">
              {t("alert.register_title")}
            </h2>

            {/* Scrollable Text */}
         <div
  ref={contentRef}
  className="flex-1 overflow-y-auto p-4 mb-4 max-h-52 text-black"
>

              <div className="space-y-4 text-sm font-[HandoRegular]">
                <p>{t("alert.register_text_01")}</p>
                <p className="font-[HandoBold]">
                  🎁 {t("alert.register_discount")}
                </p>
              </div>
            </div>

            {/* Email input */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='E-mail'
              className="mb-3 w-full bg-gray-100 rounded-xl px-4 py-3 text-sm font-[HandoRegular] focus:outline-none focus:ring-2 focus:ring-black"
            />

            <label className="flex items-center gap-2 text-sm font-[HandoRegular] mb-3">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="accent-[#59ff00]"
              />
              {t("alert.show")}
            </label>

        <button
  onClick={handleRegister}
  className="w-full py-3 rounded-xl font-[HandoBold] bg-black text-white hover:bg-[#59ff00] hover:text-black transition"
>
  {t("alert.register_cta")}
</button>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
