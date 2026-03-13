"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Instagram, LucideYoutube, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation"; // SSR-safe pathname

interface LinkItem {
  title: string;
  path: string;
}

interface FooterColumnProps {
  title: string;
  links: LinkItem[];
}

const FooterColumn = ({ title, links }: FooterColumnProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col gap-3 items-start w-full">
      <div
        className="flex justify-between w-full cursor-pointer px-4 md:px-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-[HandoBold] text-xl">{title}</h3>
        <span className="md:hidden">
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </span>
      </div>

      <motion.div
        className={`md:block overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } md:max-h-full md:opacity-100`}
      >
        <div className="flex flex-col gap-3 items-start px-4 md:px-0">
          {links.map((link, i) => (
            <motion.a
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: i * 0.05 }}
              href={link.path}
              className="font-[HandoRegular] uppercase text-black hover:text-gray-400 text-xs"
            >
              {link.title}
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const FooterComponent = () => {
  const t = useTranslations();
const pathname = usePathname();

const hideFooterRoutes = ["/", "/login", "/register", "/reset"];

const shouldHideFooter =
  hideFooterRoutes.includes(pathname || "") ||
  pathname?.startsWith("/products/") && pathname.endsWith("/design");

if (!pathname || shouldHideFooter) return null;

 

  const helpLinks: LinkItem[] = [
    { title: t("support.faq"), path: "/about#faq" },
    { title: t("support.shipping"), path: "/about#faq" },
    { title: t("support.refund"), path: "/refunds#faq" },
  ];

  const infoLinks: LinkItem[] = [
    { title: t("info.about"), path: "/about" },
    
    { title: t("info.privacy"), path: "/privacy-policy" },
    { title: t("info.terms"), path: "/terms" },
  ];



  return (
    <footer className="w-full flex flex-col justify-between bg-white">
      {/* Top Products Categories */}
     

      {/* Main Footer */}
      <div className="flex flex-col md:flex-row w-full justify-between items-start px-4 md:px-16 py-8 gap-8">
        {/* Left: Logo + Phrase + Social */}
        <div className="flex flex-col gap-6 items-start max-w-md">
          <h3 className="font-[HandoBold] text-xl sm:text-4xl">{t("phrase")}</h3>

          <div className="flex flex-row gap-4 justify-center items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1}}
              transition={{ duration: 1, ease: "linear" }}
              className="p-4 flex justify-center items-center"
            >
              <Link href="/">
                <img
                  className="max-w-[128px]"
                  src="/logo/line-embroidery-logo.png"
                  alt="Logo"
                />
              </Link>
            </motion.div>

          </div>
        </div>

        {/* Right: Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full md:w-auto">
          
          <FooterColumn title={t("support.title")} links={helpLinks} />
          <FooterColumn title={t("info.title")} links={infoLinks} />
          
        </div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-xs text-gray-400 py-3 px-4 md:px-16 flex flex-col md:flex-row justify-between items-center text-center gap-1"
      >
        <motion.p className="font-[HandoBold] text-black text-xs" whileHover={{ scale: 1.02 }}>
          Line Embroidery. All rights reserved. ©
        </motion.p>

        <motion.a
          href="https://www.industriebrasil.com.br"
          className="font-[HandoBold] text-black hover:text-gray-400 text-xs hover:underline whitespace-nowrap"
          whileHover={{ scale: 1.05 }}
        >
          Produced by Industrie Brasil
        </motion.a>
      </motion.div>
    </footer>
  );
};

export default FooterComponent;
