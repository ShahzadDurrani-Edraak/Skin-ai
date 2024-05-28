/*
  Warnings:

  - You are about to alter the column `productId` on the `Products` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `userId` on the `UserSkinProfiles` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" BIGINT NOT NULL
);
INSERT INTO "new_Products" ("id", "productId") SELECT "id", "productId" FROM "Products";
DROP TABLE "Products";
ALTER TABLE "new_Products" RENAME TO "Products";
CREATE UNIQUE INDEX "Products_productId_key" ON "Products"("productId");
CREATE TABLE "new_UserSkinProfiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" BIGINT NOT NULL,
    "skinType" INTEGER NOT NULL,
    "skinTone" INTEGER,
    "skinEthnicity" INTEGER,
    "image" BLOB NOT NULL
);
INSERT INTO "new_UserSkinProfiles" ("id", "image", "skinEthnicity", "skinTone", "skinType", "userId") SELECT "id", "image", "skinEthnicity", "skinTone", "skinType", "userId" FROM "UserSkinProfiles";
DROP TABLE "UserSkinProfiles";
ALTER TABLE "new_UserSkinProfiles" RENAME TO "UserSkinProfiles";
PRAGMA foreign_key_check("Products");
PRAGMA foreign_key_check("UserSkinProfiles");
PRAGMA foreign_keys=ON;
