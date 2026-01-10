// lib/telegram/types.ts
// Типы, соответствующие реальному формату данных от Telegram

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  // Другие возможные поля...
}

export interface LaunchParams {
  user?: TelegramUser;
  // Другие параметры запуска...
}