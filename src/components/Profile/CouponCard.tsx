"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface Props {
  coupons: any[];
}

export default function CouponCard({ coupons }: Props) {
  const t = useTranslations("AccountPage.CouponCard");

  return (
    <section>
      <h2 className="text-2xl font-[HandoBold] mb-4">{t("my_coupons")}</h2>
      {coupons.length === 0 ? (
        <p className="font-[HandoRegular]">{t("no_coupons")}</p>
      ) : (
        <ul className="space-y-2">
          {coupons.map((c) => (
            <li key={c.id} className="border p-2 rounded flex justify-between items-center font-[HandoRegular]">
              <span>{c.code} - {c.discount}% {t("off")}</span>
              <span>{c.used ? t("used") : t("active")}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
