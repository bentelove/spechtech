// app/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';

const SimpleTelegramProvider = dynamic(
  () => import('../lib/telegram/client/SimpleTelegramProvider'),
  { ssr: false }
);

function UserDataDisplay() {
  const [userData, setUserData] = useState<any>(null);
  const [status, setStatus] = useState('⏳ Проверяем данные...');

  useEffect(() => {
    // Проверяем данные через 500мс после загрузки
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        setUserData(user);
        setStatus('✅ Данные получены напрямую через window.Telegram!');
        console.log('Найден пользователь:', user);
      } else {
        setStatus('❌ Данные не найдены. Проверьте консоль.');
        console.log('window.Telegram:', window.Telegram);
        console.log('window.Telegram?.WebApp:', window.Telegram?.WebApp);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>🛠️ Простой мокинг Telegram</h1>
      
      <div style={{
        background: userData ? '#d4edda' : '#fff3cd',
        border: `1px solid ${userData ? '#c3e6cb' : '#ffc107'}`,
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <h3>Статус: {status}</h3>
        
        {userData ? (
          <div style={{ marginTop: '15px' }}>
            <h4>Данные пользователя:</h4>
            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              marginTop: '10px'
            }}>
              <p><strong>Имя:</strong> {userData.first_name}</p>
              <p><strong>Фамилия:</strong> {userData.last_name}</p>
              <p><strong>ID:</strong> {userData.id}</p>
              <p><strong>Ник:</strong> @{userData.username}</p>
              <p><strong>Язык:</strong> {userData.language_code}</p>
              <p><strong>Премиум:</strong> {userData.is_premium ? '✅ Да' : '❌ Нет'}</p>
            </div>
          </div>
        ) : (
          <p>Ожидаем данные пользователя...</p>
        )}
        
        <div style={{ marginTop: '20px', padding: '10px', background: '#e7f3ff', borderRadius: '8px' }}>
          <p><strong>Следующий шаг:</strong> Отправить эти данные на ваш backend API</p>
          {userData && (
            <button
              onClick={() => {
                alert(`Готово! Данные пользователя ${userData.first_name} можно отправлять на сервер.`);
                console.log('Данные для отправки на сервер:', userData);
              }}
              style={{
                marginTop: '10px',
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🚀 Перейти к отправке на сервер
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <SimpleTelegramProvider />
      <Suspense fallback={<div>Загрузка провайдера...</div>}>
        <UserDataDisplay />
      </Suspense>
    </>
  );
}