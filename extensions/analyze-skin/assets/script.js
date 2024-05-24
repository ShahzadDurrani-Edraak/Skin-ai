async function sendImageToAPI(imageFile) {
  const analysisTextDiv1 = document.getElementById("text1");
  const analysisTextDiv2 = document.getElementById("text2");
  const errorDiv = document.getElementById("error");
  if (imageFile) {
    const formData = new FormData();
    formData.append("image_file", imageFile);
    formData.append("api_key", "sg8Szcc8f-5zsZuwDGI4KWWP8yGGSZ8p");
    formData.append("api_secret", "_51Ksj6-8td2WmjOoYsWHfgCdgSyRG-v");

    const progressBar = document.getElementById("progressBar");
    const progressDiv = document.getElementById("progressing");
    const uploadPercentage = document.getElementById("uploadPercentage");
    progressDiv.style.display = "flex";

    let progress = 0;

    function updateProgressBar() {
      progress += 10;
      progressBar.value = Math.min(progress, 90);
      uploadPercentage.innerText = `Uploading (${Math.min(progress, 90)}%)`;
    }

    const interval = setInterval(updateProgressBar, 500);

    // Will need to update
    /*try {
      // Get the upload URL
      const response = await fetch(
        "https://0b6a-182-180-181-6.ngrok-free.app/api/getUploadURL",
        {
          method: "POST",
          body: JSON.stringify({
            mimeType: imageFile.type,
            size: imageFile.size.toString(),
          }),
          redirect: "follow",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const responseData = await response.json();

      const form = new FormData();

      // Add each of the params we received from Shopify to the form. this will ensure our ajax request has the proper permissions and s3 location data.
      responseData.parameters.forEach(({ name, value }) => {
        form.append(name, value);
      });

      form.append("file", image);

      try {
        const uploadResponse = await fetch(responseData.url, {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: form,
        });

        const uploadData = await uploadResponse.json();
        console.log(uploadData);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    } catch (error) {
      console.error("Error generating image url:", error);
    } */

    try {
      // const response = await fetch(
      //   "https://api-us.faceplusplus.com/facepp/v1/skinanalyze",
      //   {
      //     method: "POST",
      //     body: formData,
      //   },
      // );

      clearInterval(interval);

      progressBar.value = 100;
      uploadPercentage.innerText = `Upload complete`;

      const response = {
        ok: true,
        json: async () => ({
          result: {
            skin_type: {
              value: 1,
              skin_type: "Oily skin",
            },
            acne: {
              value: 1,
              confidence: 0.9,
            },
            dark_spots: {
              value: 1,
              confidence: 0.8,
            },
          },
        }),
      };

      if (response.ok) {
        const data = await response.json();
        const result = data.result;

        const analysisTextDiv = document.getElementById("issues-list");
        let featureListHTML = "";

        // Mapping data to the feature list in order to fetch recommended products
        const featureList = [];
        let skinTypeIndex;
        for (const [feature, details] of Object.entries(result)) {
          if (feature === "skin_type") {
            skinTypeIndex = details.value;
            const skinType = details.skin_type;
            const skinTypeDetails = [
              "Oily skin",
              "Dry skin",
              "Neutral skin",
              "Combination skin",
            ];
            const skinTypeDetail = skinTypeDetails[skinType];
            featureListHTML += `<li>Skin Type: ${skinTypeDetail}</li>`;
          } else {
            if (details.value === 1 && details.confidence > 0.8) {
              featureListHTML += `<li>${feature}</li>`;
              featureList.push(feature);
            }
          }
        }

        console.log("Feature List:", featureList);

        featureListHTML += "";
        analysisTextDiv.innerHTML = featureListHTML;
        analysisTextDiv1.style.display = "none";
        analysisTextDiv2.style.display = "block";

        const address = "https://2e6b-182-180-181-6.ngrok-free.app";

        // Using promise.all to save user skin profile and fetch the recommended products
        const recommendedProductsFetch = fetch(
          address + "/api/products/recommendations",
          {
            method: "POST",
            body: JSON.stringify({
              concerns: featureList,
              skinType: skinTypeIndex,
            }),
            redirect: "follow",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );

        const formdata = new FormData();
        formdata.append("skinType", skinTypeIndex);
        formdata.append("concerns", featureList.join(","));
        formdata.append("image", imageFile);

        const userId = document.getElementById("customerId").innerText;
        const userName = document.getElementById("customerName").innerText;
        // Populate these accordingly
        formdata.append("userId", userId);
        formdata.append("userName", userName);

        console.log("Form Data:", userId, userName, skinTypeIndex, featureList);

        const requestOptions = {
          method: "POST",
          body: formdata,
          redirect: "follow",
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        };

        const createUserProfileReq = fetch(
          address + "/api/usersSkinProfile",
          requestOptions,
        );
        // Fetching recommended products
        try {
          const responses = await Promise.all([
            recommendedProductsFetch,
            createUserProfileReq,
          ]);
          let products = [];
          if (responses[1].ok) {
            console.log("User profile created successfully");
          } else {
            console.error("Failed to create user profile");
          }
          const productResponse = responses[0];
          if (!productResponse.ok) {
            console.error("Failed to fetch recommended products.");
          } else {
            products = await productResponse.json();
          }

          document
            .getElementById("recommendations-container")
            .classList.remove("recommendations--hidden");
          const recommendationListDiv =
            document.getElementById("recommedation-list");

          let recommendedProductsList = "<ul>";
          products.forEach((product) => {
            recommendedProductsList += `<li><a href="${product.url}" target="_blank">${product.name}</a></li>`;
          });
          recommendedProductsList += "</ul>";
          recommendationListDiv.innerHTML = recommendedProductsList;
        } catch (error) {
          console.error("Error fetching recommended products:", error);
        }
      } else if (response.status === 400) {
        analysisTextDiv1.style.display = "none";
        analysisTextDiv2.style.display = "none";
        errorDiv.style.display = "block";
      } else {
        console.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      progressDiv.style.display = "none";
      progressBar.value = 0;
      uploadPercentage.innerText = "";
    }
  } else {
    console.error("No image selected");
  }
}

const analysisImage = document.getElementById("analysis-image");
const cameraFeed = document.getElementById("cameraFeed");
const captureButton = document.getElementById("captureButton");
const startCapture = document.getElementById("captureImage");
const closeButton = document.getElementById("closeButton");
const retake = document.getElementById("retake");
const retakeButtons = document.querySelectorAll(".retake");

let stream;

async function startCamera() {
  try {
    cameraFeed.style.display = `block`;
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraFeed.srcObject = stream;
    await cameraFeed.play();
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
}

function stopCamera() {
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    cameraFeed.style.display = `none`;
    captureButton.style.display = "none";
    closeButton.style.display = "none";
  }
}

function closeCamera() {
  startCapture.style.display = "inline-block";
}

function captureImage() {
  const canvas = document.createElement("canvas");
  canvas.width = cameraFeed.videoWidth;
  canvas.height = cameraFeed.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(function (blob) {
    const imageData = URL.createObjectURL(blob);
    analysisImage.style.backgroundImage = `url(${imageData})`;

    // console.log("BLOB ::::", blob);

    // Send the image data to
    sendImageToAPI(blob);
  }, "image/jpeg");

  stopCamera();
}

captureButton.addEventListener("click", captureImage);

closeButton.addEventListener("click", function () {
  stopCamera();
  closeCamera();
});

startCapture.addEventListener("click", function () {
  startCapture.style.display = "none";
  captureButton.style.display = "inline-block";
  closeButton.style.display = "inline-block";
  startCamera();
});

// retake.addEventListener("click", function () {
//   startCapture.style.display = "none";
//   captureButton.style.display = "inline-block";
//   closeButton.style.display = "inline-block";
//   analysisImage.style.backgroundImage = ``;
//   document
//     .getElementById("recommendations-container")
//     .classList.add("recommendations--hidden");
//   startCamera();
// });

retakeButtons.forEach(function (retakeButton) {
  retakeButton.addEventListener("click", function () {
    startCapture.style.display = "none";
    captureButton.style.display = "inline-block";
    closeButton.style.display = "inline-block";
    analysisImage.style.backgroundImage = ``;
    document
      .getElementById("recommendations-container")
      .classList.add("recommendations--hidden");
    startCamera();
  });
});
