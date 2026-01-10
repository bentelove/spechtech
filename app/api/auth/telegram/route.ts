import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@telegram-apps/init-data-node';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData, user } = body;

    if (!initData || !user) {
      return NextResponse.json(
        { error: 'Отсутствуют initData или данные пользователя' },
        { status: 400 }
      );
    }

    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) {
      console.error('BOT_TOKEN не установлен');
      return NextResponse.json(
        { error: 'Ошибка конфигурации сервера' },
        { status: 500 }
      );
    }

    console.log('🔐 Проверяем подпись Telegram...');
    console.log('ID пользователя:', user.id);

    try {
      await validate(initData, BOT_TOKEN);
      console.log('✅ Проверка Telegram прошла успешно');
    } catch (validationError) {
      console.error('❌ Ошибка проверки подписи:', validationError);
      return NextResponse.json(
        { error: 'Неверная подпись данных Telegram' },
        { status: 403 }
      );
    }

    console.log('💾 Сохраняем пользователя в MySQL...');
    
    let dbUser;
    const telegramId = String(user.id);
    
    try {
      // Проверяем, есть ли пользователь уже в БД
      const existingUser = await prisma.user.findUnique({
        where: { telegramId },
      });
      
      if (existingUser) {
        // ОБНОВЛЕНИЕ существующего пользователя
        dbUser = await prisma.user.update({
          where: { telegramId },
          data: {
            firstName: user.first_name,
            lastName: user.last_name || null,
            username: user.username || null,
            languageCode: user.language_code || 'ru',
            isPremium: user.is_premium || false,
            photoUrl: user.photo_url || null,
            lastLogin: new Date(),
            loginCount: existingUser.loginCount + 1, // Просто число
          },
        });
        console.log('📝 Обновлён существующий пользователь:', dbUser.id);
      } else {
        // СОЗДАНИЕ нового пользователя
        dbUser = await prisma.user.create({
          data: {
            telegramId,
            firstName: user.first_name,
            lastName: user.last_name || null,
            username: user.username || null,
            languageCode: user.language_code || 'ru',
            isPremium: user.is_premium || false,
            photoUrl: user.photo_url || null,
            registeredAt: new Date(),
            lastLogin: new Date(),
            loginCount: 1, // Просто число
            balance: 0,
            role: 'user',
          },
        });
        console.log('🆕 Создан новый пользователь:', dbUser.id);
      }
      
    } catch (dbError) {
      console.error('❌ Ошибка базы данных:', dbError);
      return NextResponse.json(
        { 
          error: 'Ошибка базы данных',
          details: dbError instanceof Error ? dbError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    console.log('🔐 Создаю JWT токен...');
    const jwtToken = generateToken({
      userId: dbUser.id,
      telegramId: dbUser.telegramId,
      firstName: dbUser.firstName,
      role: dbUser.role,
    });
    console.log('✅ JWT токен создан для пользователя ID:', dbUser.id);

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно аутентифицирован',
      token: jwtToken,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        languageCode: user.language_code,
        isPremium: user.is_premium,
        dbId: dbUser.id,
        telegramId: dbUser.telegramId,
        role: dbUser.role,
        balance: dbUser.balance,
        photoUrl: user.photo_url,
        registeredAt: dbUser.registeredAt,
        lastLogin: dbUser.lastLogin,
        loginCount: dbUser.loginCount,
        hasDatabase: true,
        databaseType: 'MySQL',
      },
      tokenInfo: {
        expiresIn: '7 дней',
        type: 'Bearer',
      },
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('init data expired')) {
        return NextResponse.json(
          { error: 'Срок действия данных истек' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('signature invalid')) {
        return NextResponse.json(
          { error: 'Неверная подпись Telegram' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Внутренняя ошибка сервера',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'Telegram Auth API',
    status: 'operational',
    description: 'Принимает initData от Telegram Mini App',
    methods: ['POST'],
    requiredFields: ['initData', 'user'],
    database: 'MySQL',
    timestamp: new Date().toISOString(),
  });
}