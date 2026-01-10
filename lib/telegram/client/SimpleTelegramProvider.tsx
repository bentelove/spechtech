// lib/telegram/client/SimpleTelegramProvider.tsx
'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

export default function SimpleTelegramProvider() {
  useEffect(() => {
    console.log('🛠️ Простой мокинг Telegram через window.Telegram...');

    // 1. Создаем тестовые данные пользователя
    const userData = {
      id: 123456789,
      first_name: 'Иван',
      last_name: 'Иванов',
      username: 'ivan_dev',
      language_code: 'ru',
      is_premium: true,
    };

    // 2. Формируем initData строку (как Telegram)
    const initData = new URLSearchParams({
      user: JSON.stringify(userData),
      hash: 'test_hash_' + Date.now(),
      auth_date: Math.floor(Date.now() / 1000).toString(),
    }).toString();

    // 3. Прямо создаем объект window.Telegram.WebApp
    if (typeof window !== 'undefined') {
      window.Telegram = {
        WebApp: {
          // Основные поля
          initData: initData,
          initDataUnsafe: { user: userData },
          version: '7.10',
          platform: 'tdesktop',
          
          // Тема
          themeParams: {
            bg_color: '#ffffff',
            text_color: '#000000',
            hint_color: '#999999',
            link_color: '#2481cc',
            button_color: '#2481cc',
            button_text_color: '#ffffff',
          },
          
          // Методы для совместимости
          ready: () => console.log('Telegram WebApp ready'),
          expand: () => {},
          close: () => {},
          sendData: (data: any) => console.log('Send data:', data),
          
          // Параметры запуска
          startParam: 'debug',
          colorScheme: 'light',
          isExpanded: true,
          viewportHeight: 600,
          viewportStableHeight: 600,
        },
      };

      console.log('✅ Прямой мокинг через window.Telegram завершен!');
      console.log('Данные доступны через window.Telegram.WebApp.initDataUnsafe.user');
      console.log('Пользователь:', window.Telegram.WebApp.initDataUnsafe.user);
    }
  }, []);

  return null;
}