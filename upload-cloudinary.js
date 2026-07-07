// ===============================
// upload-cloudinary.js
// PHẦN 3A
// ===============================

const CLOUD_NAME = "dmz9gpp1b";
const UPLOAD_PRESET = "stech_up";

let uploading = false;

let videoURL = "";
let thumbnailURL = "";

const postBtn =
document.getElementById("uploadPost");

// =====================
// Progress UI
// =====================

const progress = document.createElement("div");

progress.id = "uploadProgress";

progress.innerHTML = `
<div class="upload-progress-bar"></div>
<div class="upload-progress-text">
0%
</div>
`;

document
.getElementById("uploadPanel")
.appendChild(progress);

const css = document.createElement("style");

css.textContent = `

#uploadProgress{

display:none;

padding:18px;

}

.upload-progress-bar{

height:8px;

background:#25F4EE;

width:0%;

border-radius:20px;

transition:.2s;

}

.upload-progress-text{

margin-top:8px;

color:#fff;

font-size:14px;

text-align:center;

}

`;

document.head.appendChild(css);


// =====================
// Update Progress
// =====================

function setProgress(value){

progress.style.display="block";

progress
.querySelector(".upload-progress-bar")
.style.width = value + "%";

progress
.querySelector(".upload-progress-text")
.innerText = value + "%";

}


// =====================
// Upload 1 file
// =====================

async function uploadFile(file,type){

const form = new FormData();

form.append("file",file);

form.append(
"upload_preset",
UPLOAD_PRESET
);

const xhr = new XMLHttpRequest();

return new Promise((resolve,reject)=>{

xhr.upload.onprogress=(e)=>{

if(e.lengthComputable){

const percent = Math.floor(
(e.loaded/e.total)*100
);

setProgress(percent);

}

};

xhr.onreadystatechange=()=>{

if(xhr.readyState!==4) return;

if(xhr.status===200){

const json=
JSON.parse(xhr.responseText);

resolve(json.secure_url);

}else{

reject(xhr.responseText);

}

};

xhr.open(
"POST",
`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type}/upload`
);

xhr.send(form);

});

}

console.log("upload-cloudinary 3A loaded");
// ===============================
// upload-cloudinary.js
// PHẦN 3B
// ===============================

document.addEventListener(
"upload-start",
async()=>{

if(uploading) return;

uploading = true;

postBtn.disabled = true;

postBtn.innerText = "Đang upload...";

try{

const video =
window.uploadPreview.getVideo();

const thumb =
window.uploadPreview.getThumbnail();

if(!video){

throw "Chưa chọn video";

}

setProgress(1);

// Upload song song
const result = await uploadCloudinary();

console.log("RESULT =", result);

videoURL = result.videoURL;
thumbnailURL = result.thumbnailURL;

console.log("videoURL =", videoURL);
console.log("thumbnailURL =", thumbnailURL);

setProgress(100);

console.log("Video:",videoURL);

console.log("Thumbnail:",thumbnailURL);

// báo sang Firestore
document.dispatchEvent(

new CustomEvent(
"cloudinary-success",
{
detail:{
videoURL,
thumbnailURL
}
}
)

);

}catch(err){

console.error(err);

alert("Upload thất bại.");

progress.style.display="none";

postBtn.disabled=false;

postBtn.innerText="Đăng";

uploading=false;

}

});


// =====================
// Getter
// =====================

async function uploadCloudinary() {

    const video = window.uploadPreview.getVideo();
    const thumb = window.uploadPreview.getThumbnail();

    const videoURL = await uploadWithRetry(video, "video");
    const thumbnailURL = await uploadWithRetry(thumb, "image");

    return {
        videoURL,
        thumbnailURL
    };
}
console.log("upload-cloudinary 3B loaded");
// ===============================
// upload-cloudinary.js
// PHẦN 3C
// Retry + Timeout
// ===============================

const MAX_RETRY = 3;
const TIMEOUT = 120000; //120s

async function uploadWithRetry(file,type){

    let lastError;

    for(let i=1;i<=MAX_RETRY;i++){

        try{

            const url = await uploadWithTimeout(file,type);

            return url;

        }catch(err){

            lastError = err;

            console.warn(
                "Retry",
                i,
                err
            );

            await new Promise(r=>setTimeout(r,1000));

        }

    }

    throw lastError;

}

function uploadWithTimeout(file,type){

    return new Promise((resolve,reject)=>{

        const timer = setTimeout(()=>{

            reject("Upload timeout");

        },TIMEOUT);

        uploadFile(file,type)

        .then(url=>{

            clearTimeout(timer);

            resolve(url);

        })

        .catch(err=>{

            clearTimeout(timer);

            reject(err);

        });

    });

}


// =====================
// Thay Promise.all cũ
// bằng đoạn này
// =====================

async function uploadCloudinary(){

    const video =
        window.uploadPreview.getVideo();

    const thumb =
        window.uploadPreview.getThumbnail();

    const result =
        await Promise.all([

            uploadWithRetry(
                video,
                "video"
            ),

            uploadWithRetry(
                thumb,
                "image"
            )

        ]);

    videoURL = result[0];

    thumbnailURL = result[1];

    return{

        videoURL,

        thumbnailURL

    };

}

console.log("upload-cloudinary 3C loaded");
// ===============================
// upload-cloudinary.js
// PHẦN 3D
// ===============================

document.addEventListener(
"cloudinary-success",
(e)=>{

    progress.style.display = "none";

    setProgress(100);

    postBtn.disabled = false;

    postBtn.innerText = "Đăng";

    uploading = false;

    console.log("Upload hoàn tất");

});

function resetUploadState(){

    videoURL = "";

    thumbnailURL = "";

    uploading = false;

    progress.style.display = "none";

    setProgress(0);

    postBtn.disabled = false;

    postBtn.innerText = "Đăng";

}

window.uploadCloudinary = {

    getVideoURL(){

        return videoURL;

    },

    getThumbnailURL(){

        return thumbnailURL;

    },

    reset(){

        resetUploadState();

    }

};


// Khi popup đóng thì reset

if(window.uploadUI){

    const oldClose = window.uploadUI.close;

    window.uploadUI.close = function(){

        resetUploadState();

        oldClose();

    };

}

console.log("upload-cloudinary loaded");
