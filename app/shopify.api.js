import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import express from "express";
const app = express();
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import Shopify from "shopify-api-node";
import multer from "multer";
import crypto from "crypto";
dotenv.config();

function validateShopifySignature() {
  return async (req, res, next) => {
    try {
      const rawBody = req.rawBody;
      if (typeof rawBody == "undefined") {
        throw new Error(
          "validateShopifySignature: req.rawBody is undefined. Please make sure the raw request body is available as req.rawBody.",
        );
      }

      const hmac = req.headers["x-shopify-hmac-sha256"];
      const hash = crypto
        .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("base64");

      const signatureOk = crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(hmac),
      );

      if (!signatureOk) {
        res.status(403);
        res.send("Unauthorized");

        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_APP_URL.split("://")[1].replace("/", ""),
  // apiKey: process.env.SHOPIFY_API_KEY,
  // password: process.env.SHOPIFY_API_PASS,
  accessToken: process.env.SHOPIFY_APP_ACCESS_TOKEN,
  apiVersion: "2024-04",
});

// Allow parsing of request body
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);
// Allow parsing of FormData
app.use(express.urlencoded({ extended: true }));
// Allow parsing of multipart/form-data

// To allow cross-origin requests
app.use(cors({ origin: true, credentials: true }));

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

app.get("/", async (http_request, http_response) => {
  http_response.send(
    "<html><body><p>Your Node instance is running.</p></body></html>",
  );
});

app.delete("/api/localProducts", async (http_request, http_response) => {
  const products = await prisma.products.deleteMany();
  http_response.json(products);
});

app.get("/api/localProducts", async (http_request, http_response) => {
  const products = await prisma.products.findMany({
    include: {
      ingredients: true,
    },
  });
  http_response.json(products);
});

app.get("/api/products", async (http_request, http_response) => {
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

app.get("/api/ingredients", async (http_request, http_response) => {
  const ingredients = await prisma.ingredients.findMany({
    include: {
      concerns: true,
    },
  });
  http_response.json(ingredients.map((ingredient) => ingredient.id));
});

app.post("/api/ingredients", async (http_request, http_response) => {
  const { id, concerns } = http_request.body;

  const ingredient = await prisma.ingredients.create({
    data: {
      id,
      concerns: {
        connect: concerns?.map((concern) => ({ id: concern })) || [],
      },
    },
  });
  http_response.json(ingredient);
});

app.delete("/api/ingredients", async (http_request, http_response) => {
  const { id } = http_request.body;

  const ingredient = await prisma.ingredients.delete({
    where: { id },
  });
  http_response.json(ingredient);
});

const syncIngredients = async () => {
  try {
    const ingredients = await prisma.ingredients.findMany();
    const ingredientsArray = ingredients.map((ingredient) => ingredient.id);

    if (!ingredientsArray.length) {
      console.error("No ingredients found to sync");
      return;
    }

    const ingredientsResponse = await shopify.graphql(
      `mutation updateIngredients($definition: MetafieldDefinitionUpdateInput!) {
        metafieldDefinitionUpdate(definition: $definition) {
          updatedDefinition {
            id
            name
          }
          userErrors {
            field
            message
            code
          }
        }
      }`,
      {
        definition: {
          name: "Product Ingredients",
          namespace: "custom",
          key: "ingredients",
          ownerType: "PRODUCT",
          pin: true,
          validations: {
            name: "choices",
            value: JSON.stringify(ingredientsArray),
          },
        },
      },
    );

    console.log("Ingredients synced successfully:", ingredientsResponse);
  } catch (error) {
    console.error("Error syncing ingredients:", error);
  }
};

prisma.$use(async (params, next) => {
  const result = await next(params);
  console.log("Prisma action:", params.action, params.model);
  if (
    ["read", "create", "update", "delete"].includes(params.action) &&
    params.model === "Ingredients"
  ) {
    await syncIngredients();
  }

  return result;
});

app.post(
  "/api/deleteProduct",
  validateShopifySignature(),
  async (http_request, http_response) => {
    const { id } = http_request.body;

    // Delete product from database
    const res = await prisma.products.delete({
      where: {
        productId: id,
      },
    });

    http_response.json({ res });
  },
);

app.post(
  "/api/syncProduct",
  validateShopifySignature(),
  async (http_request, http_response) => {
    const { id } = http_request.body;

    console.log(id);
    // Use graphql to fetch product ingredients
    const ingredientsResponse = await shopify.metafield.list({
      metafield: {
        owner_resource: "product",
        owner_id: id,
        namespace: "custom",
        key: "ingredients",
      },
    });

    console.log(ingredientsResponse);
    const ingredients = ingredientsResponse.length
      ? JSON.parse(
          ingredientsResponse.find((list) => list.key == "ingredients")?.value,
        )
      : [];

    // update or create if not found product to database
    const res = await prisma.products.upsert({
      create: {
        productId: id,
        ingredients: {
          connect: ingredients.map((ingredient) => ({
            id: ingredient,
          })),
        },
      },
      update: {
        ingredients: {
          connect: ingredients.map((ingredient) => ({
            id: ingredient,
          })),
        },
      },
      where: {
        productId: id,
      },
    });

    http_response.json({ res });
  },
);

app.post(
  "/api/syncProductDeletion",
  validateShopifySignature(),
  async (http_request, http_response) => {
    const { id } = http_request.body;

    // Delete product from database
    const res = await prisma.products.delete({
      where: {
        productId: id,
      },
    });

    http_response.json({ res });
  },
);

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

app.get("/api/usersSkinProfile", async (http_request, http_response) => {
  const usersSkinProfiles = await prisma.userSkinProfiles.findMany();
  http_response.json(usersSkinProfiles);
});

// Apply multer middleware to parse the image from the form-data request
const upload = multer();
app.post(
  "/api/usersSkinProfile",
  upload.single("image"),
  async (http_request, http_response) => {
    // Extract data from form-data request
    const { skinType, concerns, userId } = http_request.body;
    // Reading from the buffer
    const image = http_request.file;

    // Adding user to prisma database
    await prisma.userSkinProfiles.create({
      data: {
        userId,
        skinType: parseInt(skinType) || -1,
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

app.post("/api/recommendedProducts", async (http_request, http_response) => {
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

  const concernToIngredientsMap = concernsResponse.reduce(
    (acc, concern) => ({
      ...acc,
      [concern.id]: concern.ingredients.map((ingredient) => ingredient.id),
    }),
    {},
  );

  const uniqueIngredients = [
    ...new Set(Object.values(concernToIngredientsMap).flat()),
  ];

  // Fetch products from the database
  const localProducts = await prisma.products.findMany({
    where: {
      ingredients: {
        some: { id: { in: uniqueIngredients } },
      },
    },
    include: {
      ingredients: true,
    },
  });

  // Fetch products from shopify
  const products = await shopify.product.list({
    ids: localProducts.map((product) => product.productId).join(","),
  });

  console.log(
    localProducts.map((product) => product.productId.toString()),
    products.map((product) => product.id.toString()),
    localProducts[0]?.productId.toString() == products[0].id.toString(),
    localProducts[1]?.productId.toString() == products[0].id.toString(),
    localProducts[2]?.productId.toString() == products[0].id.toString(),
  );
  // Map local products with shopify products
  const localToShopifyProducts = localProducts.map((localProduct) => {
    const product = products.find(
      (product) => localProduct.productId.toString() == product.id.toString(),
    );

    return {
      ...product,
      ingredients: localProduct.ingredients.map((ingredient) => ingredient.id),
    };
  });

  // Map concerns to shopify products
  const recommendedProducts = {};
  // recommendedProducts[concern.id] =
  Object.entries(concernToIngredientsMap).map(([concern, ingredients]) => {
    recommendedProducts[concern] = localToShopifyProducts
      .filter((product) =>
        product.ingredients.some((ingredient) =>
          ingredients.includes(ingredient),
        ),
      )
      .map((product) => {
        const commonIngredients = product.ingredients.filter((ingredient) =>
          ingredients.includes(ingredient),
        );
        return {
          ...product,
          commonIngredients: commonIngredients,
          score: commonIngredients.length,
        };
      })
      .sort((a, b) => b.commonIngredients.length - a.commonIngredients.length);
  });

  http_response.json(recommendedProducts);
});

const httpServer = createServer(app);

httpServer.listen(5000, () =>
  console.log("Node App is listening on port 5000."),
);
