'use client'; 

import { use } from 'react';
import LoginPage from '@/components/Login/LoginContainer';

type Props = {
  params: Promise<{ locale: string }>;
};

export default function HomePage({ params }: Props) {
  const { locale } = use(params);
  
  return (
    <main style={{ padding: 24 }}>
      <div className="flex flex-col overflow-hidden">
        <LoginPage/>
      </div>
    </main>
  );
}
