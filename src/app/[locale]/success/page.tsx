"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/contexts/CartContext";
import TagCard from "@/components/Enterprise/BlanksContainer";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("SuccessPage");
  const { clearCart } = useCart();

  const status = searchParams.get("redirect_status");
  const paymentIntent = searchParams.get("payment_intent");

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentIntent) return;

      try {
        const res = await fetch(
          `/api/verify-payment?payment_intent=${paymentIntent}`
        );

        const data = await res.json();

        if (data.success) {
          setVerified(true);
          clearCart();
        }
      } catch (err) {
        // Silent error
      }

      setLoading(false);
    };

    verifyPayment();
  }, [paymentIntent, status, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <img src="/loading/loading.gif" className="w-24 h-24" />
        <p className="text-lg font-[HandoRegular]">{t("processing")}</p>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-[HandoBold] text-red-500">
          {t("verification_failed")}
        </h1>

        <button
          onClick={() => router.push("/")}
          className="mt-4 text-blue-600 hover:underline font-[HandoRegular]"
        >
          {t("back_home")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <TagCard
        paragraphs={[
          t("success_title"),
          t("email_confirmation"),
        ]}
        ctaText={t("continue_shopping")}
        onCtaClick={() => router.push("/")}
        bottomContent={
          <button
            onClick={() => router.push("/")}
            className="mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 font-[HandoBold] transition-colors"
          >
            {t("continue_shopping")}
          </button>
        }
      />
    </div>
  );
}
