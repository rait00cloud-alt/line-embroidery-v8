"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/components/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ResetConfirmPage() {
  const router = useRouter();
  const t = useTranslations("reset");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
      }
    });
  }, [router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert(t("passwords_mismatch"));
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setIsLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setShowSuccess(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-8">
      <AnimatePresence>
        {!showSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 lg:p-12 relative"
          >
            <h2 className="font-[HandoBold] text-3xl text-center mb-6">
              {t("confirm_title")}
            </h2>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <input
                type="password"
                placeholder={t("new_password_placeholder")}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-100 rounded-xl px-6 py-3.5 focus:ring-2 focus:ring-black outline-none"
              />
              <input
                type="password"
                placeholder={t("confirm_password_placeholder")}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-100 rounded-xl px-6 py-3.5 focus:ring-2 focus:ring-black outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white rounded-full px-6 py-3.5 hover:bg-gray-900 transition disabled:opacity-50"
              >
                {isLoading ? t("saving") : t("reset_button")}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/login"
                className="font-[HandoRegular] text-black underline hover:no-underline"
              >
                {t("back_to_login")}
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 lg:p-12 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-[HandoBold] text-2xl lg:text-3xl mb-3">
              {t("success_title")}
            </h2>
            <p className="text-gray-600 font-[HandoRegular] mb-6">
              {t("success_message")}
            </p>
            <button
              onClick={() => router.replace("/login")}
              className="w-full bg-black text-white rounded-full px-6 py-3.5 font-[HandoRegular] hover:bg-gray-900 transition"
            >
              {t("success_button")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
