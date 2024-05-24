/*
  Warnings:

  - You are about to drop the `_ProductsToUserSkinProfiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to alter the column `image` on the `UserSkinProfiles` table. The data in that column could be lost. The data in that column will be cast from `String` to `Binary`.
  - Made the column `image` on table `UserSkinProfiles` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "_ProductsToUserSkinProfiles_B_index";

-- DropIndex
DROP INDEX "_ProductsToUserSkinProfiles_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ProductsToUserSkinProfiles";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserSkinProfiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL DEFAULT 'User',
    "skinType" INTEGER NOT NULL,
    "image" BLOB NOT NULL
);
INSERT INTO "new_UserSkinProfiles" ("id", "image", "skinType", "userId") SELECT "id", "image", "skinType", "userId" FROM "UserSkinProfiles";
DROP TABLE "UserSkinProfiles";
ALTER TABLE "new_UserSkinProfiles" RENAME TO "UserSkinProfiles";
PRAGMA foreign_key_check("UserSkinProfiles");
PRAGMA foreign_keys=ON;
