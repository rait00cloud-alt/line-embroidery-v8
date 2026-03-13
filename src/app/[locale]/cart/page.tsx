'use client';

import { use } from 'react';
import CartPage from "@/components/Cart/CartPage";
import DSTPopup from '@/ui/DSTPopup';

type Props = {
  params: Promise<{ locale: string }>;
};

export default function HomePage({ params }: Props) {
  const { locale } = use(params);

  return (
    <main >
      
      <DSTPopup />

      <div className="flex flex-col overflow-hidden">
        <CartPage />
      </div>
    </main>
  );
}
