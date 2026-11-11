-- AlterTable
ALTER TABLE `post` ADD COLUMN `contentFormat` ENUM('MARKDOWN', 'PLAIN') NOT NULL DEFAULT 'MARKDOWN';

-- CreateTable
CREATE TABLE `media` (
    `id` VARCHAR(191) NOT NULL,
    `kind` ENUM('IMAGE', 'VIDEO') NOT NULL,
    `mimeType` VARCHAR(50) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `storageKey` VARCHAR(100) NOT NULL,
    `ownerId` VARCHAR(36) NOT NULL,
    `postId` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `media_storageKey_key`(`storageKey`),
    INDEX `media_postId_position_idx`(`postId`, `position`),
    INDEX `media_ownerId_postId_createdAt_idx`(`ownerId`, `postId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
