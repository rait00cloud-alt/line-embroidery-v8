'use client';

import SignUpPage from '@/components/Register/RegisterContainer';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <div className="flex flex-col overflow-hidden">
        <SignUpPage />
      </div>
    </main>
  );
}
