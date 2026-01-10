// app/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';

// Динамический импорт провайдера БЕЗ SSR
const SimpleTelegramProvider = dynamic(
  () => import('../lib/telegram/client/SimpleTelegramProvider'),
  { ssr: false }
);

// Функция для определения среды запуска
function detectEnvironment(): 'real-telegram' | 'mocked' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  
  const hash = window.location.hash;
  const hasTelegramHash = hash.includes('tgWebAppData');
  const hasTelegramObject = !!window.Telegram?.WebApp;
  const initData = window.Telegram?.WebApp?.initData || '';
  
  // Если есть хеш Telegram И объект Telegram, И данные не тестовые - это реальный Telegram
  if (hasTelegramHash && hasTelegramObject && !initData.includes('test_hash_')) {
    return 'real-telegram';
  }
  
  // Если есть объект Telegram с тестовыми данными - это мокинг
  if (hasTelegramObject && initData.includes('test_hash_')) {
    return 'mocked';
  }
  
  return 'unknown';
}

// Функция для извлечения пользователя из хеша Telegram
function parseUserFromTelegramHash() {
  if (typeof window === 'undefined') return null;
  
  const hash = window.location.hash;
  if (!hash.includes('tgWebAppData=')) return null;
  
  try {
    // Парсим хеш URL
    const hashParams = new URLSearchParams(hash.substring(1));
    const tgWebAppData = hashParams.get('tgWebAppData');
    
    if (!tgWebAppData) return null;
    
    // Парсим tgWebAppData
    const initDataParams = new URLSearchParams(tgWebAppData);
    const userStr = initDataParams.get('user');
    
    if (!userStr) return null;
    
    const user = JSON.parse(decodeURIComponent(userStr));
    
    return {
      user,
      initData: tgWebAppData,
      version: hashParams.get('tgWebAppVersion'),
      platform: hashParams.get('tgWebAppPlatform'),
      themeParams: JSON.parse(hashParams.get('tgWebAppThemeParams') || '{}'),
      hash: hash,
    };
  } catch (error) {
    console.error('Ошибка при парсинге хеша Telegram:', error);
    return null;
  }
}

// Компонент для отладки
function DebugInfo() {
  const [debug, setDebug] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Пробуем получить данные из хеша
      const telegramHashData = parseUserFromTelegramHash();
      
      setDebug({
        hash: window.location.hash.substring(0, 200) + '...',
        hasTelegramHash: window.location.hash.includes('tgWebAppData'),
        telegramObject: !!window.Telegram,
        telegramWebApp: !!window.Telegram?.WebApp,
        initDataExists: !!window.Telegram?.WebApp?.initData,
        initDataLength: window.Telegram?.WebApp?.initData?.length || 0,
        initDataSample: window.Telegram?.WebApp?.initData?.substring(0, 100) || '',
        platform: window.Telegram?.WebApp?.platform,
        userFromWindow: window.Telegram?.WebApp?.initDataUnsafe?.user,
        userFromHash: telegramHashData?.user,
        detectedEnvironment: detectEnvironment(),
        timestamp: new Date().toISOString(),
      });
    }
  }, []);
  
  if (!debug) return null;
  
  return (
    <div style={{
      background: '#1a1a1a',
      color: '#00ff00',
      padding: '15px',
      borderRadius: '8px',
      marginTop: '20px',
      fontSize: '12px',
      fontFamily: 'monospace',
      overflow: 'auto',
      maxHeight: '400px'
    }}>
      <h4 style={{ marginTop: 0, color: '#fff' }}>🛠️ Отладочная информация:</h4>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(debug, null, 2)}
      </pre>
    </div>
  );
}

// Главный компонент отображения данных
function UserDataDisplay() {
  const [userData, setUserData] = useState<any>(null);
  const [status, setStatus] = useState('⏳ Проверяем среду и данные...');
  const [environment, setEnvironment] = useState<'real-telegram' | 'mocked' | 'unknown'>('unknown');
  const [showDebug, setShowDebug] = useState(false);
  const [dataSource, setDataSource] = useState<'hash' | 'window-telegram' | 'none'>('none');

  useEffect(() => {
    // Проверяем с задержкой, чтобы всё успело инициализироваться
    const timer = setTimeout(() => {
      console.group('🔍 Проверка среды Telegram');
      
      // 1. Пробуем получить данные из хеша (самый надежный источник)
      const telegramHashData = parseUserFromTelegramHash();
      
      if (telegramHashData) {
        console.log('✅ Найдены данные Telegram в хеше URL!');
        console.log('Пользователь из хеша:', telegramHashData.user);
        
        setEnvironment('real-telegram');
        setDataSource('hash');
        setUserData({ 
          ...telegramHashData.user,
          source: 'telegram-hash',
          platform: telegramHashData.platform,
          initData: telegramHashData.initData,
        });
        setStatus('✅ Вы в РЕАЛЬНОМ Telegram! (данные из хеша)');
        
        // Если window.Telegram не существует или содержит тестовые данные, обновим его
        if (!window.Telegram?.WebApp || window.Telegram.WebApp.initData?.includes('test_hash_')) {
          console.log('🔄 Обновляю window.Telegram реальными данными из хеша...');
          window.Telegram = {
            WebApp: {
              initData: telegramHashData.initData,
              initDataUnsafe: { user: telegramHashData.user },
              version: telegramHashData.version || '9.1',
              platform: telegramHashData.platform || 'macos',
              themeParams: telegramHashData.themeParams,
              ready: () => console.log('Telegram WebApp ready'),
              expand: () => {},
              close: () => {},
              sendData: () => {},
              colorScheme: telegramHashData.themeParams?.bg_color === '#282828' ? 'dark' : 'light',
              isExpanded: true,
            },
          };
        }
      }
      // 2. Если нет данных в хеше, проверяем window.Telegram
      else if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        const initData = window.Telegram.WebApp.initData;
        
        console.log('📦 Данные из window.Telegram:', user);
        console.log('initData содержит test_hash_:', initData?.includes('test_hash_'));
        
        setUserData({ 
          ...user, 
          source: 'window-telegram',
          initData,
          platform: window.Telegram.WebApp.platform,
        });
        setDataSource('window-telegram');
        
        if (initData?.includes('test_hash_')) {
          setEnvironment('mocked');
          setStatus('🛠️ Режим разработки (мокинг)');
          console.log('🛠️ МОКИНГ - тестовые данные');
        } else {
          setEnvironment('real-telegram');
          setStatus('✅ Вы в РЕАЛЬНОМ Telegram!');
          console.log('📱 РЕАЛЬНЫЙ Telegram');
        }
      }
      // 3. Если данных нет вообще
      else {
        setStatus('❌ Данные Telegram не найдены');
        console.log('❌ window.Telegram не инициализирован');
      }
      
      console.groupEnd();
    }, 1000); // 1 секунда на инициализацию

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {environment === 'real-telegram' ? '📱' : environment === 'mocked' ? '🛠️' : '❓'}
        Telegram Mini App
      </h1>
      
      {/* Блок статуса */}
      <div style={{
        background: environment === 'real-telegram' ? '#d4edda' : 
                   environment === 'mocked' ? '#fff3cd' : '#f8f9fa',
        border: `2px solid ${
          environment === 'real-telegram' ? '#28a745' : 
          environment === 'mocked' ? '#ffc107' : '#6c757d'
        }`,
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>{status}</h3>
        
        {environment === 'real-telegram' && (
          <div style={{
            padding: '12px',
            background: '#c3e6cb',
            borderRadius: '8px',
            marginBottom: '20px',
            borderLeft: '4px solid #28a745'
          }}>
            <strong>🎉 Отлично! Вы в реальном Telegram Mini App.</strong>
            <p style={{ margin: '8px 0 0 0' }}>
              {dataSource === 'hash' 
                ? 'Данные получены из хеша URL Telegram.' 
                : 'Данные получены из window.Telegram объект.'}
            </p>
          </div>
        )}
        
        {environment === 'mocked' && (
          <div style={{
            padding: '12px',
            background: '#ffeaa7',
            borderRadius: '8px',
            marginBottom: '20px',
            borderLeft: '4px solid #ffc107'
          }}>
            <strong>⚙️ Режим разработки в браузере</strong>
            <p style={{ margin: '8px 0 0 0' }}>
              Это тестовые данные "Иван Иванов". Для получения реальных данных откройте приложение в Telegram.
            </p>
          </div>
        )}
        
        {/* Отображение данных пользователя */}
        {userData ? (
          <div>
            <h4>👤 Данные пользователя:</h4>
            <div style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '10px',
              margin: '15px 0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px' }}>
                <div><strong>Имя:</strong></div><div>{userData.first_name}</div>
                <div><strong>Фамилия:</strong></div><div>{userData.last_name || '—'}</div>
                <div><strong>ID:</strong></div><div><code>{userData.id}</code></div>
                <div><strong>Ник:</strong></div><div>{userData.username ? `@${userData.username}` : '—'}</div>
                <div><strong>Язык:</strong></div><div>{userData.language_code || '—'}</div>
                <div><strong>Премиум:</strong></div>
                <div>{userData.is_premium ? '✅ Да' : '❌ Нет'}</div>
                <div><strong>Платформа:</strong></div><div>{userData.platform || '—'}</div>
                <div><strong>Источник данных:</strong></div>
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: environment === 'real-telegram' ? '#28a74520' : '#ffc10720',
                    color: environment === 'real-telegram' ? '#155724' : '#856404',
                    fontWeight: 'bold'
                  }}>
                    {environment === 'real-telegram' 
                      ? `Реальный Telegram (${dataSource})` 
                      : 'Мокинг (разработка)'}
                  </span>
                </div>
              </div>
              
              {/* Если есть фото */}
              {userData.photo_url && (
                <div style={{ marginTop: '15px' }}>
                  <strong>Фото:</strong>
                  <img 
                    src={userData.photo_url} 
                    alt="Аватар" 
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      marginTop: '10px',
                      border: '2px solid #dee2e6'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <p>Ожидаем данные пользователя...</p>
        )}
        
        {/* Кнопки действий */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() => {
              console.group('🔍 Отладка Telegram Mini App');
              console.log('window.location.hash:', window.location.hash);
              console.log('window.Telegram:', window.Telegram);
              console.log('window.Telegram?.WebApp:', window.Telegram?.WebApp);
              console.log('initData:', window.Telegram?.WebApp?.initData);
              console.log('initDataUnsafe:', window.Telegram?.WebApp?.initDataUnsafe);
              console.log('Обнаруженная среда:', environment);
              console.log('Источник данных:', dataSource);
              console.groupEnd();
              
              alert(`Режим: ${environment}\nИсточник данных: ${dataSource}\nХеш в URL: ${window.location.hash ? 'Есть' : 'Нет'}\nПроверьте консоль для деталей.`);
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔍 Проверить данные в консоли
          </button>
          
          <button
            onClick={() => setShowDebug(!showDebug)}
            style={{
              padding: '10px 20px',
              backgroundColor: showDebug ? '#495057' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {showDebug ? '👇 Скрыть отладку' : '⚙️ Показать отладку'}
          </button>
          
          {environment === 'real-telegram' && userData && (
            <button
              onClick={() => {
                console.log('Данные для отправки на сервер:', userData);
                alert(`Готово к отправке на сервер!\nПользователь: ${userData.first_name} ${userData.last_name}\nID: ${userData.id}\nТеперь можно настроить API endpoint.`);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🚀 Подготовить к отправке на сервер
            </button>
          )}
        </div>
      </div>
      
      {/* Отладочная информация */}
      {showDebug && <DebugInfo />}
      
      {/* Информация о следующих шагах */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#e7f3ff',
        borderRadius: '12px',
        borderLeft: '4px solid #2481cc'
      }}>
        <h3>📝 Что делать дальше?</h3>
        <ol style={{ lineHeight: '1.6' }}>
          <li>
            <strong>Если вы в реальном Telegram и видите свои данные:</strong> 
            <br />Отлично! Теперь можно настроить отправку этих данных на сервер для проверки и сохранения.
          </li>
          <li>
            <strong>Если вы в реальном Telegram, но видите "Ивана Иванова":</strong>
            <br />Нажмите "🔍 Проверить данные в консоли" и отправьте мне логи. Нужно исправить определение среды.
          </li>
          <li>
            <strong>Следующий шаг:</strong> 
            <br />Настроить API endpoint для проверки подписи Telegram и сохранения пользователя в базу данных.
          </li>
        </ol>
        
        <div style={{ marginTop: '15px', padding: '10px', background: '#cce5ff', borderRadius: '6px' }}>
          <p><strong>Текущий статус:</strong> {environment === 'real-telegram' ? '✅ Готово к интеграции с сервером' : '🛠️ В процессе настройки'}</p>
        </div>
      </div>
    </div>
  );
}

// Главный компонент страницы
export default function HomePage() {
  return (
    <>
      {/* Провайдер для мокинга (только в браузере, когда нет реальных данных Telegram) */}
      <SimpleTelegramProvider />
      
      {/* Основной контент с отображением данных */}
      <Suspense fallback={
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif' 
        }}>
          <h2>⏳ Загружаем Telegram Mini App...</h2>
          <p>Пожалуйста, подождите</p>
        </div>
      }>
        <UserDataDisplay />
      </Suspense>
    </>
  );
}