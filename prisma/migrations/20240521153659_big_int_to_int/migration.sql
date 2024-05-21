/*
  Warnings:

  - You are about to alter the column `userId` on the `UserSkinProfiles` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserSkinProfiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "skinType" INTEGER NOT NULL,
    "image" TEXT
);
INSERT INTO "new_UserSkinProfiles" ("id", "image", "skinType", "userId") SELECT "id", "image", "skinType", "userId" FROM "UserSkinProfiles";
DROP TABLE "UserSkinProfiles";
ALTER TABLE "new_UserSkinProfiles" RENAME TO "UserSkinProfiles";
PRAGMA foreign_key_check("UserSkinProfiles");
PRAGMA foreign_keys=ON;
