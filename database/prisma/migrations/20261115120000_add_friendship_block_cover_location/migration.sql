-- AlterTable
ALTER TABLE `media` MODIFY `purpose` ENUM('POST', 'AVATAR', 'COVER') NOT NULL DEFAULT 'POST';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `coverId` VARCHAR(191) NULL,
    ADD COLUMN `location` VARCHAR(100) NULL;

-- CreateTable
CREATE TABLE `friendship` (
    `userLowId` VARCHAR(36) NOT NULL,
    `userHighId` VARCHAR(36) NOT NULL,
    `requesterId` VARCHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acceptedAt` DATETIME(3) NULL,

    INDEX `friendship_userLowId_status_acceptedAt_idx`(`userLowId`, `status`, `acceptedAt`),
    INDEX `friendship_userHighId_status_acceptedAt_idx`(`userHighId`, `status`, `acceptedAt`),
    INDEX `friendship_requesterId_status_createdAt_idx`(`requesterId`, `status`, `createdAt`),
    PRIMARY KEY (`userLowId`, `userHighId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_block` (
    `blockerId` VARCHAR(36) NOT NULL,
    `blockedId` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_block_blockedId_idx`(`blockedId`),
    PRIMARY KEY (`blockerId`, `blockedId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `user_coverId_key` ON `user`(`coverId`);

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_coverId_fkey` FOREIGN KEY (`coverId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `friendship` ADD CONSTRAINT `friendship_userLowId_fkey` FOREIGN KEY (`userLowId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `friendship` ADD CONSTRAINT `friendship_userHighId_fkey` FOREIGN KEY (`userHighId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `friendship` ADD CONSTRAINT `friendship_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_block` ADD CONSTRAINT `user_block_blockerId_fkey` FOREIGN KEY (`blockerId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_block` ADD CONSTRAINT `user_block_blockedId_fkey` FOREIGN KEY (`blockedId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
