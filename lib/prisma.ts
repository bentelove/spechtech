// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Глобальная переменная для предотвращения многократного создания PrismaClient
// Это особенно важно в development mode при горячей перезагрузке (HMR)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Проверяем, не создан ли уже PrismaClient в глобальной области
// Если да - используем существующий, если нет - создаём новый
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

// В development mode сохраняем PrismaClient в глобальной переменной
// чтобы предотвратить создание множества подключений при hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Экспортируем для использования
export default prisma;