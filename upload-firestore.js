// ===============================
// upload-firestore.js
// PHẦN 4A
// ===============================

import { app } from "./auth.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

let saving = false;

// ===============================
// Cloudinary upload thành công
// ===============================

document.addEventListener(
"cloudinary-success",
async(e)=>{

    if(saving) return;

    saving = true;

    try{

        const user = auth.currentUser;

        if(!user){

            alert("Bạn chưa đăng nhập.");

            saving = false;

            return;

        }

        const profileSnap =
        await getDoc(
            doc(db,"users",user.uid)
        );

        const profile =
            profileSnap.exists()
            ? profileSnap.data()
            : {};

        const videoUrl =
            e.detail.videoURL;

        const thumbnail =
            e.detail.thumbnailURL;

        const caption =
            window.uploadUI.caption.value.trim();

        // Phần 4B sẽ lưu Firestore ở đây

    }catch(err){

        console.error(err);

        alert("Không thể lưu video.");

        saving = false;

    }
  

});

console.log("upload-firestore 4A loaded");
// ===============================
// upload-firestore.js
// PHẦN 4B
// ===============================

const videoDoc = {

    uid: user.uid,

    name:
        profile.name ||
        user.displayName ||
        "Người dùng",

    avatar:
        profile.avatar ||
        "https://i.ibb.co/Z1kv9nJj/logo.png",

    caption: caption,

    videoUrl: videoUrl,

    thumbnail: thumbnail,

    verified:
        profile.verified || false,

    createdAt:
        serverTimestamp(),

    viewCount:0,

    likeCount:0,

    commentCount:0,

    shareCount:0,

    saveCount:0,

    status:"public"

};

const docRef =
await addDoc(

    collection(db,"videos"),

    videoDoc

);

console.log(
    "Video ID:",
    docRef.id
);

// sang bước tiếp
document.dispatchEvent(

new CustomEvent(

"firestore-success",

{

detail:{

id:docRef.id,

...videoDoc

}

}

)

);
// ===============================
// upload-firestore.js
// PHẦN 4C
// ===============================

document.addEventListener(
"firestore-success",
(e)=>{

    const data = e.detail;

    // Đóng popup
    window.uploadUI.close();

    // Reset Cloudinary
    window.uploadCloudinary.reset();

    // Reset preview
    if(window.uploadPreview){

        const video =
            document.getElementById("uploadPreviewVideo");

        const image =
            document.getElementById("uploadPreviewImage");

        const videoInput =
            document.getElementById("uploadVideoInput");

        const imageInput =
            document.getElementById("uploadImageInput");

        if(video){

            video.pause();

            video.removeAttribute("src");

            video.load();

            video.style.display="none";

        }

        if(image){

            image.src="";

            image.style.display="none";

        }

        if(videoInput) videoInput.value="";

        if(imageInput) imageInput.value="";

    }

    // Reset caption
    window.uploadUI.caption.value="";

    // Thông báo
    if(window.showToast){

        showToast("🎉 Đăng video thành công");

    }else{

        alert("Đăng video thành công");

    }

    saving = false;

    // Thêm ngay vào feed
    if(typeof appendVideoToFeed==="function"){

        appendVideoToFeed({

            id:data.id,

            ...data

        });

    }

});

console.log("upload-firestore 4C loaded");
// ===============================
// upload-firestore.js
// PHẦN 4D
// ===============================

// Thêm video mới lên đầu feed
window.appendVideoToFeed = function(video){

    const feed = document.getElementById("feed");

    if(!feed) return;

    const html = `
    <div class="video-item">

        <video
            class="vid"
            src="${video.videoUrl}"
            poster="${video.thumbnail}"
            playsinline
            webkit-playsinline
            muted
            loop
            preload="metadata">
        </video>

        <div class="right-action">

            <div class="action">
                <div class="icon">❤️</div>
                <span>0</span>
            </div>

            <div class="action">
                <div class="icon">💬</div>
                <span>0</span>
            </div>

            <div class="action">
                <div class="icon">↗</div>
                <span>0</span>
            </div>

        </div>

        <div class="info">

            <div class="name">
                ${video.name}
            </div>

            <div class="desc">
                ${video.caption || ""}
            </div>

        </div>

    </div>
    `;

    feed.insertAdjacentHTML(
        "afterbegin",
        html
    );

    // Phát lại auto play
    if(typeof autoPlay==="function"){

        autoPlay();

    }

};

console.log(
    "upload-firestore loaded"
);
