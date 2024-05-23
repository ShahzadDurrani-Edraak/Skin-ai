import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import express from "express";
const app = express();
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import Shopify from "shopify-api-node";
import multer from "multer";
dotenv.config();

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_APP_URL.split("://")[1].replace("/", ""),
  // apiKey: process.env.SHOPIFY_API_KEY,
  // password: process.env.SHOPIFY_API_PASS,
  accessToken: process.env.SHOPIFY_APP_ACCESS_TOKEN,
  apiVersion: "2024-04",
});

// Allow parsing of request body
app.use(express.json());
// Allow parsing of FormData
app.use(express.urlencoded({ extended: true }));
// Allow parsing of multipart/form-data

// To allow cross-origin requests
app.use(cors({ origin: true, credentials: true }));

app.get("/", async (http_request, http_response) => {
  http_response.send(
    "<html><body><p>Your Node instance is running.</p></body></html>",
  );
});

app.get("/products", async (http_request, http_response) => {
  let products;
  try {
    // shopify api request to get products
    products = await shopify.product.list({ limit: 5 });
  } catch (error) {
    console.error(error);
  }
  http_response.json(products);
});

app.get("/api/usersSkinProfile", async (http_request, http_response) => {
  const usersSkinProfiles = await prisma.userSkinProfiles.findMany();
  http_response.json(usersSkinProfiles);
});

app.get("/api/files", async (http_request, http_response) => {
  const files = await shopify.graphql(`{
    files (first: 10, where: {mimeType: "image/png"}) {
      nodes {
        id
        ... on MediaImage {
          image {
            url
            width
            height
          }
          mimeType
        }
        alt
      }
    }
  }`);

  http_response.json(files);
});

app.get("/api/getUploadURL", async (http_request, http_response) => {
  const {
    stagedUploadsCreate: { stagedTargets },
  } = await shopify.graphql(
    `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
      }
    }`,
    {
      input: [
        {
          filename: "image.png",
          httpMethod: "POST",
          mimeType: "image/png",
          resource: "IMAGE",
        },
      ],
    },
  );
  http_response.json(stagedTargets[0]);
});

app.post("/api/usersSkinProfile", async (http_request, http_response) => {
  // Extract data from form-data request
  const { skinType, concerns, image } = http_request.body;
  console.log(http_request.body);

  http_response.json({ skinType, concerns, image });
  return;
  // Convert blob to image
  let imageURL;

  console.log(imageURL);

  http_response.json(imageURL);
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
  console.log("Node App is listening on port 5000."),
);
