import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import express from "express";
const app = express();
import { createServer } from "http";
import cors from "cors";

app.use(express.json());

app.use(cors({ origin: true, credentials: true }));

app.get("/", async (http_request, http_response) => {
  http_response.send(
    "<html><body><p>Your Node instance is running.</p></body></html>",
  );
});

app.post(
  "/api/products/recommendations",
  async (http_request, http_response) => {
    // array of concerns
    const concerns = http_request.body?.concerns;
    const skinType = http_request.body?.skinType;

    // Read data from sqlLite file
    const concernsResponse = await prisma.concerns.findMany({
      where: {
        id: {
          in: concerns,
        },
      },
      include: {
        ingredients: true,
      },
    });

    // Develop an ingredients object with their frequency from the concerns
    const ingredients = {};
    concernsResponse.forEach((concern) => {
      concern.ingredients.forEach((ingredient) => {
        if (ingredients[ingredient.id]) {
          ingredients[ingredient.id] += 1;
        } else {
          ingredients[ingredient.id] = 1;
        }
      });
    });

    // Fetch products from the database
    const products = await prisma.products.findMany({
      where: {
        ingredients: {
          some: { id: { in: Object.keys(ingredients) } },
        },
      },
      include: {
        ingredients: true,
      },
    });

    // Rank the products based on the ingredients frequency and return the top 5
    const rankedProducts = products
      .map((product) => {
        let score = 0;
        product.ingredients.forEach((ingredient) => {
          score += ingredients[ingredient.id] || 0;
        });
        return { ...product, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    http_response.json(rankedProducts);
  },
);

const httpServer = createServer(app);

httpServer.listen(5000, () =>
  console.log("Your Slack-OAuth app is listening on port 5000."),
);
