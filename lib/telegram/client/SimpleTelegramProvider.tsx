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

// Функция для проверки, находимся ли мы в реальном Telegram
function isInRealTelegram(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Проверяем несколько признаков реального Telegram:
  // 1. Наличие window.Telegram.WebApp с настоящими данными
  // 2. Наличие параметров в URL (Telegram добавляет #tgWebAppData=...)
  const hasTelegramObject = !!window.Telegram?.WebApp;
  const hasTelegramHash = window.location.hash.includes('tgWebAppData');
  const hasInitData = window.Telegram?.WebApp?.initData;
  
  return !!(hasTelegramObject && (hasTelegramHash || hasInitData));
}

export default function SimpleTelegramProvider() {
  useEffect(() => {
    console.log('🔍 Проверяем среду запуска...');
    
    // 1. Проверяем, в реальном ли Telegram мы
    if (isInRealTelegram()) {
      console.log('✅ Находимся в РЕАЛЬНОМ Telegram!');
      console.log('Реальные данные пользователя:', window.Telegram?.WebApp?.initDataUnsafe?.user);
      console.log('initData:', window.Telegram?.WebApp?.initData);
      console.log('Платформа:', window.Telegram?.WebApp?.platform);
      return; // Выходим — НЕ создаем тестовые данные!
    }

    console.log('🛠️ Находимся в браузере. Включаю мокинг Telegram...');

    // 2. Только в браузере создаем тестовые данные
    const userData = {
      id: 123456789,
      first_name: 'Иван',
      last_name: 'Иванов',
      username: 'ivan_dev',
      language_code: 'ru',
      is_premium: true,
    };

    const initData = new URLSearchParams({
      user: JSON.stringify(userData),
      hash: 'test_hash_' + Date.now(),
      auth_date: Math.floor(Date.now() / 1000).toString(),
    }).toString();

    if (typeof window !== 'undefined') {
      window.Telegram = {
        WebApp: {
          initData: initData,
          initDataUnsafe: { user: userData },
          version: '7.10',
          platform: 'tdesktop',
          
          themeParams: {
            bg_color: '#ffffff',
            text_color: '#000000',
            hint_color: '#999999',
            link_color: '#2481cc',
            button_color: '#2481cc',
            button_text_color: '#ffffff',
          },
          
          ready: () => console.log('Telegram WebApp ready (мокинг)'),
          expand: () => {},
          close: () => {},
          sendData: (data: any) => console.log('Send data:', data),
          
          startParam: 'debug',
          colorScheme: 'light',
          isExpanded: true,
          viewportHeight: 600,
          viewportStableHeight: 600,
        },
      };

      console.log('✅ Мокинг Telegram для разработки завершен!');
      console.log('Тестовый пользователь:', window.Telegram.WebApp.initDataUnsafe.user);
    }
  }, []);

  return null;
}