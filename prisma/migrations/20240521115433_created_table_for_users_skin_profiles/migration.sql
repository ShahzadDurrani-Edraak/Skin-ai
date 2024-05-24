-- CreateTable
CREATE TABLE "UserSkinProfiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" BIGINT NOT NULL,
    "skinType" INTEGER NOT NULL,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "_ProductsToUserSkinProfiles" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ProductsToUserSkinProfiles_A_fkey" FOREIGN KEY ("A") REFERENCES "Products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProductsToUserSkinProfiles_B_fkey" FOREIGN KEY ("B") REFERENCES "UserSkinProfiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ConcernsToUserSkinProfiles" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ConcernsToUserSkinProfiles_A_fkey" FOREIGN KEY ("A") REFERENCES "Concerns" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ConcernsToUserSkinProfiles_B_fkey" FOREIGN KEY ("B") REFERENCES "UserSkinProfiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductsToUserSkinProfiles_AB_unique" ON "_ProductsToUserSkinProfiles"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductsToUserSkinProfiles_B_index" ON "_ProductsToUserSkinProfiles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ConcernsToUserSkinProfiles_AB_unique" ON "_ConcernsToUserSkinProfiles"("A", "B");

-- CreateIndex
CREATE INDEX "_ConcernsToUserSkinProfiles_B_index" ON "_ConcernsToUserSkinProfiles"("B");
