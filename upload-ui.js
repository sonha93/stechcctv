// ===============================
// upload-ui.js
// PHẦN 1A
// ===============================
const container =
document.getElementById("uploadContainer");
const uploadHTML = `
<div id="uploadPopup">

    <div id="uploadOverlay"></div>

    <div id="uploadPanel">

        <div class="uploadHeader">

            <button id="uploadClose">
                ✕
            </button>

            <div class="uploadTitle">
                Đăng video
            </div>

            <button id="uploadPost">
                Đăng
            </button>

        </div>

        <div class="uploadBody">

            <video
                id="uploadPreviewVideo"
                playsinline
                muted
                controls
                style="display:none;">
            </video>

            <img
                id="uploadPreviewImage"
                style="display:none;">

            <textarea
                id="uploadCaption"
                placeholder="Viết mô tả video..."></textarea>

        </div>

        <div class="uploadBottom">

            <input
                type="file"
                id="uploadVideoInput"
                accept="video/*"
                hidden>

            <input
                type="file"
                id="uploadImageInput"
                accept="image/*"
                hidden>

            <button id="pickVideo">

                🎥 Chọn video

            </button>

            <button id="pickImage">

                🖼️ Ảnh bìa

            </button>

        </div>

    </div>

</div>
`;

document.body.insertAdjacentHTML(
    "beforeend",
    uploadHTML
);

const style = document.createElement("style");

style.textContent = `

#uploadPopup{

position:fixed;

left:0;
top:0;

width:100%;
height:100%;

display:none;

z-index:999999;

}

#uploadPopup.show{

display:block;

}

#uploadOverlay{

position:absolute;

left:0;
top:0;

width:100%;
height:100%;

background:rgba(0,0,0,.75);

backdrop-filter:blur(4px);

}

#uploadPanel{

position:absolute;

left:0;
bottom:-100%;

width:100%;
height:100%;

background:#111;

display:flex;

flex-direction:column;

transition:.35s;

}

#uploadPopup.show #uploadPanel{

bottom:0;

}

.uploadHeader{

height:60px;

display:flex;

align-items:center;

justify-content:space-between;

padding:0 18px;

border-bottom:1px solid rgba(255,255,255,.08);

}

.uploadHeader button{

border:none;

background:none;

color:#fff;

font-size:17px;

cursor:pointer;

}

.uploadTitle{

font-size:18px;

font-weight:bold;

color:#fff;

}

#uploadPost{

background:#fe2c55;

padding:8px 18px;

border-radius:30px;

}

.uploadBody{

flex:1;

overflow:auto;

padding:20px;

display:flex;

flex-direction:column;

gap:20px;

}

#uploadPreviewVideo{

width:100%;

border-radius:14px;

background:#000;

max-height:420px;

object-fit:contain;

}

#uploadPreviewImage{

width:140px;

height:180px;

border-radius:10px;

object-fit:cover;

border:2px solid #333;

}

#uploadCaption{

width:100%;

min-height:110px;

resize:none;

background:#1d1d1d;

border:none;

outline:none;

color:#fff;

padding:14px;

border-radius:12px;

font-size:15px;

}

.uploadBottom{

padding:18px;

display:flex;

gap:12px;

border-top:1px solid rgba(255,255,255,.08);

}

.uploadBottom button{

flex:1;

height:50px;

border:none;

border-radius:12px;

font-size:15px;

font-weight:bold;

cursor:pointer;

}

#pickVideo{

background:#25F4EE;

color:#000;

}

#pickImage{

background:#FE2C55;

color:#fff;

}

`;

document.head.appendChild(style);

const popup =
document.getElementById("uploadPopup");

const panel =
document.getElementById("uploadPanel");

const overlay =
document.getElementById("uploadOverlay");

const closeBtn =
document.getElementById("uploadClose");

const uploadBtn =
document.getElementById("uploadBtn");

const videoInput =
document.getElementById("uploadVideoInput");

const imageInput =
document.getElementById("uploadImageInput");

const pickVideo =
document.getElementById("pickVideo");

const pickImage =
document.getElementById("pickImage");

const previewVideo =
document.getElementById("uploadPreviewVideo");

const previewImage =
document.getElementById("uploadPreviewImage");

const caption =
document.getElementById("uploadCaption");
// ===============================
// upload-ui.js
// PHẦN 1B
// ===============================

// mở popup
function openUploadPopup(){

    popup.classList.add("show");

    document.body.style.overflow = "hidden";

}

// đóng popup
function closeUploadPopup(){

    popup.classList.remove("show");

    document.body.style.overflow = "";

    previewVideo.pause();

}

// nút +
if(uploadBtn){

    uploadBtn.onclick = function(e){

        e.preventDefault();

        openUploadPopup();

    };

}

// nút X
closeBtn.onclick = closeUploadPopup;

// bấm nền tối
overlay.onclick = closeUploadPopup;


// =====================
// Vuốt xuống để đóng
// =====================

let startY = 0;

let currentY = 0;

let dragging = false;

panel.addEventListener("touchstart",(e)=>{

    startY = e.touches[0].clientY;

    dragging = true;

    panel.style.transition = "none";

});

panel.addEventListener("touchmove",(e)=>{

    if(!dragging) return;

    currentY = e.touches[0].clientY;

    const dy = currentY - startY;

    if(dy <= 0) return;

    panel.style.transform =
        `translateY(${dy}px)`;

});

panel.addEventListener("touchend",()=>{

    dragging = false;

    panel.style.transition =
        ".25s";

    const dy = currentY - startY;

    if(dy > 140){

        panel.style.transform = "";

        closeUploadPopup();

    }else{

        panel.style.transform =
            "translateY(0px)";

    }

});


// =====================
// Chọn file
// =====================

pickVideo.onclick = ()=>{

    videoInput.click();

};

pickImage.onclick = ()=>{

    imageInput.click();

};


// =====================
// Export
// =====================

window.uploadUI = {

    popup,

    panel,

    overlay,

    videoInput,

    imageInput,

    previewVideo,

    previewImage,

    caption,

    open:openUploadPopup,

    close:closeUploadPopup

};


// ESC để đóng

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeUploadPopup();

    }

});


// reset khi đóng

popup.addEventListener("transitionend",()=>{

    if(!popup.classList.contains("show")){

        previewVideo.removeAttribute("src");

        previewVideo.load();

        previewVideo.style.display="none";

        previewImage.src="";

        previewImage.style.display="none";

        caption.value="";

        videoInput.value="";

        imageInput.value="";

    }

});

console.log("upload-ui loaded");
