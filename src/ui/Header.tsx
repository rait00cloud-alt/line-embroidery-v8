"use client";

import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { ShoppingCart, User, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/components/lib/supabase";
import FloatingLogoAI from "@/ui/FloatingLogoAI"; 

const MENU_ITEMS = [
  { key: "all_products", path: "/products" },
  { key: "enterprise", path: "/enterprise" },
  { key: "vintage", path: "/vintage" },
  { key: "about", path: "/about" },
];

const LANGUAGES = [
  { code: "PT", fullName: "PT-BR" },
  { code: "EN", fullName: "EN-US" },
  { code: "ES", fullName: "ES-ES" },
  { code: "ZH", fullName: "ZH-CN" },
  { code: "FR", fullName: "FR" },
];

const LANGUAGE_CURRENCY_MAP: Record<string, string> = {
  PT: "BRL",
  EN: "USD",
  ZH: "USD",
  ES: "EUR",
  FR: "EUR",
};

const HeaderComponent: React.FC = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const [currency, setCurrency] = useState("USD");
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState("EN");
  const [user, setUser] = useState<any>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [logoAIOpen, setLogoAIOpen] = useState(false);

  // Check if user is logged in using Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Count cart items
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(
          localStorage.getItem("shopping-cart") || "[]"
        );

        const totalItems = cart.reduce(
          (sum: number, item: any) => sum + (item.quantity || 1),
          0
        );

        setCartItemCount(totalItems);
      } catch {
        setCartItemCount(0);
      }
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // Auto-update language and currency based on pathname
  useEffect(() => {
    const pathLang = pathname.split("/")[1];
    let langCode = "EN"; // default

    switch (pathLang) {
      case "pt":
        langCode = "PT";
        break;
      case "en":
        langCode = "EN";
        break;
      case "es":
        langCode = "ES";
        break;
      case "zh":
        langCode = "ZH";
        break;
      case "fr":
        langCode = "FR";
        break;
    }

    setCurrentLanguage(langCode);

    // Automatically update currency based on language
    const newCurrency = LANGUAGE_CURRENCY_MAP[langCode] || "USD";
    setCurrency(newCurrency);
    localStorage.setItem("currency", newCurrency);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      setVisible(currentScrollY < lastScrollY || currentScrollY < 20);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const toggleMenu = () => {
    setLanguageMenuOpen(false);
    setMenuOpen((prev) => !prev);
  };

  const toggleLanguageMenu = () => {
    setMenuOpen(false);
    setLanguageMenuOpen((prev) => !prev);
  };

  const handleLanguageChange = (langCode: string) => {
    const segments = pathname.split("/").filter(Boolean);

    // Remove existing language code (if any)
    const validLangCodes = ["pt", "en", "es", "zh", "fr", "ja", "ru"];
    if (segments.length > 0 && validLangCodes.includes(segments[0].toLowerCase())) {
      segments.shift();
    }

    // Add new language code
    const newLangPrefix = langCode.toLowerCase();
    const newPath = "/" + newLangPrefix + (segments.length > 0 ? "/" + segments.join("/") : "");

    window.location.href = newPath;
  };

  const headerAnimationProps = {
    initial: { opacity: 1, y: 0 },
    animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -40 },
    transition: { duration: 0.4, ease: "easeInOut" as const },
  };

  return (
    <>
      <motion.header
        {...headerAnimationProps}
        className={clsx(
          "fixed top-0 left-0 w-full z-99 transition-all duration-300",
          scrolled ? "bg-white" : "bg-white/80",
          [
            "/login", "/register", "/reset",
            "/pt/login", "/pt/register", "/pt/reset",
            "/en/login", "/en/register", "/en/reset"
          ].includes(pathname) && "hidden"
        )}
      >
        <nav className="w-full mx-auto flex justify-between items-center px-6 sm:px-32 py-4 relative">
          {/* Left side - Menu + Language + Logo AI */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMenu}
              className="relative w-8 h-8 flex items-center justify-center"
            >
              <motion.span
                className="absolute w-4 h-0.5 bg-black"
                animate={menuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="absolute w-4 h-0.5 bg-black"
                animate={menuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
                transition={{ duration: 0.3 }}
              />
            </button>

            <button
              onClick={toggleLanguageMenu}
              className="text-black uppercase text-xs font-[HandoBold] border-white py-1 transition hover:bg-white hover:text-black"
            >
              {currentLanguage}
            </button>
            
            <button
              onClick={() => setLogoAIOpen(true)}
              className="flex items-center justify-center text-center px-1 bg-[#f3f3f3] py-1 rounded-md text-[10px] font-[HandoBold] text-black hover:bg-gray-200 transition"
            >
             
              <img src='/gif/logo-gen-gif.gif' className="max-w-4"/>
              <span>{t("generate.header")}</span>

             
            </button>
          </div>

          {/* Center Logo */}
          <Link href="/" className=" -translate-x-6 relative transform flex items-center gap-2 font-bold text-2xl">
            <img src="/logo/line-embroidery-logo.png" alt="Line Embroidery Logo" className="max-w-18" />
          </Link>

          {/* Right side - Cart + User/Login */}
          <div className="flex items-center gap-4">
            <Link href='/cart' className="relative">
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                >
                  {cartItemCount}
                </motion.div>
              )}
            </Link>

            {user ? (
              <Link href="/profile">
                <div className="flex bg-black px-2 py-1 rounded-md items-center gap-1">
                  <User size={20} className="text-white" />
                </div>
              </Link>
            ) : (
              <Link href='/login'>
                <div className="flex bg-black px-2 py-1 rounded-md">
                  <h1 className="font-[HandoBold] text-white">Login</h1>
                </div>
              </Link>
            )}
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-998 bg-black/40 backdrop-blur-sm"
            />

            {/* Menu Desktop */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="hidden md:flex fixed top-0 left-0 h-screen bg-black z-999 flex-col justify-start pt-24 px-6 pb-8 overflow-y-auto min-w-[600px] shadow-2xl"
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-6 right-6 text-white text-2xl focus:outline-none hover:text-gray-300 transition"
                aria-label="Close menu"
              >
                ×
              </button>

              <div className="flex flex-col gap-6 mt-4">
                {MENU_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ 
                      x: 0, 
                      opacity: 1, 
                      transition: { delay: 0.1 + index * 0.05, type: "spring" } 
                    }}
                    exit={{ x: -20, opacity: 0, transition: { duration: 0.1 } }}
                  >
                    <Link
                      href={item.path}
                      onClick={() => setMenuOpen(false)}
                      className="text-white uppercase tracking-wide text-lg font-[HandoRegular] py-2 border-b border-gray-700 hover:border-white transition block"
                    >
                      {t(`menu.${item.key}`)}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Full Screen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 200 } }}
            exit={{ y: "-100%", opacity: 0, transition: { duration: 0.35, ease: [0.33, 1, 0.68, 1] } }}
            className="md:hidden fixed top-0 left-0 w-full h-screen bg-black z-999 flex flex-col justify-start pt-24 px-6 pb-8 overflow-y-auto"
          >
            <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-6 text-white text-2xl focus:outline-none" aria-label="Close menu">×</button>
            <div className="flex flex-col gap-6 mt-4">
              {MENU_ITEMS.map((item, index) => (
                <motion.div key={item.key} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1, transition: { delay: 0.4 + index * 0.1, type: "spring", stiffness: 300, damping: 24 } }} exit={{ x: -20, opacity: 0, transition: { duration: 0.15 } }}>
                  <a href={item.path} onClick={() => setMenuOpen(false)} className="text-white uppercase tracking-wide text-lg font-[HandoRegular] py-2 border-b border-gray-700 hover:border-white transition">
                    {t(`menu.${item.key}`)}
                  </a>
                </motion.div>
              ))} 
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Menu */}
      <AnimatePresence>
        {languageMenuOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed top-0 left-0 w-full h-full bg-[#131313]/90 flex flex-col z-60 items-center justify-center gap-16"
            onClick={(e) => e.target === e.currentTarget && setLanguageMenuOpen(false)}
          >
            <div className="flex flex-col gap-8 text-center">
              <p className="text-white text-xs uppercase font-[HandoBold] tracking-tight">{t("language.select")}</p>
              <div className="flex gap-2 justify-center items-center">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={clsx(
                      "text-white text-sm w-full max-w-max uppercase font-[HandoRegular] border px-4 py-2 tracking-tight transition",
                      currentLanguage === lang.code ? "border-white" : "border-transparent hover:border-white"
                    )}
                    aria-current={currentLanguage === lang.code ? "true" : undefined}
                  >
                    {lang.fullName}
                  </button>
                ))}
              </div>
            </div>
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
};

export default HeaderComponent;