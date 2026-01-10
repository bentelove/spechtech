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

// Ключевая функция: проверяем, есть ли уже реальные данные Telegram
function hasRealTelegramData(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hash = window.location.hash;
  const hasTelegramHash = hash.includes('tgWebAppData');
  
  // Если в хеше есть tgWebAppData - Telegram уже предоставил данные
  if (!hasTelegramHash) return false;
  
  // Проверяем, не подменили ли мы уже данные тестовыми
  const initData = window.Telegram?.WebApp?.initData || '';
  const hasTestData = initData.includes('test_hash_');
  
  return hasTelegramHash && !hasTestData;
}

export default function SimpleTelegramProvider() {
  useEffect(() => {
    console.log('🔍 SimpleTelegramProvider: проверяем среду...');
    
    // 1. Если уже есть реальные данные Telegram - НИЧЕГО НЕ ДЕЛАЕМ!
    if (hasRealTelegramData()) {
      console.log('✅ Обнаружены реальные данные Telegram. Мокинг НЕ выполняется.');
      console.log('Hash URL содержит tgWebAppData');
      return;
    }
    
    // 2. Проверяем хеш на случай, если это реальный Telegram без объекта window.Telegram
    const hash = window.location.hash;
    if (hash.includes('tgWebAppData')) {
      console.log('⚠️ Telegram предоставил данные в хеше, но window.Telegram не инициализирован');
      console.log('Попробуем извлечь данные из хеша...');
      
      try {
        // Извлекаем tgWebAppData из хеша
        const hashParams = new URLSearchParams(hash.substring(1));
        const tgWebAppData = hashParams.get('tgWebAppData');
        
        if (tgWebAppData) {
          // Парсим данные пользователя
          const initDataParams = new URLSearchParams(tgWebAppData);
          const userStr = initDataParams.get('user');
          
          if (userStr) {
            const user = JSON.parse(decodeURIComponent(userStr));
            console.log('👤 Пользователь из хеша Telegram:', user);
            
            // Создаём объект Telegram с реальными данными
            window.Telegram = {
              WebApp: {
                initData: tgWebAppData,
                initDataUnsafe: { user },
                version: hashParams.get('tgWebAppVersion') || '9.1',
                platform: hashParams.get('tgWebAppPlatform') || 'macos',
                themeParams: JSON.parse(hashParams.get('tgWebAppThemeParams') || '{}'),
                ready: () => console.log('Telegram WebApp ready'),
                expand: () => {},
                close: () => {},
                sendData: () => {},
                startParam: initDataParams.get('start_param') || '',
                colorScheme: 'dark',
                isExpanded: true,
              },
            };
            
            console.log('✅ Объект Telegram создан из реальных данных хеша');
            return;
          }
        }
      } catch (error) {
        console.error('❌ Ошибка при парсинге данных из хеша:', error);
      }
    }
    
    // 3. Только если нет реальных данных - мокаем для разработки
    console.log('🛠️ Режим браузера. Включаю мокинг Telegram для разработки...');
    
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