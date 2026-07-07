// ===============================
// FILE: upload-ui.js
// PHẦN 1
// ===============================

const uploadPopup =
document.getElementById("uploadPopup");

const openButton =
document.querySelector(".upload-nav");

const closeButton =
document.getElementById("closeUpload");

const postButton =
document.getElementById("postVideo");

const captionInput =
document.getElementById("uploadCaption");

const titleInput =
document.getElementById("uploadTitle");

const counter =
document.getElementById("captionCounter");

const body =
document.body;

window.uploadUI = {

    popup:uploadPopup,

    postBtn:postButton,

    caption:captionInput,

    title:titleInput,

    open,

    close

};

function open(){

    uploadPopup.style.display = "flex";

    body.style.overflow = "hidden";

    setTimeout(()=>{

        uploadPopup.classList.add("show");

    },10);

}

function close(){

    uploadPopup.classList.remove("show");

    setTimeout(()=>{

        uploadPopup.style.display = "none";

        body.style.overflow = "";

    },250);

}

console.log("upload-ui part1 loaded");
// ===============================
// FILE: upload-ui.js
// PHẦN 2
// ===============================

// Mở popup khi bấm nút +

if(openButton){

    openButton.addEventListener("click",(e)=>{

        e.preventDefault();

        open();

    });

}

// Đóng popup

if(closeButton){

    closeButton.addEventListener("click",()=>{

        close();

    });

}

// Nhấn ESC để đóng

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        close();

    }

});

// Click ra nền tối để đóng

uploadPopup.addEventListener("click",(e)=>{

    if(e.target===uploadPopup){

        close();

    }

});

// Không cho click bên trong bị đóng

const uploadContent =
document.querySelector(".upload-content");

if(uploadContent){

    uploadContent.addEventListener("click",(e)=>{

        e.stopPropagation();

    });

}

console.log("upload-ui part2 loaded");
// ===============================
// FILE: upload-ui.js
// PHẦN 3
// ===============================

const videoInput =
document.getElementById("uploadVideoInput");

const imageInput =
document.getElementById("uploadImageInput");

const videoName =
document.getElementById("videoFileName");

const imageName =
document.getElementById("imageFileName");

// Ban đầu chưa được đăng

postButton.disabled = true;

postButton.style.opacity = ".5";

// Đếm ký tự mô tả

if(captionInput){

    captionInput.addEventListener("input",()=>{

        counter.innerText =
        captionInput.value.length +
        " / 500";

    });

}

// Đếm ký tự tiêu đề

if(titleInput){

    titleInput.addEventListener("input",()=>{

        if(titleInput.value.length > 100){

            titleInput.value =
            titleInput.value.slice(0,100);

        }

    });

}

// Chọn video

videoInput.addEventListener("change",()=>{

    if(videoInput.files.length){

        videoName.innerText =
        "🎥 " +
        videoInput.files[0].name;

        postButton.disabled = false;

        postButton.style.opacity = "1";

    }else{

        videoName.innerText = "";

        postButton.disabled = true;

        postButton.style.opacity = ".5";

    }

});

// Chọn ảnh

imageInput.addEventListener("change",()=>{

    if(imageInput.files.length){

        imageName.innerText =
        "🖼️ " +
        imageInput.files[0].name;

    }else{

        imageName.innerText = "";

    }

});

console.log("upload-ui part3 loaded");
// ===============================
// FILE: upload-ui.js
// PHẦN 4
// ===============================

let uploading = false;

// Reset toàn bộ form
function resetUploadForm(){

    if(titleInput) titleInput.value = "";

    if(captionInput){
        captionInput.value = "";
        counter.innerText = "0 / 500";
    }

    if(videoInput) videoInput.value = "";

    if(imageInput) imageInput.value = "";

    if(videoName) videoName.innerText = "";

    if(imageName) imageName.innerText = "";

    const previewVideo =
    document.getElementById("uploadPreviewVideo");

    const previewImage =
    document.getElementById("uploadPreviewImage");

    const empty =
    document.getElementById("uploadEmpty");

    if(previewVideo){

        previewVideo.pause();

        previewVideo.removeAttribute("src");

        previewVideo.load();

        previewVideo.style.display = "none";

    }

    if(previewImage){

        previewImage.removeAttribute("src");

        previewImage.style.display = "none";

    }

    if(empty){

        empty.style.display = "block";

    }

    postButton.disabled = true;

    postButton.style.opacity = ".5";

    uploading = false;

}

// Đóng popup thì reset
const oldClose = close;

window.uploadUI.close = function(){

    oldClose();

    setTimeout(resetUploadForm,300);

};

// Nút Đăng
postButton.addEventListener("click",()=>{

    if(uploading) return;

    if(!videoInput.files.length){

        alert("Vui lòng chọn video.");

        return;

    }

    uploading = true;

    postButton.disabled = true;

    postButton.innerText = "Đang đăng...";

    // Gửi sự kiện để upload-cloudinary.js xử lý
    window.dispatchEvent(
        new CustomEvent("upload-start")
    );

});

// Hàm để upload-cloudinary.js gọi khi upload xong
window.finishUpload = function(){

    uploading = false;

    postButton.disabled = false;

    postButton.innerText = "Đăng";

    window.uploadUI.close();

};

console.log("upload-ui loaded");
