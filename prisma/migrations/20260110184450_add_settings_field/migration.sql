/*
  Warnings:

  - You are about to alter the column `telegramId` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `firstName` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `lastName` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `username` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- DropIndex
DROP INDEX `users_lastLogin_idx` ON `users`;

-- DropIndex
DROP INDEX `users_telegramId_idx` ON `users`;

-- DropIndex
DROP INDEX `users_username_idx` ON `users`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `settings` JSON NULL,
    MODIFY `telegramId` VARCHAR(191) NOT NULL,
    MODIFY `firstName` VARCHAR(191) NOT NULL,
    MODIFY `lastName` VARCHAR(191) NULL,
    MODIFY `username` VARCHAR(191) NULL,
    MODIFY `languageCode` VARCHAR(191) NOT NULL DEFAULT 'ru',
    MODIFY `photoUrl` VARCHAR(191) NULL,
    MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'user';
