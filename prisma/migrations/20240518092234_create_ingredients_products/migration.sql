-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "Ingredients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "Concerns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "_IngredientsToProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "_IngredientsToProducts_AB_unique" ON "_IngredientsToProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_IngredientsToProducts_B_index" ON "_IngredientsToProducts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ConcernsToIngredients_AB_unique" ON "_ConcernsToIngredients"("A", "B");

-- CreateIndex
CREATE INDEX "_ConcernsToIngredients_B_index" ON "_ConcernsToIngredients"("B");
