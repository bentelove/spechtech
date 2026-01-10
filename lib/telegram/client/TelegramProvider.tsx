// lib/telegram/client/TelegramProvider.tsx
'use client';

import { useEffect } from 'react';
import { mockTelegramEnv, isTMA } from '@telegram-apps/sdk-react';

export default function TelegramProvider() {
  useEffect(() => {
    if (isTMA()) {
      console.log('✅ Режим реального Telegram.');
      return;
    }

    console.log('🛠️ Режим браузера. Включаю мокинг Telegram...');

    // 1. Данные пользователя
    const userData = {
      id: 123456789,
      first_name: 'Иван',
      last_name: 'Иванов',
      username: 'ivan_dev',
      language_code: 'ru',
      is_premium: true,
    };

    // 2. Формируем НЕЗАКОДИРОВАННУЮ строку tgWebAppData
    //    Важно: НЕ используем encodeURIComponent для всей строки
    const tgWebAppDataUnencoded = [
      `user=${JSON.stringify(userData)}`,  // JSON без кодирования
      'hash=test_hash_for_development_only',
      `auth_date=${Math.floor(Date.now() / 1000)}`,
      'start_param=debug'
    ].join('&');

    console.log('tgWebAppDataUnencoded:', tgWebAppDataUnencoded);

    // 3. Формируем launchParams с правильными типами
    mockTelegramEnv({
      launchParams: {
        // Передаем как есть - SDK сам закодирует
        tgWebAppData: tgWebAppDataUnencoded,
        tgWebAppPlatform: 'tdesktop' as const,
        tgWebAppVersion: '7.10',
        // Объект, а не строка!
        tgWebAppThemeParams: {
          bg_color: '#ffffff',
          text_color: '#000000',
          hint_color: '#999999',
          link_color: '#2481cc',
          button_color: '#2481cc',
          button_text_color: '#ffffff',
        },
      },
    });

    console.log('✅ Окружение Telegram замокано!');
  }, []);

  return null;
}