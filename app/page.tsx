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
  const [dataSource, setDataSource] = useState<'unknown' | 'real-telegram' | 'mocked'>('unknown');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        const initData = window.Telegram.WebApp.initData;
        
        // Определяем источник данных
        const isRealTelegram = window.location.hash.includes('tgWebAppData') || 
                              initData?.includes('hash=') && !initData.includes('test_hash_');
        
        setUserData({ ...user, initData });
        
        if (isRealTelegram) {
          setDataSource('real-telegram');
          setStatus('✅ Данные из РЕАЛЬНОГО Telegram!');
          console.log('📱 Реальные данные Telegram:', user);
        } else {
          setDataSource('mocked');
          setStatus('✅ Данные из МОКИНГА (разработка)');
          console.log('🛠️ Тестовые данные (мокинг):', user);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Telegram Mini App</h1>
      
      <div style={{
        background: dataSource === 'real-telegram' ? '#d4edda' : 
                   dataSource === 'mocked' ? '#fff3cd' : '#f8f9fa',
        border: `2px solid ${
          dataSource === 'real-telegram' ? '#28a745' : 
          dataSource === 'mocked' ? '#ffc107' : '#6c757d'
        }`,
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '15px'
        }}>
          {dataSource === 'real-telegram' && <span style={{ fontSize: '24px' }}>📱</span>}
          {dataSource === 'mocked' && <span style={{ fontSize: '24px' }}>🛠️</span>}
          <h3 style={{ margin: 0 }}>{status}</h3>
        </div>
        
        {dataSource === 'real-telegram' && (
          <div style={{
            padding: '10px',
            background: '#c3e6cb',
            borderRadius: '6px',
            marginBottom: '15px'
          }}>
            <strong>Отлично! Вы в реальном Telegram.</strong>
            <p>Следующий шаг: подключить бота и проверить авторизацию на сервере.</p>
          </div>
        )}
        
        {dataSource === 'mocked' && (
          <div style={{
            padding: '10px',
            background: '#ffeaa7',
            borderRadius: '6px',
            marginBottom: '15px'
          }}>
            <strong>Режим разработки.</strong>
            <p>Это тестовые данные. Для реальных данных откройте приложение в Telegram.</p>
          </div>
        )}
        
        {userData ? (
          <div>
            <h4>Данные пользователя:</h4>
            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              margin: '15px 0'
            }}>
              <p><strong>Имя:</strong> {userData.first_name}</p>
              <p><strong>Фамилия:</strong> {userData.last_name}</p>
              <p><strong>ID:</strong> {userData.id}</p>
              <p><strong>Ник:</strong> @{userData.username}</p>
              <p><strong>Язык:</strong> {userData.language_code}</p>
              <p><strong>Премиум:</strong> {userData.is_premium ? '✅ Да' : '❌ Нет'}</p>
              
              <div style={{ marginTop: '15px', fontSize: '0.9em', color: '#666' }}>
                <p><strong>Источник:</strong> {dataSource === 'real-telegram' ? 'Реальный Telegram' : 'Мокинг (разработка)'}</p>
                <p><strong>Платформа:</strong> {window.Telegram?.WebApp?.platform || 'неизвестно'}</p>
              </div>
            </div>
          </div>
        ) : (
          <p>Ожидаем данные пользователя...</p>
        )}
      </div>
      
      {/* Добавьте эту кнопку для отладки */}
      <button
        onClick={() => {
          console.log('window.location.hash:', window.location.hash);
          console.log('window.Telegram:', window.Telegram);
          console.log('initData:', window.Telegram?.WebApp?.initData);
          alert(`Hash в URL: ${window.location.hash}\nПроверьте консоль для деталей.`);
        }}
        style={{
          marginTop: '15px',
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        🔍 Проверить URL и данные
      </button>
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