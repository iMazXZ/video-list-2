-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "poster" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "assetUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "resolution" TEXT NOT NULL,
    "play" INTEGER NOT NULL,
    "download" INTEGER NOT NULL DEFAULT 0,
    "codec" TEXT
);
INSERT INTO "new_Video" ("assetUrl", "createdAt", "duration", "id", "name", "play", "poster", "preview", "resolution", "videoId") SELECT "assetUrl", "createdAt", "duration", "id", "name", "play", "poster", "preview", "resolution", "videoId" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
CREATE UNIQUE INDEX "Video_videoId_key" ON "Video"("videoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
