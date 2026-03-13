'use client';

import ResetPasswordPage from '@/components/Reset/ResetContainer';

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <div className="flex flex-col overflow-hidden">
        <ResetPasswordPage />
      </div>
    </main>
  );
}
