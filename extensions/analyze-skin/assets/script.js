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

        for (const [feature, details] of Object.entries(result)) {
          if (feature === "skin_type") {
            const skinTypeValue = details.skin_type;
            const skinTypeDetails = [
              "Oily skin",
              "Dry skin",
              "Neutral skin",
              "Combination skin",
            ];
            const skinTypeDetail = skinTypeDetails[skinTypeValue];
            featureListHTML += `<li>Skin Type: ${skinTypeDetail}</li>`;
          } else {
            if (details.value === 1 && details.confidence > 0.8) {
              featureListHTML += `<li>${feature}</li>`;
            }
          }
        }

        featureListHTML += "</ul>";
        analysisTextDiv.innerHTML = featureListHTML;
        analysisTextDiv1.style.display = "none";
        analysisTextDiv2.style.display = "block";
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
