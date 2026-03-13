"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/components/lib/supabase";

// Components
import AccountSidebar from "@/components/Profile/AccountSidebar";
import ProfileCard from "@/components/Profile/ProfileCard";
import AddressCard from "@/components/Profile/AddressCard";
import CouponCard from "@/components/Profile/CouponCard";
import DesignCard from "@/components/Profile/DesignCard";
import PurchaseCard from "@/components/Profile/PurchaseCard";

type Tab = "profile" | "addresses" | "coupons" | "designs" | "purchases";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(false);

  const fetchUserData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUser(null);
      setLoading(false);
      return;
    }
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

    // Fetch data
    const { data: purchases, error: purchasesError } = await supabase.from("purchases").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    console.log("Fetching purchases for user:", user.id);
    console.log("Purchases data:", purchases);
    console.log("Purchases error:", purchasesError);
    console.log("Number of purchases found:", purchases?.length || 0);
    setPurchases(purchases || []);

    const { data: designs, error: designsError } = await supabase.from("designs").select("*").eq("user_id", user.id);
    console.log("Designs data:", designs);
    console.log("Designs error:", designsError);
    setDesigns(designs || []);

    const { data: coupons } = await supabase.from("coupons").select("*").eq("user_id", user.id);
    setCoupons(coupons || []);

    const { data: addresses } = await supabase.from("addresses").select("*").eq("user_id", user.id);
    setAddresses(addresses || []);
    
    setLoading(false);
  };
  useEffect(() => {
  const syncUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
      });

      
    }
  };

  syncUser();
}, []);


  const generateCouponCode = () => "WELCOME10-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  useEffect(() => {
    fetchUserData();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex w-full mx-auto mt-16 flex-col sm:flex-row">
      {/* Sidebar */}
      <AccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 p-6">
        {activeTab === "profile" && <ProfileCard user={user} onUpdate={setUser} />}
        {activeTab === "addresses" && <AddressCard />}
    
        {activeTab === "coupons" && <CouponCard coupons={coupons} />}
        {activeTab === "designs" && <DesignCard designs={designs} />}
        {activeTab === "purchases" && <PurchaseCard purchases={purchases} onRefresh={fetchUserData} loading={loading} />}
      </main>
    </div>
  );
}
