// ================================
// STORY JS FIREBASE V8
// ================================
import { getVerifiedBadge } from "./verified-users.js";
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



await db.collection("stories").add({

uid:user.uid,

video:data.secure_url,

likes: [],

createdAt:now,

expiresAt: firebase.firestore.Timestamp.fromDate(expire)

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
 console.log("OPEN UID:", uid);

    const userSnap = await db
        .collection("users")
        .doc(uid)
        .get();

    const storyUser = userSnap.exists
    ? userSnap.data()
    : {};

let displayName =
    storyUser.name ||
    storyUser.displayName ||
    "Người dùng";

if (auth.currentUser) {

    const nickSnap = await db
        .collection("users")
        .doc(auth.currentUser.uid)
        .collection("nicknames")
        .doc(uid)
        .get();

    if (nickSnap.exists) {
        displayName = nickSnap.data().nickname;
    }

}

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

    markStorySeen(s.id);
showViewerFly();
        box.innerHTML=`

<div class="story-top">

<div class="story-progress">

${stories.map((x,i)=>`
<div class="story-progress-item">

<div
class="story-progress-fill"
id="progress-${i}"
style="width:${i<index?100:0}%;transition:none;">
</div>

</div>
`).join("")}

</div>

<div class="story-header">

<div class="story-user">

<img src="${storyUser.avatar || storyUser.photoURL || "./avatar.png"}">

<div>

<div class="story-name">${displayName}${getVerifiedBadge(uid)}</div>
<div class="story-time">

${formatStoryTime(s.createdAt)}

</div>

</div>

</div>

<div class="story-actions">

    <button id="storyMenu">⋯</button>

    <button id="closeStory">✕</button>

</div>

</div>

</div>

<div class="story-touch left" id="storyPrev"></div>

<video id="storyVideo"
src="${s.video}"
autoplay
playsinline>
</video>

<div class="story-touch right" id="storyNext"></div>

<div class="story-bottom">

 <div class="story-bottom">

    ${
    auth.currentUser?.uid !== uid
    ?
    `
    <div class="story-reply">
        <input
            id="storyComment"
            type="text"
            placeholder="Gửi tin nhắn">
    </div>
    `
    :
    ""
    }

    <div class="story-bottom-actions">

        <button id="storyLikeBtn" class="story-icon">
            <i class="fa-regular fa-heart"></i>
        </button>


        ${
        auth.currentUser?.uid !== uid
        ?
        `
        <button id="storySendBtn" class="story-icon">
            <i class="fa-regular fa-paper-plane"></i>
        </button>
        `
        :
        ""
        }

    </div>

</div>
`;

        const video = box.querySelector("#storyVideo");
        const fills =
box.querySelectorAll(".story-progress-fill");

fills.forEach((fill,i)=>{

    if(i<index){

        fill.style.width="100%";

    }else{

        fill.style.width="0%";

    }

});
       video.onloadedmetadata = ()=>{

    const fill =
    fills[index];

    fill.style.transition="none";
    fill.style.width="0%";

    requestAnimationFrame(()=>{

        fill.style.transition=
        `width ${video.duration}s linear`;

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
     const likeBtn = box.querySelector("#storyLikeBtn");
  const me = auth.currentUser;

let liked =
me &&
Array.isArray(s.likes) &&
s.likes.includes(me.uid);

likeBtn.innerHTML = liked
? '<i class="fa-solid fa-heart" style="color:#ff3040"></i>'
: '<i class="fa-regular fa-heart"></i>';
const sendBtn = box.querySelector("#storySendBtn");
const comment = box.querySelector("#storyComment");

if(sendBtn && comment){

sendBtn.onclick = async () => {

    const text = comment.value.trim();

    if (!text) return;

    const me = auth.currentUser;

    if (!me) return;

    // giữ nguyên toàn bộ code gửi story reply bên dưới
};

}


likeBtn.onclick = async () => {

    liked = !liked;

    likeBtn.innerHTML = liked
        ? '<i class="fa-solid fa-heart" style="color:#ff3040"></i>'
        : '<i class="fa-regular fa-heart"></i>';

    await db
        .collection("stories")
        .doc(s.id)
        .update({

            likes: liked
            ? firebase.firestore.FieldValue.arrayUnion(me.uid)
            : firebase.firestore.FieldValue.arrayRemove(me.uid)

        });

};

sendBtn.onclick = async () => {

    const text = comment.value.trim();

    if (!text) return;

    const me = auth.currentUser;

    if (!me) return;

    let conversationId = null;

    // tìm conversation đã có
    const convSnap = await db
        .collection("conversations")
        .where("members", "array-contains", me.uid)
        .get();

    convSnap.forEach(doc => {

        const data = doc.data();

        if (
            data.members &&
            data.members.includes(uid)
        ) {
            conversationId = doc.id;
        }

    });

    // chưa có thì tạo
    if (!conversationId) {

        const ref = await db
            .collection("conversations")
            .add({

                members: [
                    me.uid,
                    uid
                ],

                createdAt: firebase.firestore.FieldValue.serverTimestamp(),

                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),

                lastMessage: "",

                unread: {}

            });

        conversationId = ref.id;
    }

    const now = firebase.firestore.Timestamp.now();

    // gửi tin nhắn
   await db
.collection("conversations")
.doc(conversationId)
.collection("messages")
.add({

    senderId: me.uid,

    text: text,

    image: "",

    images: [],

    video: s.video,

    storyId: s.id,

    storyOwner: uid,

    storyOwnerId: uid,

    type: "story_reply",

    createdAt: now,

    seenBy:[me.uid]

});
// ================================
// STORY REPLY NOTIFICATION
// ================================

await db.collection("notifications").add({

    uid: uid,                 // người nhận (chủ story)

    fromUid: me.uid,          // người trả lời

    type: "story_reply",

    storyId: s.id,

    conversationId: conversationId,

    message: text,

    seen:false,

    createdAt: now

});
    // cập nhật conversation
    await db
        .collection("conversations")
        .doc(conversationId)
        .update({

            lastMessage: text,

            updatedAt: now,

            [`unread.${uid}`]:
                firebase.firestore.FieldValue.increment(1)

        });

    comment.value = "";

};
        const prevBtn = box.querySelector("#storyPrev");

if(prevBtn){

    prevBtn.onclick = () => {

        if(index > 0){

            index--;

            render();

        }

    };

}

box.querySelector("#storyNext").onclick = () => {

    if(index < stories.length - 1){

        index++;

        render();

    }else{

        box.remove();

    }

};
       const closeBtn = box.querySelector("#closeStory");

if(closeBtn){

    closeBtn.onclick = ()=>{

        box.remove();

    };

}
        const menuBtn = box.querySelector("#storyMenu");

if (menuBtn && auth.currentUser?.uid === uid) {

    menuBtn.onclick = async () => {

        if (!confirm("Xóa story này?")) return;

       await db.collection("stories")
.doc(s.id)
.delete();

        box.remove();

        loadStories();

    };

} else if (menuBtn) {

    menuBtn.style.display = "none";

}  
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
function getStoryShortName(name){

    if(!name) return "Story";

    const words = name.trim().split(/\s+/);

    if(words.length === 1){
        return words[0];
    }

    if(words.length <= 3){
        return words[words.length - 1];
    }

    return `${words[0]} ${words[words.length - 2]} ${words[words.length - 1]}...`;

}
// ================================
// LOAD STORY BAR
// ================================

async function loadStories(){

const bar =
document.getElementById("storyBar");

if(!bar) return;


const currentUser = auth.currentUser;

if(!currentUser) return;


const friendIds = {};

const followingSnap = await db
    .collection("users")
    .doc(currentUser.uid)
    .collection("following")
    .get();

followingSnap.forEach(doc => {
    friendIds[doc.id] = true;
});

// luôn cho phép xem story của chính mình
friendIds[currentUser.uid] = true;
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
.orderBy("createdAt","desc")
.get();
const showed = {};

for (const doc of snap.docs) {

    const s = doc.data();
// Không phải bạn bè thì bỏ qua
if (!friendIds[s.uid]) {
    continue;
}
    // ===========================
    // STORY HẾT 24H -> XÓA LUÔN
    // ===========================
    const expireTime = s.expiresAt?.toDate
        ? s.expiresAt.toDate()
        : new Date(s.expiresAt);

    if (expireTime <= new Date()) {

        try{

            await db
                .collection("stories")
                .doc(doc.id)
                .delete();

            console.log("Đã xóa story hết hạn:", doc.id);

        }catch(err){

            console.error("Xóa story lỗi:", err);

        }

        continue;
    }

    const userSnap = await db
        .collection("users")
        .doc(s.uid)
        .get();

    const storyUser = userSnap.exists
        ? userSnap.data()
        : {};

    const shortName = getStoryShortName(
        storyUser.name ||
        storyUser.displayName ||
        ""
    );

    if (showed[s.uid]) continue;
    showed[s.uid] = true;

   const item = document.createElement("div");


// kiểm tra đã xem chưa
let seen = false;


// lấy tất cả story của user này
const userStoriesSnap = await db
.collection("stories")
.where("uid","==",s.uid)
.get();


let hasUnseen = false;


for(const storyDoc of userStoriesSnap.docs){


    const viewerSnap = await db
    .collection("stories")
    .doc(storyDoc.id)
    .collection("viewers")
    .doc(currentUser.uid)
    .get();


    if(!viewerSnap.exists){

        hasUnseen = true;
        break;

    }

}


seen = !hasUnseen;


item.className =
seen
? "story-item story-seen"
: "story-item story-unseen";

    item.innerHTML = `
        <div class="story-avatar">
            <video
                src="${s.video}"
                muted
                autoplay
                loop
                playsinline
                preload="metadata">
            </video>
        </div>

        <span>${shortName}</span>
    `;

    item.onclick = () => openStory(s.uid);

    bar.appendChild(item);

}






}


// ================================
// MARK STORY SEEN
// ================================
async function markStorySeen(storyId){

    const user = auth.currentUser;

    if(!user) return;

    await db
        .collection("stories")
        .doc(storyId)
        .collection("viewers")
        .doc(user.uid)
        .set({
            viewedAt: firebase.firestore.Timestamp.now()
        });

}
    .set({

        viewedAt:
        firebase.firestore.Timestamp.now()

    });

}
async function showViewerFly(){

    const user = auth.currentUser;

    if(!user) return;


    const userSnap = await db
    .collection("users")
    .doc(user.uid)
    .get();


    const data = userSnap.exists
    ? userSnap.data()
    : {};


    const avatar =
    data.avatar ||
    data.photoURL ||
    "./avatar.png";


    const el = document.createElement("div");

    el.className="story-viewer-fly";


    el.innerHTML=`
        <img src="${avatar}">
    `;


    const box =
    document.querySelector(".story-popup");


    if(box){

        box.appendChild(el);


        setTimeout(()=>{

            el.remove();

        },2000);

    }

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
