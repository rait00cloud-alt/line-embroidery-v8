"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LOCALE_TO_CURRENCY,
  CURRENCY_SYMBOL,
  CURRENCY_LOCALE,
  Currency
} from "@/components/config/Currency";

type CurrencyContextType = {
  currency: Currency;
  symbol: string;
  format: (usd: number) => string;
  setCurrency: (c: Currency) => void;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  // Inicializa com base no locale, sem usar localStorage
  const [currency, setCurrency] = useState<Currency>(LOCALE_TO_CURRENCY[locale] ?? "USD");
  const [rates, setRates] = useState<Record<Currency, number>>({
    USD: 1,
    BRL: 1,
    EUR: 1,
    CNY: 1,
  });

  // Agora sim, só acessa localStorage no client
  useEffect(() => {
    const saved = localStorage.getItem("currency") as Currency;
    if (saved) setCurrency(saved);
  }, []);

  useEffect(() => {
    // Persiste no localStorage
    localStorage.setItem("currency", currency);
  }, [currency]);

  // Buscar taxa de câmbio
  useEffect(() => {
    if (currency === "USD") return;

    fetch("/api/exchange-rate")
      .then(res => res.json())
      .then(data => setRates(prev => ({ ...prev, ...data })))
      .catch(() => {});
  }, [currency]);

  const format = useMemo(() => {
    return (usd: number) => {
      const value = usd * (rates[currency] || 1);
      return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
        style: "currency",
        currency,
      }).format(value);
    };
  }, [currency, rates]);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol: CURRENCY_SYMBOL[currency],
        format,
        setCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be inside CurrencyProvider");
  return ctx;
};
