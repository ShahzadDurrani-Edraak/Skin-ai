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

app.get("/products-metafields", async (http_request, http_response) => {
  try {
    const products = await shopify.product.list({ limit: 100 });
    const ingredientsList = [];

    for (const product of products) {
      const metafields = await shopify.metafield.list({
        metafield: { owner_resource: "product", owner_id: product.id },
      });

      const ingMetafield = metafields.find((mf) => mf.key === "ing");

      if (ingMetafield) {
        const ingredients = JSON.parse(ingMetafield.value);
        ingredientsList.push({ productId: product.id, ingredients });
      }
    }

    http_response.json(ingredientsList);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    http_response.status(500).json({ error: "Error fetching ingredients" });
  }
});

app.get("/api/usersSkinProfile", async (http_request, http_response) => {
  const usersSkinProfiles = await prisma.userSkinProfiles.findMany();
  http_response.json(usersSkinProfiles);
});

app.post("/api/getUploadURL", async (http_request, http_response) => {
  const { filename, mimeType, size } = http_request.body;
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
          filename: new Date().toISOString() + mimeType.replace("image/", ""),
          httpMethod: "POST",
          mimeType: mimeType,
          resource: "IMAGE",
          fileSize: size,
        },
      ],
    },
  );

  http_response.json(stagedTargets[0]);
});

app.post("/api/uploadImages", async (http_request, http_response) => {
  const { image, parameters } = http_request.body;

  const form = new FormData();
  parameters.forEach(({ name, value }) => {
    form.append(name, value);
  });

  form.append("file", image);

  try {
    const uploadResponse = await fetch(parameters.resourceUrl, {
      method: "POST",
      headers: {
        ...form.getHeaders(),
      },
      body: form,
    });

    const uploadData = await uploadResponse.json();
    http_response.json(uploadData);
  } catch (error) {
    console.error("Error uploading image:", error);
    http_response.status(500).json({ error: "Error uploading image" });
  }
});

// Apply multer middleware to parse the image from the form-data request
const upload = multer();
app.post(
  "/api/usersSkinProfile",
  upload.single("image"),
  async (http_request, http_response) => {
    // Extract data from form-data request
    const { skinType, concerns, userId, userName } = http_request.body;
    // Reading from the buffer
    const image = http_request.file;

    // Adding user to prisma database
    await prisma.userSkinProfiles.create({
      data: {
        userId,
        skinType: parseInt(skinType) || -1,
        userName,
        image: image.buffer,
        skinConcerns: concerns
          ? {
              connect: concerns.split(",").map((concern) => ({ id: concern })),
            }
          : "",
      },
    });

    http_response.json({ success: true });
  },
);

// app.post("/api/usersSkinProfile", async (http_request, http_response) => {
//   // Extract data from form-data request
//   const { skinType, concerns, image, userId, userName } = http_request.body;

//   prisma.userSkinProfiles.create({
//     data: {
//       userId,
//       skinType,
//       userName,
//       // image: image,
//       concerns: {
//         connect: concerns.map((concern) => ({ id: concern })),
//       },
//     },
//   });

//   http_response.json(imageURL);
// });

app.post(
  "/api/products/recommendations",
  async (http_request, http_response) => {
    // array of concerns11111111111111
    const concerns = http_request.body?.concerns;
    const skinType = http_request.body?.skinType;

    if (!concerns || !skinType) {
      http_response.status(400).json({ error: "Invalid request" });
      return;
    }
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

    http_response.json(ingredients);

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
