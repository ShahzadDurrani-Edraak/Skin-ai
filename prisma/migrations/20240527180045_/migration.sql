-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT
);

-- CreateTable
CREATE TABLE "Products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Ingredients" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Concerns" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "UserSkinProfiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "skinType" INTEGER NOT NULL,
    "skinTone" INTEGER,
    "skinEthnicity" INTEGER,
    "image" BLOB NOT NULL
);

-- CreateTable
CREATE TABLE "_IngredientsToProducts" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_IngredientsToProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Ingredients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_IngredientsToProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ConcernsToIngredients" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ConcernsToIngredients_A_fkey" FOREIGN KEY ("A") REFERENCES "Concerns" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ConcernsToIngredients_B_fkey" FOREIGN KEY ("B") REFERENCES "Ingredients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ConcernsToUserSkinProfiles" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ConcernsToUserSkinProfiles_A_fkey" FOREIGN KEY ("A") REFERENCES "Concerns" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ConcernsToUserSkinProfiles_B_fkey" FOREIGN KEY ("B") REFERENCES "UserSkinProfiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Products_productId_key" ON "Products"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "_IngredientsToProducts_AB_unique" ON "_IngredientsToProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_IngredientsToProducts_B_index" ON "_IngredientsToProducts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ConcernsToIngredients_AB_unique" ON "_ConcernsToIngredients"("A", "B");

-- CreateIndex
CREATE INDEX "_ConcernsToIngredients_B_index" ON "_ConcernsToIngredients"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ConcernsToUserSkinProfiles_AB_unique" ON "_ConcernsToUserSkinProfiles"("A", "B");

-- CreateIndex
CREATE INDEX "_ConcernsToUserSkinProfiles_B_index" ON "_ConcernsToUserSkinProfiles"("B");
