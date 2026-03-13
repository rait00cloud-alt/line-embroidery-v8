"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X, Check } from "lucide-react";
import { supabase } from "@/components/lib/supabase"; 

interface ResetPasswordPopupProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const ResetPasswordPopup: React.FC<ResetPasswordPopupProps> = ({ isOpen, onClose, email }) => {
  const t = useTranslations();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl max-w-md w-full p-8 relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="font-[HandoBold] text-2xl lg:text-3xl text-black mb-3 text-center">
                {t("reset.popup_title")}
              </h2>
              <p className="text-gray-600 font-[HandoRegular] text-center mb-6">
                {t.rich("reset.popup_message", { email })}
              </p>

              <button
                onClick={onClose}
                className="w-full bg-black text-white rounded-full px-6 py-3.5 font-[HandoRegular] hover:bg-gray-900 transition"
              >
                {t("reset.popup_button")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ResetPasswordPage = () => {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isLoading) return;

  setIsLoading(true);

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  setIsLoading(false);

  if (error) {
    if (error.message.toLowerCase().includes("rate limit")) {
      alert(t("reset.rate_limit"));
      return;
    }

    alert(error.message);
    return;
  }

  // 🔥 só abre o popup
  setShowPopup(true);
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 lg:p-12"
      >
        {/* Logo */}
        <div className="text-center mb-8">
           <div className="mb-4 flex justify-center">
              <img src="/logo/line-embroidery-logo.png" alt="Logo" className="h-12 w-auto" />
            </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-[HandoBold] text-3xl lg:text-4xl text-black mb-3">
            {t("reset.forgot_password")}
          </h2>
          <p className="font-[HandoRegular] text-base text-gray-600">
            {t("reset.description")}
          </p>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("reset.enter_email")}
              required
              className="w-full bg-gray-100 border-0 rounded-xl px-6 py-3.5 font-[HandoRegular] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white rounded-full px-6 py-3.5 font-[HandoRegular] hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("reset.sending") : t("reset.send_reset_link")}
          </button>

          {/* Back to Login */}
          <div className="text-center">
            <a
              href="/login"
              className="font-[HandoRegular] text-black underline hover:no-underline"
            >
              {t("reset.back_to_login")}
            </a>
          </div>
        </form>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="font-[HandoRegular] text-sm text-gray-600 text-center">
            {t("reset.footer_text")}
          </p>
        </div>
      </motion.div>

      {/* Success Popup */}
      <ResetPasswordPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        email={email}
      />
    </div>
  );
};

export default ResetPasswordPage;
