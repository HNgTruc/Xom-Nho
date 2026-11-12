-- AlterTable
ALTER TABLE `media` ADD COLUMN `purpose` ENUM('POST', 'AVATAR') NOT NULL DEFAULT 'POST';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `avatarId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_avatarId_key` ON `user`(`avatarId`);

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_avatarId_fkey` FOREIGN KEY (`avatarId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

