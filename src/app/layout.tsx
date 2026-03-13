import React from "react";
import Header from "@/ui/Header";
import FooterComponent from "@/ui/Footer";
import { Inter } from "next/font/google";
import clsx from "clsx";
import { getMessages } from "next-intl/server";
import {NextIntlClientProvider} from 'next-intl';
import "@/styles/globals.css";
import {setRequestLocale} from 'next-intl/server';

import {routing} from '@/i18n/routing';
import { CartProvider } from "@/contexts/CartContext";
import { Currency } from "lucide-react";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";

const inter = Inter({ subsets: ["latin"] });

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params; 
  
  if (!routing.locales.includes(locale as any)) {
    // Handle invalid locale (e.g., redirect or throw error)
  }
  
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={clsx(inter.className, "flex h-full flex-col scroll-smooth")}>
        
          <NextIntlClientProvider locale={locale} messages={messages}>
            <CurrencyProvider>
            <CartProvider>
            <Header />
            {children}
            <FooterComponent />
            </CartProvider>
            </CurrencyProvider>
          </NextIntlClientProvider>
        
      </body>
    </html>
  );
}