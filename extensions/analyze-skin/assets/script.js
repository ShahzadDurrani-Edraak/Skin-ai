// function _(el) {
//   return document.getElementById(el);
// }
// function uploadFile() {
//   _("fileLabel").style.display = "none";
//   _("file").style.display = "none";
//   _("progressBar").style.display = "block";
//   var file = _("file").files[0];
//   var formdata = new FormData();
//   formdata.append("file", file);
//   var ajax = new XMLHttpRequest();
//   ajax.upload.addEventListener("progress", progressHandler, false);
//   ajax.addEventListener("load", completeHandler(file), false);
//   ajax.addEventListener("error", errorHandler, false);
//   ajax.addEventListener("abort", abortHandler, false);
//   ajax.send(formdata);
// }

// function progressHandler(event) {
//   _("progressBar").value = Math.round((event.loaded / event.total) * 100);
//   _("uploadPercentage").innerHTML =
//     "Uploading (" + Math.round((event.loaded / event.total) * 100) + "%)";
// }

// function completeHandler(event, file) {
//   // _("progressBar").value = 0;
//   _("progressBar").style.display = "none";
//   _("uploadPercentage").innerHTML = "Uploaded Successful";
//   // _("uploadedImage").style.display = "inline-block";
//   // _("uploadedImage").src = "URL of the uploaded image";
//   sendImageToAPI(file);
// }

// function errorHandler(event) {
//   _("status").innerHTML = "Upload Failed";
// }

// function abortHandler(event) {
//   _("status").innerHTML = "Upload Aborted";
// }

async function sendImageToAPI(imageFile) {
  const analysisTextDiv1 = document.getElementById("text1");
  const analysisTextDiv2 = document.getElementById("text2");
  if (imageFile) {
    const formData = new FormData();
    formData.append("image_file", imageFile);
    formData.append("api_key", "sg8Szcc8f-5zsZuwDGI4KWWP8yGGSZ8p");
    formData.append("api_secret", "_51Ksj6-8td2WmjOoYsWHfgCdgSyRG-v");

    const progressBar = document.getElementById("progressBar");
    const uploadPercentage = document.getElementById("uploadPercentage");
    progressBar.style.display = "block";

    try {
      const response = await fetch(
        "https://api-us.faceplusplus.com/facepp/v1/skinanalyze",
        {
          method: "POST",
          body: formData,
          onUploadProgress: function (progressEvent) {
            const percentCompleted = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100,
            );
            progressBar.value = percentCompleted;
            uploadPercentage.innerText = `Uploading (${percentCompleted}%)`;
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        const result = data.result;

        const analysisTextDiv = document.getElementById("issues-list");
        let featureListHTML = "<ul>";

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

        featureListHTML += "</ul>";
        analysisTextDiv.innerHTML = featureListHTML;
        analysisTextDiv1.style.display = "none";
        analysisTextDiv2.style.display = "block";

        // Fetching recommended products
        const address = "https://e919-39-45-164-1.ngrok-free.app";
        try {
          const productResponse = await fetch(
            address + "/api/products/recommendations",
            {
              method: "POST",
              body: JSON.stringify({
                concerns: featureList,
                skinType: skinTypeIndex,
              }),
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
          let products = [];
          if (!productResponse.ok) {
            console.error(
              "Failed to fetch recommended products. Assigning dummy data",
            );
            products = [
              {
                id: "3",
                name: "Product 3",
                description: null,
                image: null,
                ingredients: [
                  {
                    id: "Benzoyl Peroxide",
                    name: "Benzoyl Peroxide",
                    description: null,
                    image: null,
                  },
                  {
                    id: "Niacinamide",
                    name: "Niacinamide",
                    description: null,
                    image: null,
                  },
                  {
                    id: "Retinol",
                    name: "Retinol",
                    description: null,
                    image: null,
                  },
                ],
                score: 3,
              },
              {
                id: "4",
                name: "Product 4",
                description: null,
                image: null,
                ingredients: [
                  {
                    id: "Caffeine",
                    name: "Caffeine",
                    description: null,
                    image: null,
                  },
                  {
                    id: "Hyaluronic Acid",
                    name: "Hyaluronic Acid",
                    description: null,
                    image: null,
                  },
                  {
                    id: "Peptides",
                    name: "Peptides",
                    description: null,
                    image: null,
                  },
                  {
                    id: "Retinoids",
                    name: "Retinoids",
                    description: null,
                    image: null,
                  },
                  {
                    id: "Vitamin C",
                    name: "Vitamin C",
                    description: null,
                    image: null,
                  },
                ],
                score: 6,
              },
              {
                id: "5",
                name: "Product 5",
                description: null,
                image: null,
                ingredients: [
                  {
                    id: "Caffeine",
                    name: "Caffeine",
                    description: null,
                    image: null,
                  },
                  {
                    id: "Peptides",
                    name: "Peptides",
                    description: null,
                    image: null,
                  },
                  {
                    id: "Retinoids",
                    name: "Retinoids",
                    description: null,
                    image: null,
                  },
                  {
                    id: "Vitamin C",
                    name: "Vitamin C",
                    description: null,
                    image: null,
                  },
                ],
                score: 5,
              },
            ];
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
      } else {
        console.error("Failed to upload image");

        analysisTextDiv1.style.display = "none";
        analysisTextDiv2.style.display = "block";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      progressBar.style.display = "none";
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

    console.log("BLOB ::::", blob);

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

retake.addEventListener("click", function () {
  startCapture.style.display = "none";
  captureButton.style.display = "inline-block";
  closeButton.style.display = "inline-block";
  analysisImage.style.backgroundImage = ``;
  startCamera();
});
