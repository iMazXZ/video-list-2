-- CreateTable
CREATE TABLE "Subtitle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "language" TEXT,
    "videoId" TEXT NOT NULL,
    CONSTRAINT "Subtitle_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
