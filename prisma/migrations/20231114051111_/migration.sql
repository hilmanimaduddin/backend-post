-- DropForeignKey
ALTER TABLE `likes` DROP FOREIGN KEY `likes_postId_fkey`;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `likes_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
