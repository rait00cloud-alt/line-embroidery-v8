export type Currency = "USD" | "BRL" | "EUR" | "CNY";

export const LOCALE_TO_CURRENCY: Record<string, Currency> = {
  en: "USD",
  pt: "BRL",
  es: "EUR",
  zh: "CNY",
};

export const CURRENCY_LOCALE: Record<Currency, string> = {
  USD: "en-US",
  BRL: "pt-BR",
  EUR: "es-ES",
  CNY: "zh-CN",
};

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  USD: "$",
  BRL: "R$",
  EUR: "€",
  CNY: "¥",
};
