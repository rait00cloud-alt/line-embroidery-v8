"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface Props {
  designs: any[];
}

export default function DesignCard({ designs }: Props) {
  const t = useTranslations("AccountPage.DesignCard");

  return (
    <section>
      <h2 className="text-2xl font-[HandoBold] mb-4">{t("my_designs")}</h2>
      {designs.length === 0 ? (
        <p className="font-[HandoRegular]">{t("no_designs")}</p>
      ) : (
        <ul className="space-y-2">
          {designs.map((d) => (
            <li key={d.id} className="border p-2 rounded font-[HandoRegular]">
              {d.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
