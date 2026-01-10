// lib/telegram/utils/environment.ts

export function detectEnvironment() {
  if (typeof window === 'undefined') return 'server';
  
  const hash = window.location.hash;
  const hasTelegramHash = hash.includes('tgWebAppData');
  const hasTelegramObject = !!window.Telegram?.WebApp;
  const initData = window.Telegram?.WebApp?.initData || '';
  const platform = window.Telegram?.WebApp?.platform || '';
  
  console.group('🔍 Детектор среды Telegram');
  console.log('window.location.hash:', hash);
  console.log('hasTelegramHash:', hasTelegramHash);
  console.log('hasTelegramObject:', hasTelegramObject);
  console.log('initData:', initData);
  console.log('initData includes "test_hash_":', initData.includes('test_hash_'));
  console.log('platform:', platform);
  console.groupEnd();
  
  if (hasTelegramHash && hasTelegramObject && !initData.includes('test_hash_')) {
    return 'real-telegram';
  }
  
  if (hasTelegramObject && initData.includes('test_hash_')) {
    return 'mocked';
  }
  
  if (hasTelegramHash && !hasTelegramObject) {
    return 'telegram-hash-only'; // Хеш есть, но объект не инициализирован
  }
  
  return 'browser';
}