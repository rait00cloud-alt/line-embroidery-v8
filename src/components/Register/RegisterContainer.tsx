"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Gift, Star, ShieldCheck, Truck, Percent, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/components/lib/supabase";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import SignUpSuccessPopup from "@/ui/SuccessSignUp";

const SignUpPage = () => {
  const t = useTranslations();
  const router = useRouter();
    const searchParams = useSearchParams();
  
  useEffect(() => {
    const emailFromPopup = searchParams.get("email");
    if (emailFromPopup) {
      setEmail(emailFromPopup);
    }
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  const benefits = [
    { icon: Gift, title: t("signUp.benefits.welcomeGift") },
    { icon: Percent, title: t("signUp.benefits.discount") },
    { icon: Truck, title: t("signUp.benefits.freeShipping") },
    { icon: Star, title: t("signUp.benefits.earlyAccess") },
    { icon: ShieldCheck, title: t("signUp.benefits.secure") },
    { icon: HeartHandshake, title: t("signUp.benefits.support") },
  ];

  /** Desktop Vertical Infinite Scroll */
  useEffect(() => {
    const container = desktopRef.current;
    if (!container) return;

    const cloneItems = () => {
      const children = Array.from(container.children);
      children.forEach((child) => container.appendChild(child.cloneNode(true)));
    };
    cloneItems();

    const interval = setInterval(() => {
      if (container.scrollTop >= container.scrollHeight / 2) container.scrollTop = 0;
      else container.scrollTop += 1;
    }, 30);

    return () => clearInterval(interval);
  }, []);

  /** Mobile Horizontal Infinite Scroll */
  useEffect(() => {
    const container = mobileRef.current;
    if (!container) return;

    const cloneItems = () => {
      const children = Array.from(container.children);
      children.forEach((child) => container.appendChild(child.cloneNode(true)));
    };
    cloneItems();

    const interval = setInterval(() => {
      if (container.scrollLeft >= container.scrollWidth / 2) container.scrollLeft = 0;
      else container.scrollLeft += 1;
    }, 30);

    return () => clearInterval(interval);
  }, []);


 const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      setShowSuccessPopup(true);
    } catch (err: any) {
      alert(err.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };



 const handleGoogleSignUp = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  if (error) alert(error.message);
};

  return (
    <div className="flex min-h-screen">
     {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 bg-white">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <img src="/logo/line-embroidery-logo.png" alt="Logo" className="max-w-20" />
          </Link>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="font-[HandoBold] text-4xl lg:text-5xl text-black mb-3">{t("signUp.create_account")}</h2>
              <p className="font-[HandoRegular] text-base text-black mb-8">
                {t("signUp.already_have_account")} <Link href="/login" className="underline hover:no-underline">{t("signUp.sign_in")}</Link>
              </p>

              {/* Google SignIn */}
              <button onClick={handleGoogleSignUp} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-full px-6 py-3.5 font-[HandoRegular] text-black hover:bg-gray-50 transition mb-6">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"> ... </svg>
                {t("signUp.sign_up_google")}
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="font-[HandoRegular] text-sm text-gray-500">{t("signUp.or")}</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6 px-4 py-2 bg-yellow-100 text-yellow-900 font-[HandoBold] rounded-xl text-center shadow-md"
              >
                {t("signUp.register_for_special_discounts")}
              </motion.div>

              {/* Email Registration Form */}
              <form onSubmit={handleRegister} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("signUp.enter_email")}
                  required
                  className="w-full bg-gray-100 border-0 rounded-xl px-6 py-3.5 font-[HandoRegular] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("signUp.enter_password")}
                  required
                  className="w-full bg-gray-100 border-0 rounded-xl px-6 py-3.5 font-[HandoRegular] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white rounded-full px-6 py-3.5 font-[HandoRegular] hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t("signUp.creating_account") : t("signUp.sign_up")}
                </button>
              </form>
            </motion.div>
          </div>
        </div>

        <div className="mt-8">
          <p className="font-[HandoRegular] text-sm text-gray-600">
            {t("signUp.terms_text")} <a href="#" className="underline hover:no-underline">{t("signUp.terms_of_service")}</a> {t("signUp.and")} <a href="#" className="underline hover:no-underline">{t("signUp.privacy_policy")}</a>.
          </p>
        </div>
      </div>

      {/* Right Side - Desktop Carousel */}
      <div className="hidden lg:block lg:w-1/2 relative bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center max-w-lg">
            <h3 className="font-[HandoBold] text-3xl text-black mb-4">{t("signUp.get_special_coupons")}</h3>
            <p className="font-[HandoRegular] text-gray-700 mb-8">{t("signUp.register_now_cta")}</p>

            {/* Vertical Infinite Scroll */}
            <div ref={desktopRef} className="flex flex-col gap-6 h-96 overflow-hidden">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.3, y: 20 * i, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white"
                >
                  <div className="bg-blue-100 p-3 rounded-full">
                    <benefit.icon className="text-blue-600 w-6 h-6" />
                  </div>
                  <span className="font-[HandoRegular] text-lg text-black">{benefit.title}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Carousel */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 overflow-hidden">
        <div ref={mobileRef} className="flex gap-4 px-6 pb-2 overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
          {benefits.map((benefit, i) => (
            <div key={i} className="shrink-0 flex flex-col items-center w-24">
              <div className="bg-blue-100 p-3 rounded-full mb-2">
                <benefit.icon className="text-blue-600 w-6 h-6" />
              </div>
              <span className="font-[HandoRegular] text-xs text-center text-gray-700">{benefit.title}</span>
            </div>
          ))}
        </div>
      </div>
         <SignUpSuccessPopup
  isOpen={showSuccessPopup}
  onClose={() => {
    setShowSuccessPopup(false);
    router.push("/login"); // vai para login após fechar
  }}
/>
    
    </div>
  );
};

export default SignUpPage;
