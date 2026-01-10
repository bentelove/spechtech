'use client'; // Обязательно клиентский компонент!

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Динамический импорт без SSR
const TelegramInit = dynamic(
  () => import('../lib/telegram/client/TelegramInit'),
  { ssr: false }
);

export default function HomePage() {
  const initData = localStorage.getItem('token');
  return (
    <Suspense fallback={<div>Loading Telegram...</div>}>
      <TelegramInit />
      <main>
        <h1>Your Minfffi App Content</h1>
        {initData};
      </main>
    </Suspense>
  );
}