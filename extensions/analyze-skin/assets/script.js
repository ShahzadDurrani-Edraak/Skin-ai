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
      const response = await fetch(
        "https://api-us.faceplusplus.com/facepp/v1/skinanalyze",
        {
          method: "POST",
          body: formData,
        },
      );

      clearInterval(interval);

      // progressBar.value = 100;
      // uploadPercentage.innerText = `Upload complete`;

      // const response = {
      //   ok: true,
      //   json: async () => ({
      //     result: {
      //       skin_type: {
      //         value: 1,
      //         skin_type: "Oily skin",
      //       },
      //       acne: {
      //         value: 1,
      //         confidence: 0.9,
      //       },
      //       dark_spots: {
      //         value: 1,
      //         confidence: 0.8,
      //       },
      //     },
      //   }),
      // };

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
            skinTypeIndex = skinType;
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

        const address = "https://d2b0-182-181-140-175.ngrok-free.app";

        // Using promise.all to save user skin profile and fetch the recommended products
        const recommendedProductsFetch = fetch(
          address + "/api/recommendedProducts",
          {
            method: "POST",
            body: JSON.stringify({
              concerns: ["acne", "dark_circle", "mole"], //featureList
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
        // formdata.append("userName", userName);

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
          console.log("responses[0] :>> ", responses);
          let products = [];
          if (responses[1].ok) {
            console.log("User profile created successfully");
          } else {
            console.error("Failed to create user profile");
          }

          const productResponse = responses[0];
          // console.log("products response", productResponse.json());
          // if (!productResponse.ok) {
          //   console.error("Failed to fetch recommended products.");
          // } else {
          //   products = await productResponse.json();
          // }

          // document
          //   .getElementById("recommendations-container")
          //   .classList.remove("recommendations--hidden");
          // const recommendationListDiv =
          //   document.getElementById("recommedation-list");

          // let recommendedProductsList = `<div class="collection section-template--22506498523426__featured_collection-padding" id="collection-template--22506498523426__featured_collection" data-id="template--22506498523426__featured_collection">
          //                               <ul id="Slider-template--22506498523426__featured_collection" data-id="template--22506498523426__featured_collection" class="grid product-grid contains-card contains-card--product contains-card--standard grid--4-col-desktop grid--2-col-tablet-down" role="list" aria-label="Slider"><li id="Slide-template--22506498523426__featured_collection-1" class="grid__item scroll-trigger animate--slide-in" data-cascade="" style="--animation-order: 1;">`;
          // products.forEach((product) => {
          //   recommendedProductsList += generateProductCard(product);
          // });
          // recommendedProductsList += "</ul></div>";
          // recommendationListDiv.innerHTML = recommendedProductsList;

          if (!productResponse.ok) {
            console.error("Failed to fetch recommended products.");
          } else {
            const productsByCategory = await productResponse.json();

            document
              .getElementById("recommendations-container")
              .classList.remove("recommendations--hidden");
            const recommendationListDiv =
              document.getElementById("recommedation-list");

            let recommendedProductsHTML = "";

            for (const category in productsByCategory) {
              if (productsByCategory.hasOwnProperty(category)) {
                const products = productsByCategory[category];
                if (products.length > 0) {
                  recommendedProductsHTML += `
                    <div class="collection section-template" id="collection-${category}" data-id="template-${category}">
                      <h2>Recommended Products for ${category.charAt(0).toUpperCase() + category.slice(1)}</h2>
                      <ul id="Slider-${category}" class="grid product-grid contains-card contains-card--product contains-card--standard grid--4-col-desktop grid--2-col-tablet-down" role="list" aria-label="Slider">
                  `;
                  products.forEach((product) => {
                    recommendedProductsHTML += generateProductCard(product);
                  });
                  recommendedProductsHTML += `
                      </ul>
                    </div>
                  `;
                }
              }
            }

            recommendationListDiv.innerHTML = recommendedProductsHTML;
          }
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

function generateProductCard(product) {
  return `
  <li id="Slide-template--22506498523426__featured_collection-1" class="grid__item scroll-trigger animate--slide-in" data-cascade="" style="--animation-order: 1;">
   <div class="card-wrapper product-card-wrapper underline-links-hover">
      <div class="card card--standard card--media" style="--ratio-percent: 100.0%;">
        <div class="card__inner color-scheme-2 gradient ratio" style="--ratio-percent: 100.0%;">
          <div class="card__media">
            <div class="media media--transparent media--hover-effect">
              <img src="${product.image?.src}" sizes="(min-width: 1200px) 267px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)" alt="${product.name}" class="motion-reduce" loading="lazy" width="100" height="100" />
            </div>
          </div>
          <div class="card__content">
            <div class="card__information">
              <h3 class="card__heading">
                <a href="../products/${product.handle}" class="full-unstyled-link">${product.title}</a>
              </h3>
            </div>
          </div>
        </div>
        <div class="card__content">
          <div class="card__information">
            <h3 class="card__heading h5">
              <a href="../products/${product.handle}" class="full-unstyled-link">${product.title}</a>
            </h3>
            <div class="card-information">
              <div class="price price--sold-out">
                <div class="price__container">
                  <div class="price__regular">
                    <span class="visually-hidden visually-hidden--inline">Regular price</span>
                    <span class="price-item price-item--regular">0</span>
                  </div>
                  <div class="price__sale">
                    <span class="visually-hidden visually-hidden--inline">Regular price</span>
                    <span>
                      <s class="price-item price-item--regular"></s>
                    </span>
                    <span class="visually-hidden visually-hidden--inline">Sale price</span>
                    <span class="price-item price-item--sale price-item--last">0</span>
                  </div>
                  <small class="unit-price caption hidden">
                    <span class="visually-hidden">Unit price</span>
                    <span class="price-item price-item--last">
                      <span></span>
                      <span aria-hidden="true">/</span>
                      <span class="visually-hidden">&nbsp;per&nbsp;</span>
                      <span></span>
                    </span>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </li>
  `;
}
