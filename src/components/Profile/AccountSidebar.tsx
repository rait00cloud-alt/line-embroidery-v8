"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/components/lib/supabase";

type Tab = "profile" | "addresses" | "coupons" | "designs" | "purchases";

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function AccountSidebar({ activeTab, setActiveTab }: Props) {
  const t = useTranslations("AccountPage.Sidebar");

  const tabs: { key: Tab; labelKey: string }[] = [
    { key: "profile", labelKey: "profile" },
    { key: "addresses", labelKey: "addresses" },
    { key: "coupons", labelKey: "coupons" },
    { key: "purchases", labelKey: "purchases" }
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <aside className="w-full sm:max-w-68 bg-gray-100 p-6 flex flex-col gap-4">
      <h2 className="font-[HandoBold] text-xl mb-4">{t("my_account")}</h2>

      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`text-left p-2 font-[HandoRegular] rounded ${
            activeTab === tab.key ? "bg-gray-300" : ""
          }`}
        >
          {t(tab.labelKey)}
        </button>
      ))}

      <button
        onClick={handleLogout}
        className="mt-auto bg-red-600 text-white p-2 rounded font-[HandoBold] hover:bg-red-700"
      >
        {t("logout")}
      </button>
    </aside>
  );
}
