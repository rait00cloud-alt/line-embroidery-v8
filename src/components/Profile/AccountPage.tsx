"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/components/lib/supabase";
import AccountSidebar from "./AccountSidebar";
import ProfileCard from "./ProfileCard";
import AddressCard from "./AddressCard";
import CouponCard from "./CouponCard";
import DesignCard from "./DesignCard";
import PurchaseCard from "./PurchaseCard";

type Tab = "profile" | "addresses" | "coupons" | "designs" | "purchases";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const generateCouponCode = () => "WELCOME10-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setUser(null);
      setUser(user);

      // Cupons
      const { data: existingCoupons } = await supabase.from("coupons").select("*").eq("user_id", user.id);
      if (!existingCoupons || existingCoupons.length === 0) {
        await supabase.from("coupons").insert({
          user_id: user.id,
          code: generateCouponCode(),
          discount: 10,
        });
      }

      const { data: purchases } = await supabase.from("purchases").select("*").eq("user_id", user.id);
      setPurchases(purchases || []);

      const { data: designs } = await supabase.from("designs").select("*").eq("user_id", user.id);
      setDesigns(designs || []);

      const { data: coupons } = await supabase.from("coupons").select("*").eq("user_id", user.id);
      setCoupons(coupons || []);

      const { data: addresses } = await supabase.from("addresses").select("*").eq("user_id", user.id);
      setAddresses(addresses || []);
    };

    fetchData();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex max-w-7xl mx-auto mt-16">
      <AccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6">
        {activeTab === "profile" && <ProfileCard user={user} onUpdate={setUser} />}
        {activeTab === "addresses" && <AddressCard addresses={addresses} />}
        {activeTab === "coupons" && <CouponCard coupons={coupons} />}
        {activeTab === "designs" && <DesignCard designs={designs} />}
        {activeTab === "purchases" && <PurchaseCard purchases={purchases} />}
      </main>
    </div>
  );
}
