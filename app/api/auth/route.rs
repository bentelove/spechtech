import { NextRequest, NextResponse } from "next/server"
import { isValid, parse } from "@telegram-apps/init-data-node";

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();
    
    if (!initData) {
      return NextResponse.json(
        { error: "No initData provided" },
        { status: 401 }
      );
    }

    // Получаем токен бота из переменных окружения
    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) {
      console.error("BOT_TOKEN is not set in environment variables");
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Проверяем подпись initData
    const isAuthorized = isValid(initData, BOT_TOKEN);
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Invalid Telegram authorization' },
        { status: 403 }
      );
    }

    // Если проверка прошла, парсим данные пользователя
    const parsedData = parse(initData);
    
    // Здесь можно:
    // 1. Создать/обновить пользователя в БД
    // 2. Сгенерировать JWT токен
    // 3. Вернуть данные клиенту

    return NextResponse.json({
      success: true,
      user: parsedData.user,
      // Можно вернуть свой JWT токен:
      // token: generateJWT(parsedData.user),
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}