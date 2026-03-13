"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  Minus,
  Palette,
  MapPin,
  Truck,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useTranslations } from "next-intl";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";


export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const { format } = useCurrency();
  const t = useTranslations("CartPage");
  const router = useRouter();
  const [coupon, setCoupon] = useState<any>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [isClient, setIsClient] = useState(false);
  const [session, setSession] = useState<any>(null);

  const SERVICE_TAX_RATE = 0.03; // 3%
  const SELLER_TAX_RATE = 0.10; // 10%

  // Shipping
  const [address, setAddress] = useState({
    line1: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingExpanded, setShippingExpanded] = useState(true);
  const [shippingError, setShippingError] = useState("");
  const [userCoupons, setUserCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Selected items
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Toast for messages
  const [toast, setToast] = useState<{ type: "error" | "info"; message: string } | null>(null);

  const showToast = (message: string, type: "error" | "info" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load saved shipping from sessionStorage
  useEffect(() => {
    const savedShipping = sessionStorage.getItem("selectedShipping");
    if (savedShipping) {
      setSelectedShipping(JSON.parse(savedShipping));
    }
  }, []);

  // Load user address from database
  useEffect(() => {
    if (!session) return;

    const loadUserAddress = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("address_street, address_city, address_state, address_zip, address_country")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error || !data) return;

      setAddress((prev) => ({
        line1: prev.line1 || data.address_street || "",
        city: prev.city || data.address_city || "",
        state: prev.state || data.address_state || "",
        zip: prev.zip || data.address_zip || "",
        country: prev.country || data.address_country || "US",
      }));
    };

    loadUserAddress();
  }, [session]);

  // Load user coupons - CORRIGIDO
  useEffect(() => {
    if (!session) return;

    const fetchCoupons = async () => {
      setLoadingCoupons(true);

      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("is_used", false)
        .order("discount", { ascending: false });

      setLoadingCoupons(false);

      if (error) {
        console.error("Error loading coupons:", error);
        return;
      }

      setUserCoupons(data || []);
    };

    fetchCoupons();
  }, [session]);

  useEffect(() => {
    if (userCoupons.length > 0 && !coupon) {
      setCoupon(userCoupons[0]); // best coupon
    }
  }, [userCoupons]);

  useEffect(() => setIsClient(true), []);

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const productSubtotal = cart.reduce((sum, item) => {
    const designCost = (item.design?.length || 0) * 1;
    const basePrice = item.price - designCost;
    return sum + basePrice * item.quantity;
  }, 0);

  const customizationCost = cart.reduce((sum, item) => {
    const assetCount = item.design?.length || 0;
    return sum + assetCount * 45;
  }, 0);

  const total = productSubtotal + customizationCost;

  const couponDiscount = coupon ? total * (Number(coupon.discount) / 100) : 0;

  const totalAfterDiscount = total - couponDiscount;
  const shippingAmount = selectedShipping?.amount || 0;
  const totalWithShipping = totalAfterDiscount + shippingAmount;

  // 💡 TAXES (applied on discounted subtotal, NOT on shipping)
  const serviceTax = totalAfterDiscount * SERVICE_TAX_RATE;
  const sellerTax = totalAfterDiscount * SELLER_TAX_RATE;
  const totalTaxes = serviceTax + sellerTax;
  const totalWithShippingAndTaxes = totalWithShipping + totalTaxes;

  const handleQuantityChange = (id: number, size: string, color: string, delta: number) => {
    const item = cart.find((i) => i.id === id && i.size === size && i.color === color);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity > 0) updateQuantity(id, size, color, newQuantity);
    else removeFromCart(item);
  };

  const handleRemove = (id: number, size: string, color: string) => {
    const item = cart.find((i) => i.id === id && i.size === size && i.color === color);
    if (item) removeFromCart(item);
  };

  const toggleSelectItem = (key: string) => {
    const newSelected = new Set(selectedItems);
    newSelected.has(key) ? newSelected.delete(key) : newSelected.add(key);
    setSelectedItems(newSelected);
  };

  // CORRIGIDO: applyCoupon agora busca pelo código digitado
  const applyCoupon = async () => {
    if (!couponInput.trim()) {
      return showToast("Enter a coupon code");
    }

    if (!session) {
      return showToast("Please login to use a coupon");
    }

    setCouponLoading(true);

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("code", couponInput.trim().toUpperCase())
      .eq("is_used", false)
      .maybeSingle();

    setCouponLoading(false);

    if (error || !data) {
      return showToast("Invalid or expired coupon");
    }

    setCoupon(data);
    setCouponInput("");
    showToast("Coupon applied successfully!", "info");
  };

  const removeCoupon = () => {
    setCoupon(null);
    showToast("Coupon removed", "info");
  };

  const calculateShipping = async () => {
    if (!address.line1 || !address.city || !address.zip) {
      setShippingError("Please fill in all required fields");
      return;
    }

    setLoadingShipping(true);
    setShippingError("");

    try {
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, address }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to calculate shipping");

      setShippingOptions(data.rates || []);
      setSelectedShipping(data.rates[0] || null);

      // 💾 Save selected shipping to sessionStorage
      if (data.rates && data.rates[0]) {
        sessionStorage.setItem("selectedShipping", JSON.stringify(data.rates[0]));
      }
    } catch (err) {
      console.error(err);
      setShippingError("Unable to calculate shipping rates. Please try again.");
      setShippingOptions([]);
      setSelectedShipping(null);
      sessionStorage.removeItem("selectedShipping");
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleSelectShipping = (opt: any) => {
    setSelectedShipping(opt);
    sessionStorage.setItem("selectedShipping", JSON.stringify(opt));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return showToast(t("cart_empty_alert"));
    if (!selectedShipping) return showToast(t("calculate_shipping_first"));

    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const queryParams = new URLSearchParams({
        shippingId: selectedShipping?.provider || "",
        shippingAmount: String(selectedShipping?.amount || 0),
        addressLine1: address.line1 || "",
        city: address.city || "",
        state: address.state || "",
        zip: address.zip || "",
        country: address.country || "",
        ...(coupon ? { couponCode: coupon.code } : {}),
      }).toString();

      router.push(`/checkout?${queryParams}`);
    } else {
         const queryParams = new URLSearchParams({
        shippingId: selectedShipping?.provider || "",
        shippingAmount: String(selectedShipping?.amount || 0),
        addressLine1: address.line1 || "",
        city: address.city || "",
        state: address.state || "",
        zip: address.zip || "",
        country: address.country || "",
        ...(coupon ? { couponCode: coupon.code } : {}),
      }).toString();

      router.push(`/checkout?${queryParams}`);
    }
  };

  if (!isClient)
    return (
      <div className="relative w-screen h-screen flex justify-center items-center bg-gray-50">
        <img src="/loading/loading.gif" className="max-w-xl" />
      </div>
    );


  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl mb-6 font-[HandoBold]">
          {t("cart_title", { count: cart.length })}
        </h2>

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">{t("cart_empty")}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                <button className="text-red-600 hover:underline" onClick={() => clearCart()}>
                  {t("clear_cart")}
                </button>
              </div>

              {cart.map((item) => {
                const key = `${item.id}-${item.color}-${item.size}`;
                const isCustom = item.design && item.design.length > 0;
                const assetCount = item.design?.length || 0;
                const designCost = assetCount * 1;
                const basePrice = item.price - designCost;
                const itemTotal = item.price * item.quantity;

                return (
                  <div key={key} className="bg-white rounded-lg p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 mt-1"
                        checked={selectedItems.has(key)}
                        onChange={() => toggleSelectItem(key)}
                      />
                      <div className="flex items-center gap-1">
                        <span className="font-[HandoRegular] text-gray-700">#{item.id}</span>
                        {isCustom && (
                          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-[HandoBold] px-2 py-1 rounded">
                            <Palette size={12} />
                            {t("custom_design")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="flex flex-row gap-2 justify-between">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          <img
                            src={item.designUrl || "/placeholder.png"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-[HandoBold] text-lg">{item.name}</h3>
                          <p className="text-gray-600 text-sm">Color: {item.color}</p>
                          <p className="text-gray-600 text-sm">Size: {item.size}</p>
                          <p className="text-gray-600 text-sm mb-1">Price: {format(basePrice)}</p>

                          {isCustom && (
                            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                              <p className="text-xs text-gray-600 mb-1">
                                {t("customization_summary", {
                                  count: assetCount,
                                  price: format(designCost),
                                })}
                              </p>
                            </div>
                          )}

                          <button
                            className="text-red-600 hover:underline mt-2"
                            onClick={() => handleRemove(item.id, item.size, item.color)}
                          >
                            {t("remove")}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.size, item.color, -1)}
                          className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="text"
                          value={item.quantity}
                          readOnly
                          className="w-12 h-8 border rounded text-center"
                        />
                        <button
                          onClick={() => handleQuantityChange(item.id, item.size, item.color, 1)}
                          className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right ml-auto mt-2 md:mt-0">
                        <span className="text-xl font-[HandoBold]">{format(itemTotal)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary + Shipping */}
            <div className="lg:col-span-1 mt-6 lg:mt-0">
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-[HandoBold]">{t("order_summary")}</h3>
                </div>

                {/* Shipping */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setShippingExpanded(!shippingExpanded)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Truck size={20} className="text-blue-600" />
                      <div className="text-left">
                        <p className="font-[HandoBold] text-sm">Shipping</p>
                        {selectedShipping ? (
                          <p className="text-xs text-gray-600">
                            {selectedShipping.provider} - {format(selectedShipping.amount)}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">Calculate shipping</p>
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition-transform ${
                        shippingExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {shippingExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden px-6 pb-6 pt-2 bg-gray-50"
                      >
                        {/* Address Form */}
                        <div className="space-y-3 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Street Address *
                            </label>
                            <input
                              type="text"
                              placeholder="123 Main St"
                              value={address.line1}
                              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                City *
                              </label>
                              <input
                                type="text"
                                placeholder="New York"
                                value={address.city}
                                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                State *
                              </label>
                              <input
                                type="text"
                                placeholder="NY"
                                value={address.state}
                                onChange={(e) =>
                                  setAddress({ ...address, state: e.target.value.toUpperCase() })
                                }
                                maxLength={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm uppercase"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                ZIP Code *
                              </label>
                              <input
                                type="text"
                                placeholder="10001"
                                value={address.zip}
                                onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Country
                              </label>
                              <select
                                value={address.country}
                                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                              >
                                <option value="US">United States</option>
                                <option value="CA">Canada</option>
                                <option value="BR">Brazil</option>
                                <option value="JP">Japan</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {shippingError && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-xs text-red-600">{shippingError}</p>
                          </div>
                        )}

                        <button
                          onClick={calculateShipping}
                          disabled={loadingShipping}
                          className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          {loadingShipping ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Calculating...
                            </>
                          ) : (
                            <>
                              <MapPin size={16} />
                              Calculate Shipping
                            </>
                          )}
                        </button>

                        {shippingOptions.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {shippingOptions.map((opt, i) => {
                              const isSelected =
                                selectedShipping?.provider === opt.provider &&
                                selectedShipping?.service_level === opt.service_level;
                              return (
                                <label
                                  key={i}
                                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                                    isSelected
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-gray-200 hover:border-gray-300 bg-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      name="shippingOption"
                                      checked={isSelected}
                                      onChange={() => setSelectedShipping(opt)}
                                      className="w-4 h-4 text-blue-600"
                                    />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {opt.service_level}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {opt.provider} • {opt.estimated_days || "3-5"} business days
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-900">
                                      {format(opt.amount)}
                                    </span>
                                    {isSelected && <Check size={16} className="text-blue-600" />}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Coupon */}
                <div className="border-b border-gray-200">
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Palette size={20} className="text-purple-600" />
                      <p className="font-[HandoBold] text-sm">Coupon</p>
                    </div>

                    {/* Applied coupon */}
                    {coupon && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-green-700">{coupon.code}</p>
                            <p className="text-xs text-green-600">{coupon.discount}% off</p>
                          </div>
                          <button onClick={removeCoupon} className="text-green-700 hover:text-green-900">
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* User coupons */}
                    {!coupon &&
                      userCoupons.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setCoupon(c)}
                          className="w-full p-3 border rounded mt-2 text-left hover:bg-green-50"
                        >
                          <p className="font-bold">{c.code}</p>
                          <p className="text-xs">{c.discount}% off</p>
                        </button>
                      ))}

                    {/* Manual input (only if no coupons) */}
                    {!coupon && (!session || userCoupons.length === 0) && (
                      <div className="flex gap-2 max-w-xs w-full">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Enter coupon code"
                          className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={applyCoupon}
                          disabled={couponLoading}
                          className="shrink-0 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:bg-gray-300"
                        >
                          {couponLoading ? "..." : "Apply"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Totals */}
                <div className="p-6 space-y-3">
                  {/* Product subtotal */}
                  <div className="flex justify-between text-gray-700">
                    <span>Products</span>
                    <span>{format(productSubtotal)}</span>
                  </div>

                  {/* Customization */}
                  {customizationCost > 0 && (
                    <div className="flex justify-between text-purple-600">
                      <span>Customization</span>
                      <span>{format(customizationCost)}</span>
                    </div>
                  )}

                  {/* Coupon discount */}
                  {coupon && couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({coupon.code})</span>
                      <span>-{format(couponDiscount)}</span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span>{format(shippingAmount)}</span>
                  </div>

                  {/* Service Tax */}
                  <div className="flex justify-between text-gray-700">
                    <span>Service Tax (3%)</span>
                    <span>{format(serviceTax)}</span>
                  </div>

                  {/* Seller Tax */}
                  <div className="flex justify-between text-gray-700">
                    <span>Seller Tax (10%)</span>
                    <span>{format(sellerTax)}</span>
                  </div>

                  {/* Final Total */}
                  <div className="flex justify-between text-xl font-[HandoBold] mt-2 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>{format(totalWithShippingAndTaxes)}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full mt-3 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-medium text-sm transition-colors"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast messages */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded shadow text-white z-50 ${
              toast.type === "error" ? "bg-red-600" : "bg-blue-600"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}