"use client";

import React, { useState } from "react";
import { supabase } from "@/components/lib/supabase";
import { useTranslations } from "next-intl";

interface Props {
  user: any;
  onUpdate: (user: any) => void;
}

export default function ProfileCard({ user, onUpdate }: Props) {
  const t = useTranslations("AccountPage.ProfileCard");

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.user_metadata?.name || "");
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.user_metadata?.phone || "");

  const handleUpdate = async () => {
    const { data, error } = await supabase.auth.updateUser({
      email,
      data: { name, phone },
    });
    if (!error) {
      onUpdate({ ...user, email, user_metadata: { name, phone } });
      setEditing(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-[HandoBold] mb-4">{t("profile")}</h2>
      {editing ? (
        <div className="flex flex-col gap-4 max-w-md">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("name_placeholder")}
            className="border p-2 rounded font-[HandoRegular]"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("email_placeholder")}
            className="border p-2 rounded font-[HandoRegular]"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("phone_placeholder")}
            className="border p-2 rounded font-[HandoRegular]"
          />
          <div className="flex gap-2">
            <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded font-[HandoBold]">
              {t("save")}
            </button>
            <button onClick={() => setEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded font-[HandoBold]">
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-w-md">
          <p className="font-[HandoRegular]">
            <strong>{t("name")}:</strong> {user.user_metadata?.name || "-"}
          </p>
          <p className="font-[HandoRegular]">
            <strong>{t("email")}:</strong> {user.email}
          </p>
          <p className="font-[HandoRegular]">
            <strong>{t("phone")}:</strong> {user.user_metadata?.phone || "-"}
          </p>
          <button onClick={() => setEditing(true)} className="mt-2 bg-black text-white px-4 py-2 rounded font-[HandoBold]">
            {t("edit_profile")}
          </button>
        </div>
      )}
    </section>
  );
}
