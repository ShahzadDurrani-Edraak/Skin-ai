import axios from "axios";
import fs from "fs";

// Load image from file system
const image = fs.readFileSync("image.png");
// convert to blob
const imageFile = new Blob([image], { type: "image/png" });

const response = await fetch("https://0b6a-182-180-181-6.ngrok-free.app/api/getUploadURL", {
  method: "POST",
  redirect: "follow",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    mimeType: imageFile.type,
    fileSize: imageFile.size.toString(),
  }),
})

const responseData = await response.json();

const form = new FormData();

// Add each of the params we received from Shopify to the form. this will ensure our ajax request has the proper permissions and s3 location data.
responseData.parameters.forEach(({ name, value }) => {
  form.append(name, value);
});

form.append("file", image);

try {
  const uploadResponse = await axios.post(responseData.resourceUrl, form, {
    headers: {
      ...form.getHeaders()
    },
  });
  
  const uploadData = uploadResponse.data;
} catch (error) {
  console.error("Error uploading image:", error);
}
