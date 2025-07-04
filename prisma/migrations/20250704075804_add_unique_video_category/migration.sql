/*
  Warnings:

  - A unique constraint covering the columns `[videoId,categoryId]` on the table `VideoCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VideoCategory_videoId_categoryId_key" ON "VideoCategory"("videoId", "categoryId");
