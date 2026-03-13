"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CardElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";

export type ProductVariant = {
  color: string;
  images: string[];
  sku?: string;
};

export type Product = {
  id: number;
  slug: string;
  title: string;
  price: number;
  category: string;
  mainImg: string;
  subcategory?: string;
  description?: string;
  variants?: ProductVariant[];
};

interface CheckoutItem {
  product: Product;
  quantity: number;
  color?: string;
  size?: string;
  design?: any[];
  designCost?: number; // custo da personalização
  price?: number; // preço base + custom
}

interface Address {
  name: string;
  line1: string;
  city: string;
  postal_code: string;
  country: string;
}

interface CheckoutFormProps {
  items: CheckoutItem[];
  coupon?: { code: string; discount: number };
  shipping?: { provider: string; amount: number; service_level: string };
  onSuccess: () => void;
}

type PaymentIntentResponse = {
  clientSecret?: string;
  error?: string;
  amount?: number;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  items,
  coupon,
  shipping,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

  const [address, setAddress] = useState<Address>({
    name: "",
    line1: "",
    city: "",
    postal_code: "",
    country: "US",
  });

  // Limpa erros quando o usuário digita
  useEffect(() => {
    if (error) setError(null);
  }, [email, address, items]);

  // Helper para sanitizar items para API
  const sanitizeItems = (items: CheckoutItem[]) =>
    items.map(({ product, quantity, design, designCost, ...rest }) => ({
      product: { ...product, price: Number(product.price ?? 0) },
      quantity: Number(quantity),
      design,
      designCost,
      ...rest,
    }));

  // Cálculos de totais
  const productSubtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const customizationCost = items.reduce(
    (sum, item) => sum + (item.designCost ?? 0) * item.quantity,
    0
  );

  const total = productSubtotal + customizationCost;
  const couponDiscount = coupon ? total * (coupon.discount / 100) : 0;
  const totalWithShipping = total - couponDiscount + (shipping?.amount || 0);

  // Cria PaymentIntent no servidor
  const createPaymentIntent = async () => {
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: sanitizeItems(items),
        email,
        address,
        total: totalWithShipping,
      }),
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data: PaymentIntentResponse = await res.json();
    if (!data.clientSecret)
      throw new Error("No client secret received from server");
    return data.clientSecret;
  };

  // Fluxo Card
  const payWithCard = async () => {
    if (!stripe || !elements) throw new Error("Stripe not loaded");

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) throw new Error("Card element not found");

    const clientSecret = await createPaymentIntent();

    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: address.name,
            email,
            address: {
              line1: address.line1,
              city: address.city,
              postal_code: address.postal_code,
              country: address.country,
            },
          },
        },
      }
    );

    if (paymentError) throw new Error(paymentError.message || "Payment failed");
    if (paymentIntent?.status !== "succeeded")
      throw new Error(`Payment status: ${paymentIntent?.status}`);

    // Envia invoice
    await fetch("/api/send-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        email,
        address,
        total: totalWithShipping,
      }),
    });

    onSuccess();
  };

  // Fluxo Apple / Google Pay
  useEffect(() => {
    if (!stripe || items.length === 0) return;

    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: { label: "Total", amount: Math.round(totalWithShipping * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) setPaymentRequest(pr);
    });

    pr.on("shippingaddresschange", (ev: any) => {
      ev.updateWith({
        status: "success",
        shippingOptions: [
          { id: "standard", label: "Standard Shipping", detail: "5-7 business days", amount: shipping?.amount ?? 0 },
        ],
      });
    });

    pr.on("paymentmethod", async (ev: any) => {
      try {
        const paymentAddress = {
          name: ev.payerName || ev.shippingAddress?.recipient || "Customer",
          line1: ev.shippingAddress?.addressLine?.[0] || "",
          city: ev.shippingAddress?.city || "",
          postal_code: ev.shippingAddress?.postalCode || "",
          country: ev.shippingAddress?.country || "US",
        };

        const clientSecret = await createPaymentIntent();

        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: true }
        );

        if (confirmError || paymentIntent?.status !== "succeeded") {
          ev.complete("fail");
          setError(confirmError?.message || `Payment status: ${paymentIntent?.status}`);
          return;
        }

        ev.complete("success");

        await fetch("/api/send-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, email: ev.payerEmail, address: paymentAddress, total: totalWithShipping }),
        });

        onSuccess();
      } catch (err: any) {
        ev.complete("fail");
        setError(err.message || "Payment failed");
      }
    });
  }, [stripe, items, totalWithShipping, shipping, email, onSuccess]);

  // Submit do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await payWithCard();
    } catch (err: any) {
      setError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative text-white max-w-2xl mx-auto p-6 bg-black/80 rounded-xl shadow-lg my-16"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Itens do Carrinho */}
      <div className="space-y-4 mb-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4 items-center border-b border-white/20 pb-4">
            <img src={item.product.mainImg || "/placeholder.jpg"} alt={item.product.title} className="w-16 h-16 object-cover rounded-lg border" />
            <div className="flex-1">
              <p className="text-white font-medium">{item.product.title}</p>
              <p className="text-sm text-white/60">Qty: {item.quantity}</p>
              {item.designCost && item.designCost > 0 && (
                <p className="text-sm text-purple-400">Customization: ${item.designCost.toFixed(2)}</p>
              )}
            </div>
            <p className="text-white font-medium">
              ${(item.product.price * item.quantity + (item.designCost ?? 0) * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Express Checkout */}
      {paymentRequest && (
        <div className="mb-6">
          <label className="block mb-2 text-sm text-white/60">Express Checkout</label>
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: { paymentRequestButton: { type: "default", theme: "dark", height: "48px" } },
            }}
          />
          <div className="my-4 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="text-sm text-white/60">or pay with card</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>
        </div>
      )}

      {/* Email */}
      <div className="mb-4">
        <label className="block mb-1 text-sm text-white/60">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 bg-black/60 border border-white/20 rounded text-white"
          required
        />
      </div>

      {/* Endereço */}
      <div className="mb-6 space-y-4">
        <h3 className="text-white font-semibold uppercase tracking-wide mb-2">Shipping Address</h3>
        <input type="text" placeholder="Name" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} className="w-full p-2 bg-black/60 border border-white/20 rounded text-white" required />
        <input type="text" placeholder="Address" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} className="w-full p-2 bg-black/60 border border-white/20 rounded text-white" required />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input type="text" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="w-full p-2 bg-black/60 border border-white/20 rounded text-white" required />
          <input type="text" placeholder="Postal Code" value={address.postal_code} onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} className="w-full p-2 bg-black/60 border border-white/20 rounded text-white" required />
          <select value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} className="w-full p-2 bg-black/60 border border-white/20 rounded text-white" required>
            <option value="US">United States</option>
            <option value="BR">Brazil</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>
        </div>
      </div>

      {/* Card */}
      <div className="mb-6">
        <label className="block mb-2 text-sm text-white/60">Card Info</label>
        <div className="bg-black/60 border border-white/20 p-4 rounded-lg">
          <CardElement options={{ style: { base: { fontSize: "16px", color: "#fff" }, invalid: { color: "#ef4444" } } }} />
        </div>
      </div>

      {/* Totais */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-white">
          <span>Products</span>
          <span>${productSubtotal.toFixed(2)}</span>
        </div>
        {customizationCost > 0 && (
          <div className="flex justify-between text-purple-400">
            <span>Customization</span>
            <span>${customizationCost.toFixed(2)}</span>
          </div>
        )}
        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-400">
            <span>Discount ({coupon?.code})</span>
            <span>-${couponDiscount.toFixed(2)}</span>
          </div>
        )}
        {shipping?.amount && (
          <div className="flex justify-between text-white">
            <span>Shipping ({shipping?.provider})</span>
            <span>${shipping?.amount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-white/20">
          <span>Total</span>
          <span>${totalWithShipping.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !stripe || !email || items.length === 0}
        className={`w-full py-3 uppercase tracking-tight border border-white rounded-lg ${
          loading || !stripe || !email || items.length === 0
            ? "bg-white/20 text-white/50 cursor-not-allowed"
            : "hover:bg-white hover:text-black"
        }`}
      >
        {loading ? "Processing..." : `Pay $${totalWithShipping.toFixed(2)}`}
      </button>
    </motion.form>
  );
};

export default CheckoutForm;
