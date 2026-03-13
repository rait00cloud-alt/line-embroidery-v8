"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/components/lib/supabase";

const LoginPage = () => {
  const t = useTranslations();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /** Login com email/senha */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Logado com sucesso!");
      router.push("/profile"); // página protegida
    }

    setIsLoading(false);
  };

  /** Login/Signup com Google */
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/profile" },
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
            <img
              src="/logo/line-embroidery-logo.png"
              alt="Line Embroidery Logo"
              className="max-w-20"
            />
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-[HandoBold] text-4xl lg:text-5xl text-black mb-3">
                {t("login.welcome_back")}
              </h2>

              <p className="font-[HandoRegular] text-base text-black mb-8">
                {t("login.no_account")}{" "}
                <Link href="/register" className="underline hover:no-underline">
                  {t("login.sign_up")}
                </Link>
              </p>

              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-full px-6 py-3.5 font-[HandoRegular] text-black hover:bg-gray-50 transition mb-6"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
                    fill="#4285F4"
                  />
                  <path
                    d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
                    fill="#34A853"
                  />
                  <path
                    d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z"
                    fill="#EA4335"
                  />
                </svg>
                {t("login.sign_in_google")}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="font-[HandoRegular] text-sm text-gray-500">
                  {t("login.or")}
                </span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.enter_email")}
                  required
                  className="w-full bg-gray-100 border-0 rounded-xl px-6 py-3.5 font-[HandoRegular] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.enter_password")}
                  required
                  className="w-full bg-gray-100 border-0 rounded-xl px-6 py-3.5 font-[HandoRegular] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white rounded-full px-6 py-3.5 font-[HandoRegular] hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t("login.signing_in") : t("login.sign_in")}
                </button>
              </form>

              {/* Forgot Password */}
              <div className="text-center mt-6">
                <Link
                  href="/reset"
                  className="font-[HandoRegular] text-black underline hover:no-underline"
                >
                  {t("login.forgot_password")}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8">
          <p className="font-[HandoRegular] text-sm text-gray-600">
            {t("login.terms_text")}{" "}
            <a href="#" className="underline hover:no-underline">
              {t("login.terms_of_service")}
            </a>{" "}
            {t("login.and")}{" "}
            <a href="#" className="underline hover:no-underline">
              {t("login.privacy_policy")}
            </a>
            .
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div
        className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-linear-to-br from-blue-100 to-blue-50 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hats.jpg')" }}
      ></div>
    </div>
  );
};

export default LoginPage;
