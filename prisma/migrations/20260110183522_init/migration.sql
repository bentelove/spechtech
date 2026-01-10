-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `telegramId` VARCHAR(255) NOT NULL,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NULL,
    `username` VARCHAR(255) NULL,
    `languageCode` VARCHAR(10) NOT NULL DEFAULT 'ru',
    `isPremium` BOOLEAN NOT NULL DEFAULT false,
    `photoUrl` TEXT NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `role` VARCHAR(50) NOT NULL DEFAULT 'user',
    `registeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastLogin` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `loginCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_telegramId_key`(`telegramId`),
    INDEX `users_telegramId_idx`(`telegramId`),
    INDEX `users_username_idx`(`username`),
    INDEX `users_lastLogin_idx`(`lastLogin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
