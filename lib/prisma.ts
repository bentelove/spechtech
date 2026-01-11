// lib/prisma.ts - УНИВЕРСАЛЬНАЯ ВЕРСИЯ
import { PrismaClient } from '@prisma/client';

// Проверяем, что PrismaClient доступен
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // В production создаём новый экземпляр
  prisma = new PrismaClient();
} else {
  // В development используем глобальную переменную
  const globalWithPrisma = global as typeof globalThis & {
    prisma?: PrismaClient;
  };
  
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient();
  }
  
  prisma = globalWithPrisma.prisma;
}

export default prisma;