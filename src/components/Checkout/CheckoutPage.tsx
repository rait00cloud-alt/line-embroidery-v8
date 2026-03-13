"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/components/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import {Lock} from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const DESIGN_COST_PER_ASSET = 45;
const SERVICE_TAX_RATE = 0.03;
const SELLER_TAX_RATE = 0.10;

function CheckoutForm({ clientSecret, total }: { clientSecret: string; total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const t = useTranslations("CheckoutPage");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      },
    });
    if (submitError) {
      setError(submitError.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-black text-white py-3.5 rounded-lg hover:bg-gray-800 font-[HandoBold] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? t("processing") : `${t("pay_now")} - $${total.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const t = useTranslations("CheckoutPage");
  const { cart } = useCart();
  const { format } = useCurrency();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: any } | null>(null);
  const [coupon, setCoupon] = useState<any>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [guestLocked, setGuestLocked] = useState(false);

  useEffect(() => {
    const fetchUserAndCoupon = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setGuestEmail(user.email || "");
        setGuestName(user.user_metadata?.full_name || "");

        const now = new Date().toISOString();
        const { data: coupons } = await supabase
          .from("coupons")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_used", false)
          .or(`expires_at.is.null,expires_at.gt.${now}`)
          .order("discount", { ascending: false });

        if (coupons && coupons.length > 0) setCoupon(coupons[0]);
      }
    };
    fetchUserAndCoupon();
  }, []);

  const shippingSelected = searchParams.get("shippingAmount")
    ? {
        amount: Number(searchParams.get("shippingAmount")),
        provider: searchParams.get("shippingId"),
      }
    : null;

  const shippingAddress = {
    line1: searchParams.get("addressLine1") || "",
    city: searchParams.get("city") || "",
    state: searchParams.get("state") || "",
    zip: searchParams.get("zip") || "",
    country: searchParams.get("country") || "",
  };

  const couponCode = coupon?.code || null;
  const couponDiscountPercent = coupon?.discount || 0;

  const productSubtotal = cart.reduce((sum, item) => {
    const assetCount = item.design?.length || 0;
    const designCost = assetCount * DESIGN_COST_PER_ASSET;
    const basePrice = item.price - designCost;
    return sum + basePrice * item.quantity;
  }, 0);

  const customizationCost = cart.reduce((sum, item) => {
    const assetCount = item.design?.length || 0;
    return sum + assetCount * DESIGN_COST_PER_ASSET * item.quantity;
  }, 0);

  const subtotalBeforeDiscount = productSubtotal + customizationCost;
  const couponDiscount = couponDiscountPercent
    ? (subtotalBeforeDiscount * couponDiscountPercent) / 100
    : 0;
  const totalAfterDiscount = subtotalBeforeDiscount - couponDiscount;
  const serviceTax = totalAfterDiscount * SERVICE_TAX_RATE;
  const sellerTax = totalAfterDiscount * SELLER_TAX_RATE;
  const totalTaxes = serviceTax + sellerTax;
  const shippingAmount = shippingSelected?.amount || 0;
  const total = totalAfterDiscount + shippingAmount + totalTaxes;

  // Guest fields are valid when both name and email are filled
  const guestValid = guestEmail.trim().length > 0 && guestName.trim().length > 0;
  // Button is enabled only when shipping is selected and (user is logged in OR guest fields are filled)
  const canProceed = !!shippingSelected && !clientSecret && !loading && (user ? true : guestValid);

  const handleContinueToPayment = async () => {
    if (!canProceed) return;

    // Lock fields immediately on click
    setGuestLocked(true);
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          shippingAddress,
          shippingCost: shippingSelected!.amount,
          couponId: coupon?.id || null,
          user_id: user?.id || null,
          guestEmail,
          guestName,
          taxes: { serviceTax, sellerTax, totalTaxes },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("checkout_failed"));

      setClientSecret(data.clientSecret);
    } catch (err) {
      setGuestLocked(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 mt-16 px-6 py-8 flex flex-col items-center w-full">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-[HandoBold] mb-6"
      >
        {t("checkout_title")}
      </motion.h1>

      <motion.div
        key="checkout-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg h-full border border-gray-200 max-w-4xl w-full"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-[HandoBold]">{t("order_summary")}</h2>
        </div>

        {/* Guest fields — shown only when not logged in and payment not yet started */}
        {!user && (
          <div className="p-6 border-b border-gray-200 space-y-4">
            <h3 className="text-lg font-[HandoBold]">{t("guest_checkout")}</h3>
            <div className="relative">
              <input
                type="text"
                placeholder={t("guest_name")}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                disabled={guestLocked}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-[HandoRegular]"
              />
              {guestLocked && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  <Lock size={8}/>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="email"
                placeholder={t("guest_email")}
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                disabled={guestLocked}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-[HandoRegular]"
              />
              {guestLocked && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  <Lock size={8}/>
                </span>
              )}
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          <AnimatePresence>
            {cart.map((item) => {
              const assetCount = item.design?.length || 0;
              const designCostPerItem = assetCount * DESIGN_COST_PER_ASSET;
              const basePrice = item.price - designCostPerItem;
              const itemTotalPrice = item.price * item.quantity;

              return (
                <motion.div
                  key={`${item.id}-${item.color}-${item.size}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-between"
                >
                  <div>
                    <p className="font-[HandoBold]">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.color} • {item.size}</p>
                    <p className="text-sm text-gray-600">
                      Base: {format(basePrice)}
                      {assetCount > 0 && ` + Design: ${format(designCostPerItem)}`}
                    </p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-[HandoBold]">{format(itemTotalPrice)}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="border-t pt-4 space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span>{t("products_subtotal")}</span>
              <span>{format(productSubtotal)}</span>
            </div>

            {customizationCost > 0 && (
              <div className="flex justify-between text-purple-600 text-sm">
                <span>Customization</span>
                <span>{format(customizationCost)}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-600 text-sm">
                <span>{t("discount")} ({couponCode})</span>
                <span>-{format(couponDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>Service Tax (3%)</span>
              <span>{format(serviceTax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Seller Tax (10%)</span>
              <span>{format(sellerTax)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Taxes Total</span>
              <span>{format(totalTaxes)}</span>
            </div>

            <div className="flex justify-between text-sm border-t pt-2">
              <span>{t("shipping")}</span>
              <span className="font-medium text-green-600">
                {shippingSelected
                  ? format(shippingSelected.amount)
                  : t("calculated_next_step")}
              </span>
            </div>

            <div className="flex justify-between text-lg font-[HandoBold] mt-2 border-t pt-2">
              <span>{t("total")}</span>
              <span>{format(total)}</span>
            </div>

            {!clientSecret ? (
              <button
                onClick={handleContinueToPayment}
                disabled={!canProceed}
                className="w-full bg-black text-white py-3.5 rounded-lg hover:bg-gray-800 font-[HandoBold] transition-colors mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <img src="/loading/loading.gif" alt="Loading..." className="w-6 h-6" />
                ) : (
                  t("continue_to_payment")
                )}
              </button>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} total={total} />
              </Elements>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}