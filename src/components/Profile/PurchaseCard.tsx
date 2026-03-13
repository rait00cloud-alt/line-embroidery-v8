"use client";

import React from "react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Package, MapPin, Calendar, CreditCard, User, Mail, RefreshCw } from "lucide-react";

interface Props {
  purchases: any[];
  onRefresh?: () => void;
  loading?: boolean;
}

export default function PurchaseCard({ purchases, onRefresh, loading }: Props) {
  const { format } = useCurrency();
  const t = useTranslations("AccountPage.PurchaseCard");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-[HandoBold]">{t("my_purchases")}</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-[HandoBold] text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>
      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="font-[HandoRegular] text-gray-600 mb-4">{t("no_purchases")}</p>
          {process.env.NODE_ENV === 'development' && onRefresh && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Debug: Check console for purchase fetch logs</p>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/test-purchases');
                    const data = await response.json();
                    console.log('Test purchases API response:', data);
                    onRefresh();
                  } catch (error) {
                    console.error('Test purchases error:', error);
                  }
                }}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Test Purchases API
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase, index) => (
            <motion.div
              key={purchase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-gray-600" />
                    <h3 className="font-[HandoBold] text-lg">
                      {t("order")} #{purchase.id.slice(-8).toUpperCase()}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-[HandoBold] ${getStatusColor(
                      purchase.status
                    )}`}
                  >
                    {purchase.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-[HandoRegular] text-gray-600">
                      {formatDate(purchase.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="font-[HandoBold] text-gray-900">
                      {format(purchase.amount)}
                    </span>
                  </div>
                  {purchase.guest_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="font-[HandoRegular] text-gray-600">
                        {purchase.guest_email}
                      </span>
                    </div>
                  )}
                  {purchase.guest_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-[HandoRegular] text-gray-600">
                        {purchase.guest_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="p-6">
                <h4 className="font-[HandoBold] text-sm text-gray-700 mb-3">
                  {t("products")}:
                </h4>
                <div className="space-y-3">
                  {purchase.cart_items?.map((item: any, itemIndex: number) => (
                    <div
                      key={itemIndex}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {item.designUrl && (
                          <img
                            src={item.designUrl}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        )}
                        <div>
                          <p className="font-[HandoBold] text-sm">{item.name}</p>
                          <p className="font-[HandoRegular] text-xs text-gray-600">
                            {t("size")}: {item.size} | {t("color")}: {item.color} | {t("qty")}: {item.quantity}
                          </p>
                          {item.type === "custom-design" && (
                            <p className="font-[HandoRegular] text-xs text-blue-600">
                              {t("custom_design")} ({item.design?.length || 0} {t("assets")})
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-[HandoBold] text-sm">
                        {format(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {purchase.shipping_address && (
                <div className="px-6 pb-6">
                  <h4 className="font-[HandoBold] text-sm text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t("shipping_address")}:
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-[HandoRegular] text-sm text-gray-700">
                      {purchase.shipping_address.name}
                    </p>
                    <p className="font-[HandoRegular] text-sm text-gray-600">
                      {purchase.shipping_address.line1}
                      {purchase.shipping_address.line2 && (
                        <>, {purchase.shipping_address.line2}</>
                      )}
                    </p>
                    <p className="font-[HandoRegular] text-sm text-gray-600">
                      {purchase.shipping_address.city}, {purchase.shipping_address.state}{" "}
                      {purchase.shipping_address.postal_code}
                    </p>
                    <p className="font-[HandoRegular] text-sm text-gray-600">
                      {purchase.shipping_address.country}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}