// app/api/auth/telegram/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@telegram-apps/init-data-node';

export async function POST(request: NextRequest) {
  try {
    // 1. Получаем данные из запроса
    const body = await request.json();
    const { initData, user } = body;

    // 2. Проверяем наличие обязательных данных
    if (!initData || !user) {
      return NextResponse.json(
        { error: 'Отсутствуют initData или данные пользователя' },
        { status: 400 }
      );
    }

    // 3. ВАЖНО: Проверяем подлинность данных Telegram
    //    Используем токен бота из переменных окружения
    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) {
      console.error('BOT_TOKEN не установлен в переменных окружения');
      return NextResponse.json(
        { error: 'Ошибка конфигурации сервера' },
        { status: 500 }
      );
    }

    console.log('🔐 Проверяем подпись initData Telegram...');
    console.log('initData (первые 100 символов):', initData.substring(0, 100));
    console.log('ID пользователя:', user.id);

    // 4. Проверяем подпись initData
    //    validate выбросит ошибку, если подпись неверна
    try {
      await validate(initData, BOT_TOKEN);
      console.log('✅ Проверка Telegram initData прошла успешно');
    } catch (validationError) {
      console.error('❌ Ошибка проверки подписи Telegram:', validationError);
      return NextResponse.json(
        { error: 'Неверная подпись данных Telegram' },
        { status: 403 }
      );
    }

    // 5. ЗДЕСЬ БУДЕТ ЛОГИКА СОХРАНЕНИЯ В БАЗУ ДАННЫХ
    console.log('Данные пользователя для сохранения в БД:', user);

    // Пример с псевдокодом для Prisma (PostgreSQL):
    /*
    const existingUser = await prisma.user.findUnique({
      where: { telegramId: String(user.id) }
    });
    
    if (existingUser) {
      // Обновляем существующего пользователя
      await prisma.user.update({
        where: { telegramId: String(user.id) },
        data: {
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          lastLogin: new Date(),
        }
      });
    } else {
      // Создаем нового пользователя
      await prisma.user.create({
        data: {
          telegramId: String(user.id),
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          languageCode: user.language_code,
          isPremium: user.is_premium,
          registeredAt: new Date(),
        }
      });
    }
    */

    // 6. Возвращаем успешный ответ
    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно аутентифицирован',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        languageCode: user.language_code,
        isPremium: user.is_premium,
      },
      // В будущем можно вернуть JWT токен для сессий:
      // token: generateJWT(user.id)
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Ошибка при проверке initData Telegram:', error);

    // Проверяем тип ошибки для более понятного ответа
    if (error instanceof Error) {
      if (error.message.includes('init data expired')) {
        return NextResponse.json(
          { error: 'Срок действия данных истек. Перезапустите приложение.' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}