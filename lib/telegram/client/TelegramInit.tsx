'use client';

import { useEffect, useState } from 'react';
import { useRawInitData, useLaunchParams } from '@telegram-apps/sdk-react';

interface User{
  id: number,
  firstName: string,
  lastName: string,
  photoUrl: string
}
export default function TelegramInit() {
  const rawInitData = useRawInitData();
  const { user } = useLaunchParams(); // Получаем данные пользователя

  useEffect(() => {
    // Сохраняем initData для API-запросов
    if (rawInitData) {
      localStorage.setItem('telegram_init_data', rawInitData);
      console.log('InitData saved to localStorage');
      
      // Отправляем на бэкенд для проверки
      sendInitDataToBackend(rawInitData);
    }
  }, [rawInitData]);

  const [userData,setUserData] = useState<User | null>(null)
  // Можно сразу использовать данные пользователя в интерфейсе
  useEffect(() => {
    if (user) {
      console.log(user);
    }
  }, [user]);

  const sendInitDataToBackend = async (initData: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Auth successful:', data);
        // Сохраняем JWT или другие токены если нужно
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
      }
    } catch (error) {
      console.error('Auth failed:', error);
    }
  };

  return null; // Этот компонент не рендерит UI
}