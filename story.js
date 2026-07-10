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
window.openStory = async function(uid){


    const userSnap = await db
        .collection("users")
        .doc(uid)
        .get();

    const storyUser = userSnap.exists
        ? userSnap.data()
        : {};

    const snap = await db
        .collection("stories")
        .where("uid","==",uid)
        .orderBy("createdAt","asc")
        .get();

    if(snap.empty){
        alert("Không có story");
        return;
    }

    const stories = snap.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
    }));

    let index = 0;

    const box = document.createElement("div");
    box.className="story-popup";

    document.body.appendChild(box);

    function render(){

        const s = stories[index];

        box.innerHTML=`

<div class="story-top">

<div class="story-progress">

${stories.map((x,i)=>`
<div class="story-progress-item">

<div class="story-progress-fill"
style="width:${i<index?100:0}%">
</div>

</div>
`).join("")}

</div>

<div class="story-header">

<div class="story-user">

<img src="${storyUser.avatar || storyUser.photoURL || "./avatar.png"}">

<div>

<div class="story-name">

${storyUser.name || storyUser.displayName || "Người dùng"}

</div>

<div class="story-time">

${formatStoryTime(s.createdAt)}

</div>

</div>

</div>

<div class="story-actions">

<button id="closeStory">✕</button>

</div>

</div>

</div>

<video id="storyVideo"
src="${s.video}"
autoplay
playsinline>
</video>

`;

        const video = box.querySelector("#storyVideo");

        video.onloadedmetadata=()=>{

            const fill =
            box.querySelectorAll(".story-progress-fill")[index];

            fill.style.transition=
            `width ${video.duration}s linear`;

            requestAnimationFrame(()=>{
                fill.style.width="100%";
            });

        };

        video.onended=()=>{

            index++;

            if(index<stories.length){

                render();

            }else{

                box.remove();

            }

        };

        document.getElementById("closeStory").onclick=()=>{

            box.remove();

        };

        box.querySelector(".story-user").onclick=()=>{

            box.remove();

            location.href=
            `profile-review.html?uid=${uid}`;

        };

    }

    render();

}
    
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

const currentUser = auth.currentUser;

if(currentUser){

    const mySnap = await db
        .collection("users")
        .doc(currentUser.uid)
        .get();

    if(mySnap.exists){

        const me = mySnap.data();

        const addAvatar =
        bar.querySelector(".add-story img");

        if(addAvatar){

            addAvatar.src =
                me.avatar ||
                me.photoURL ||
                "./avatar.png";

        }

    }

}



// XÓA STORY CŨ, GIỮ LẠI NÚT ĐĂNG
bar.querySelectorAll(".story-item:not(.add-story)")
.forEach(el => el.remove());


const snap = await db
.collection("stories")
.get();

const docs = snap.docs.sort((a, b) => {
    const ta = a.data().createdAt?.seconds || 0;
    const tb = b.data().createdAt?.seconds || 0;
    return tb - ta;
});

const showed = {};

docs.forEach(doc => {

    const s = doc.data();

    if (showed[s.uid]) return;
    showed[s.uid] = true;

    const expireTime = s.expiresAt?.toDate
        ? s.expiresAt.toDate()
        : new Date(s.expiresAt);

    if (expireTime < new Date()) return;

    const item = document.createElement("div");
    item.className = "story-item";

    item.innerHTML = `
        <div class="story-avatar">
            <video src="${s.video}" muted></video>
        </div>
        <span>Story</span>
    `;

    item.onclick = () => openStory(s.uid);

    bar.appendChild(item);

});

   







}



auth.onAuthStateChanged(user=>{

if(user){

loadStories();

}

});
function formatStoryTime(time){

    if(!time) return "";

    const date = time.toDate ? time.toDate() : new Date(time);

    const diff = Math.floor((Date.now() - date.getTime()) / 1000);

    if(diff < 60) return "Vừa xong";

    if(diff < 3600) return Math.floor(diff/60) + " phút";

    if(diff < 86400) return Math.floor(diff/3600) + " giờ";

    return Math.floor(diff/86400) + " ngày";
}
