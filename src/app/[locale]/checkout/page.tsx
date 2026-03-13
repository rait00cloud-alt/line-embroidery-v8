'use client'; 

import { use } from 'react';

import Checkout from '@/components/Checkout/CheckoutPage';
import ImaConsentPopup from '@/ui/ImageConsent';

type Props = {
  params: Promise<{ locale: string }>;
};

export default function CheckoutPage({ params }: Props) {
  const { locale } = use(params);
  
  return (
    <main style={{ padding: 24 }}>
      <div className="flex flex-col overflow-hidden">
        <ImaConsentPopup />
        <Checkout/>
      </div>
    </main>
  );
}