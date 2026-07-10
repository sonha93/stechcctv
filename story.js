// ================================
// STORY JS FIREBASE V8
// ================================

import { db, auth } from "./firebase-init.js";


// CLOUDINARY
const CLOUDINARY_URL =
"https://api.cloudinary.com/v1_1/dmz9gpp1b/video/upload";

const UPLOAD_PRESET =
"stech_up";



// ================================
// UPLOAD STORY
// ================================

window.uploadStory = async function(file){


const user = auth.currentUser;

if(!user || !file)
return;



try{


const form = new FormData();


form.append(
"file",
file
);


form.append(
"upload_preset",
UPLOAD_PRESET
);



const upload =
await fetch(
CLOUDINARY_URL,
{
method:"POST",
body:form
}
);



const data = await upload.json();

console.log("Cloudinary story:", data);


if(!data.secure_url){

    console.error(
        "Cloudinary lỗi:",
        data
    );

    alert(
        data.error?.message ||
        "Upload ảnh thất bại"
    );

    return;

}


const now =
firebase.firestore.Timestamp.now();



const expire =
new Date();


expire.setHours(
expire.getHours()+24
);



await db
.collection("stories")
.add({

uid:user.uid,

video:data.secure_url,

createdAt:now,

expiresAt:
firebase.firestore.Timestamp.fromDate(expire)

});



alert("Đã đăng story");


}catch(e){

console.error(
"Upload story lỗi",
e
);

}

};



// ================================
// OPEN STORY
// ================================
window.openStory = async function(id){

    const doc = await db.collection("stories").doc(id).get();

    if(!doc.exists){
        alert("Không tìm thấy story");
        return;
    }

    const story = doc.data();
    const userSnap = await db
    .collection("users")
    .doc(story.uid)
    .get();

const storyUser = userSnap.exists
    ? userSnap.data()
    : {};
    const user = auth.currentUser;

    const box = document.createElement("div");
    box.className = "story-popup";

   box.innerHTML = `
<div class="story-top">

    <div class="story-progress">
        <div class="story-progress-bar"></div>
    </div>

    <div class="story-header">

        <div class="story-user">

            <img src="${storyUser.avatar || storyUser.photoURL || "./avatar.png"}">
            <div>

                <div class="story-name">
                    ${storyUser.name || storyUser.displayName || "Người dùng"}
                </div>

                <div class="story-time">
                    Vừa xong
                </div>

            </div>

        </div>

        <div class="story-actions">

            <button id="closeStory">
                ✕
            </button>

            <button id="storyMenu">
                ⋯
            </button>

        </div>

    </div>

</div>

<video
src="${story.video}"
autoplay
playsinline>
</video>
`;

    document.body.appendChild(box);

// Nút X
document.getElementById("closeStory").onclick = () => {

    box.remove();

};

// Nút ...
document.getElementById("storyMenu").onclick = () => {

    alert("Menu");

};

// Chỉ bấm ra nền mới đóng
box.onclick = (e) => {

    if (e.target === box) {

        box.remove();

    }

};

// Không đóng khi bấm thanh trên
document.querySelector(".story-top").onclick = (e) => {

    e.stopPropagation();

};
    document.getElementById("closeStory").onclick = (e)=>{

    e.stopPropagation();
    box.remove();

};

document.getElementById("storyMenu").onclick = async (e)=>{

    e.stopPropagation();

    if(confirm("Xóa story này?")){

        await db.collection("stories")
            .doc(id)
            .delete();

        box.remove();

        loadStories();

    }

};
// ================================
// CLICK ĐĂNG TIN
// ================================

const myStoryBtn =
document.getElementById("myStoryBtn");

const storyInput =
document.getElementById("storyInput");


if(myStoryBtn && storyInput){


    myStoryBtn.onclick = ()=>{

        storyInput.click();

    };


    storyInput.onchange = ()=>{

        const file =
        storyInput.files[0];


        if(file){

            uploadStory(file);

        }

    };

}
// ================================
// LOAD STORY BAR
// ================================

async function loadStories(){

const bar =
document.getElementById("storyBar");

if(!bar) return;





// XÓA STORY CŨ, GIỮ LẠI NÚT ĐĂNG
bar.querySelectorAll(".story-item:not(.add-story)")
.forEach(el => el.remove());


const snap =
await db.collection("stories")
.get();


snap.forEach(doc=>{

const s = doc.data();


let expireTime = null;


if(s.expiresAt?.toDate){

    expireTime = s.expiresAt.toDate();

}
else{

    expireTime = new Date(
        s.expiresAt
    );

}


if(expireTime < new Date()){

    return;

}


const item =
document.createElement("div");


item.className =
"story-item";


item.innerHTML = `

<div class="story-avatar">

<video
src="${s.video}"
muted
></video>

</div>

<span>
Story
</span>

`;


item.onclick=()=>{

openStory(doc.id);

};


bar.appendChild(item);


});


}



auth.onAuthStateChanged(user=>{

if(user){

loadStories();

}

});
