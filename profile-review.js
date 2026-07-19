import { isBlocked } from "./block.js";
import { getVerifiedBadge } from "./verified-users.js";
import { app, auth } from "./auth.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    updateDoc,
    deleteDoc,
    setDoc,
     addDoc,
     serverTimestamp,
    increment,
     arrayUnion,
     writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
const db = getFirestore(app);

 import {
    followUser,
    unfollowUser,
    isFollowing
} from "./follow.js";
// ===== Lấy uid trên URL =====

const params = new URLSearchParams(location.search);

let profileUid = params.get("uid");

onAuthStateChanged(auth, user => {

    if (!profileUid && user) {

        location.replace(
            `profile-review.html?uid=${user.uid}`
        );

    }

});

// ===== HTML =====

const avatar = document.getElementById("profileAvatar");
let profileHasStory = false;
const avatarPopup = document.createElement("div");

avatarPopup.id = "avatarPopup";

avatarPopup.innerHTML = `
    <span id="closeAvatarPopup">&times;</span>
    <img id="popupAvatarImg">
`;

document.body.appendChild(avatarPopup);
const name = document.getElementById("profileName");

const username = document.getElementById("profileUsername");

const bio = document.getElementById("profileBio");

const followBtn = document.getElementById("followBtn");
const followSheet=document.getElementById("followSheet");
const sheetAvatar=document.getElementById("sheetAvatar");
const sheetName=document.getElementById("sheetName");
const closeFollowSheet=document.getElementById("closeFollowSheet");
const unfollowBtn=document.getElementById("unfollowBtn");
const editNickname = document.getElementById("editNickname");

const nicknameModal = document.getElementById("nicknameModal");
const nicknameInput = document.getElementById("nicknameInput");
const saveNickname = document.getElementById("saveNickname");
const cancelNickname = document.getElementById("cancelNickname");
const editBtn = document.getElementById("editBtn");
const messageBtn = document.getElementById("messageBtn");
const followingCount = document.getElementById("followingCount");

const followerCount = document.getElementById("followerCount");
// ===========================
// MỞ DANH SÁCH FOLLOW
// ===========================

followingCount.style.cursor = "pointer";
followerCount.style.cursor = "pointer";

followingCount.onclick = () => {

    openFollowPopup(profileUid,"following");

};

followerCount.onclick = () => {

    openFollowPopup(profileUid,"followers");

};
const likeCount = document.getElementById("likeCount");
const addStoryBtn = document.getElementById("addStoryBtn");

const storyFile = document.getElementById("storyFile");

const myStoryAvatar = document.getElementById("myStoryAvatar");
let selectedVideoId = null;
const storyMore = document.getElementById("storyMore");

let currentStoryId = null;
let currentStoryOwner = null;
// ===========================
// LOAD USER
// ===========================

async function loadProfile() {

    const snap = await getDoc(doc(db,"users",profileUid));

    if(!snap.exists()){

        alert("Không tìm thấy người dùng");

        return;

    }

    const u = snap.data();
    let blocked = false;

if(auth.currentUser){

    const block = await isBlocked(auth.currentUser.uid, profileUid);

    blocked = block.iBlocked || block.blockedMe;

}
  avatar.src = blocked
    ? "https://i.ibb.co/Z1kv9nJj/logo.png"
    : (u.avatar || "https://i.ibb.co/Z1kv9nJj/logo.png");


// CHECK STORY 24H CHO AVATAR
await checkProfileStory();
    sheetAvatar.src = avatar.src;
sheetName.textContent = u.name || "Người dùng";
let displayName = blocked
    ? "Người dùng"
    : (u.name || "Người dùng");

if(auth.currentUser){

    const nickSnap = await getDoc(
        doc(
            db,
            "users",
            auth.currentUser.uid,
            "nicknames",
            profileUid
        )
    );

    if(nickSnap.exists()){

        displayName = nickSnap.data().nickname;

    }

}

document.getElementById("profileName").innerHTML = `
    <span id="profileNameText">
        ${blocked ? "Người dùng" : (displayName || "Người dùng")}
    </span>
    ${blocked ? "" : getVerifiedBadge(profileUid)}
`;
sheetName.textContent = displayName;
   username.innerHTML = blocked
    ? "@nguoidung"
    : ("@" + (u.username || ""));

    bio.innerHTML = u.bio || "";
  // Hiển thị liên kết
const oldLink = document.getElementById("profileLink");
if(oldLink) oldLink.remove();

let links = "";

if(u.website)
links += `<a style="color:#0866ff;text-decoration:none;font-weight:600;" href="${u.website}" target="_blank">${u.website}</a><br>`;

if(u.facebook)
links += `<a style="color:#0866ff;text-decoration:none;font-weight:600;" href="${u.facebook}" target="_blank">${u.facebook}</a><br>`;

if(u.youtube)
links += `<a style="color:#0866ff;text-decoration:none;font-weight:600;" href="${u.youtube}" target="_blank">${u.youtube}</a><br>`;

if(u.tiktok)
links += `<a style="color:#0866ff;text-decoration:none;font-weight:600;" href="${u.tiktok}" target="_blank">${u.tiktok}</a><br>`;

if(u.zalo)
links += `<a style="color:#0866ff;text-decoration:none;font-weight:600;" href="${u.zalo}" target="_blank">${u.zalo}</a><br>`;



if(links){

bio.insertAdjacentHTML(
"afterend",
`
<div id="profileLink"
style="
margin-top:10px;
text-align:center;
line-height:1.8;
">

${links}

</div>
`
);

}
if(blocked){

    bio.innerHTML = "";

    const oldLink = document.getElementById("profileLink");
    if(oldLink) oldLink.remove();

}
if(blocked){

    document.getElementById("videosGrid").style.display = "none";
    document.getElementById("storyBar").style.display = "none";

    likeCount.innerHTML = 0;
    followingCount.innerHTML = 0;
    followerCount.innerHTML = 0;

    messageBtn.style.display = "none";

    return;
}
   const followingSnap = await getDocs(
    collection(db,"users",profileUid,"following")
);

const followerSnap = await getDocs(
    collection(db,"users",profileUid,"followers")
);


followingCount.innerHTML = followingSnap.size;

followerCount.innerHTML = followerSnap.size;


    // ===== TÍNH TỔNG LIKE VIDEO =====

    let totalLike = 0;

    const q = query(

        collection(db,"videos"),

        where("uid","==",profileUid)

    );

    const videoSnap = await getDocs(q);

    videoSnap.forEach(d=>{

        totalLike += d.data().likeCount || 0;

    });

    likeCount.innerHTML = totalLike;

}

loadProfile();


// ===========================
// HIỆN FOLLOW / EDIT
// ===========================

onAuthStateChanged(auth, async (user) => {
if(user){

    const me = await getDoc(doc(db,"users",user.uid));

    if(me.exists()){

        myStoryAvatar.src =
            me.data().avatar ||
            "https://i.ibb.co/Z1kv9nJj/logo.png";

    }

}
    const isOwner = user && user.uid === profileUid;
const addStory = document.getElementById("addStoryBtn");

if(addStory){

    addStory.style.display = isOwner ? "" : "none";

}
   if (isOwner) {

    followBtn.style.display = "none";
    editBtn.style.display = "block";

    // Ẩn nhắn tin khi xem chính mình
    messageBtn.style.display = "none";

} else {

    followBtn.style.display = "block";
    editBtn.style.display = "none";

    // Hiện nhắn tin khi xem người khác
    messageBtn.style.display = "block";

}

    document.querySelector('[data-tab="private"]').style.display = isOwner ? "" : "none";
    document.querySelector('[data-tab="liked"]').style.display   = isOwner ? "" : "none";
    document.querySelector('[data-tab="saved"]').style.display   = isOwner ? "" : "none";

  if (user && !isOwner) {

    updateFollowButton();

}

});

async function updateFollowButton(){

    const following = await isFollowing(profileUid);


    if(following){

        followBtn.innerHTML = "⚙";

        followBtn.dataset.state = "following";


    }else{

        followBtn.innerHTML = "Follow";

        followBtn.dataset.state = "follow";

    }

}



followBtn.onclick = async()=>{


    if(!auth.currentUser){

        alert("Bạn cần đăng nhập");

        return;

    }


    if(followBtn.dataset.state === "following"){


        followSheet.classList.add("active");


        return;

    }



    try{


        followBtn.disabled = true;


        await followUser(profileUid);


        await updateFollowButton();



    }catch(e){

        console.error(e);

        alert("Có lỗi xảy ra");

    }



    followBtn.disabled = false;


};
messageBtn.onclick = async () => {

    if (!auth.currentUser) {
        alert("Bạn cần đăng nhập");
        return;
    }

    const myUid = auth.currentUser.uid;

    if (myUid === profileUid) return;

    const snap = await getDocs(
        query(
            collection(db, "conversations"),
            where("members", "array-contains", myUid)
        )
    );

    let conversationId = null;

    snap.forEach(docSnap => {
        const data = docSnap.data();

        if (data.members.includes(profileUid)) {
            conversationId = docSnap.id;
        }
    });

    if (!conversationId) {

        const ref = await addDoc(
            collection(db, "conversations"),
            {
                members: [myUid, profileUid],
                name: document.getElementById("profileNameText").innerText,
                avatar: avatar.src,
                lastMessage: "",
                updatedAt: serverTimestamp()
            }
        );

        conversationId = ref.id;
    }

    location.href = `message.html?id=${conversationId}`;

};
// ===========================
// BACK
// ===========================

document
.getElementById("backBtn")
.onclick=()=>history.back();
// ==========================
// SETTINGS PAGE
// ==========================

const menuBtn = document.getElementById("menuBtn");
const settingsPage = document.getElementById("settingsPage");
const closeSettings = document.getElementById("closeSettings");

menuBtn.onclick = () => {
    settingsPage.classList.add("active");
    document.body.style.overflow = "hidden";
};

closeSettings.onclick = () => {
    settingsPage.classList.remove("active");
    document.body.style.overflow = "";
};
// ===========================
// TAB
// ===========================

const tabs = document.querySelectorAll(".tab");

const grid = document.getElementById("videosGrid");
const videoMenu = document.getElementById("videoMenu");

const privacyBtn = document.getElementById("privacyBtn");

const commentBtn = document.getElementById("commentBtn");

const deleteBtn = document.getElementById("deleteBtn");

const cancelBtn = document.getElementById("cancelBtn");
tabs.forEach(tab=>{

    tab.onclick=()=>{

        tabs.forEach(t=>t.classList.remove("active"));

        tab.classList.add("active");

        loadTab(tab.dataset.tab);

    };

});


// ===========================
// LOAD TAB
// ===========================

async function loadTab(type){

    grid.innerHTML="";
let blocked = false;

if(auth.currentUser){
    const block = await isBlocked(auth.currentUser.uid, profileUid);
    blocked = block.iBlocked || block.blockedMe;
}

if(blocked){
    grid.innerHTML = "";
    grid.style.display = "none";
    return;
}

grid.style.display = "";
    // --------------------
    // VIDEO CÔNG KHAI
    // --------------------

    if(type==="videos"){

        const q=query(

            collection(db,"videos"),

            where("uid","==",profileUid),
where("status","==","public")

        );

        const snap=await getDocs(q);

snap.forEach(doc => {
   
});
        renderVideos(snap);

    }

    // --------------------
    // VIDEO RIÊNG TƯ
    // --------------------

    if(type==="private"){

        if(!auth.currentUser) return;

        if(auth.currentUser.uid!==profileUid){

            grid.innerHTML="<p style='padding:40px;text-align:center'>Không có quyền xem.</p>";

            return;

        }

        const q=query(

            collection(db,"videos"),

            where("uid","==",profileUid),

          where("status","==","private")

        );

        const snap=await getDocs(q);

        renderVideos(snap);

    }

    // --------------------
    // VIDEO ĐÃ THÍCH
    // --------------------

    if(type==="liked"){

        const likeSnap=await getDocs(

            collection(db,"users",profileUid,"likes")

        );

        for(const item of likeSnap.docs){

            const video=await getDoc(

                doc(db,"videos",item.id)

            );

            if(video.exists()){

                renderOne(video);

            }

        }

    }

    // --------------------
    // VIDEO ĐÃ LƯU
    // --------------------

    if(type==="saved"){

        const saveSnap=await getDocs(

            collection(db,"users",profileUid,"saved")

        );

        for(const item of saveSnap.docs){

            const video=await getDoc(

                doc(db,"videos",item.id)

            );

            if(video.exists()){

                renderOne(video);

            }

    }

}

if(type==="orders"){

    if(!auth.currentUser) return;

    if(auth.currentUser.uid!==profileUid){
        grid.innerHTML =
        "<p style='padding:40px;text-align:center'>Không có quyền xem.</p>";
        return;
    }

    grid.innerHTML = "";
    const block = auth.currentUser
    ? await isBlocked(auth.currentUser.uid, profileUid)
    : { iBlocked:false, blockedMe:false };

if(block.iBlocked || block.blockedMe){
    return;
}
    const snap = await getDocs(
        query(
            collection(db,"orders"),
            where("uid","==",profileUid)
        )
    );
   
snap.forEach(docSnap => {

    const o = docSnap.data();

    const item = o.items?.[0] || {};

    const image =
        item.image ||
        item.images?.[0] ||
        item.thumbnail ||
        item.photo ||
        item.img ||
        "";

    grid.innerHTML += `
        <div class="video-card"
        onclick="location.href='order-detail.html?id=${docSnap.id}'">

            <img
                src="${image || 'https://i.ibb.co/Z1kv9nJj/logo.png'}"
                loading="lazy">

            <div class="play-count">
                ${o.status || "Đơn hàng"}
            </div>

        </div>
    `;

});

}
 }

// ===========================
// HIỂN THỊ DANH SÁCH
// ===========================

function renderVideos(snap){

for(const docSnap of snap.docs){

        renderOne(docSnap);

}

}

// ===========================
// 1 VIDEO
// ===========================

function renderOne(docSnap){

    const v = docSnap.data();

    const ownerUid = v.uid;

    grid.innerHTML += `

<div class="video-card"

onclick="location.href='review.html?uid=${ownerUid}&video=${docSnap.id}'"

${auth.currentUser && auth.currentUser.uid===ownerUid
? `oncontextmenu="openVideoMenu('${docSnap.id}');return false;"`
: ""}

>

<img
src="${v.thumbnail || ''}"
loading="lazy">

<div class="play-count">
▶ ${v.viewCount || 0}
</div>

</div>

`;

}
window.openVideoMenu = async function(videoId){

    selectedVideoId = videoId;

    const snap = await getDoc(doc(db,"videos",videoId));

    if(snap.exists()){

        const v = snap.data();

        commentBtn.querySelector(".left span:last-child").textContent =
            v.commentEnabled === false
            ? "Bật bình luận"
            : "Tắt bình luận";
    }

    videoMenu.classList.add("active");

};

cancelBtn.onclick = function(){

    videoMenu.classList.remove("active");

};

videoMenu.onclick = (e)=>{

    if(e.target===videoMenu){

        videoMenu.classList.remove("active");

    }

};
privacyBtn.onclick = async function(){

    if(!selectedVideoId) return;

    const ref = doc(db,"videos",selectedVideoId);

    const snap = await getDoc(ref);

    if(!snap.exists()) return;

   const current = snap.data().status || "public";

await updateDoc(ref,{
    status: current === "public"
        ? "private"
        : "public"
});
    videoMenu.classList.remove("active");

    loadTab("videos");
loadStories();
};
commentBtn.onclick = async function(){

    if(!selectedVideoId) return;

    const ref = doc(db,"videos",selectedVideoId);

    const snap = await getDoc(ref);

    if(!snap.exists()) return;

    const enable = snap.data().commentEnabled !== false;

    await updateDoc(ref,{
        commentEnabled: !enable
    });

    videoMenu.classList.remove("active");

};
deleteBtn.onclick = async function(){

    if(!selectedVideoId) return;

    if(!confirm("Bạn có chắc muốn xóa video này?")) return;

    await deleteDoc(
        doc(db,"videos",selectedVideoId)
    );

    videoMenu.classList.remove("active");

    loadTab("videos");

};
// ===========================
// LOAD MẶC ĐỊNH
// ===========================

(async()=>{

    let blocked = false;

    if(auth.currentUser){

        const block = await isBlocked(auth.currentUser.uid, profileUid);

        blocked = block.iBlocked || block.blockedMe;

    }

    if(!blocked){

        loadTab("videos");
        loadStories();

    }else{

        document.getElementById("videosGrid").style.display = "none";
        document.getElementById("storyBar").style.display = "none";

    }

})();
// ==========================
// MỞ TRANG SỬA HỒ SƠ
// ==========================

if (editBtn) {
    editBtn.onclick = () => {
        location.href = "edit-profile.html";
    };
}
avatar.style.cursor = "pointer";

avatar.onclick = async () => {

    const q = query(
        collection(db,"profile_stories"),
        where("uid","==",profileUid)
    );

    const snap = await getDocs(q);

    let storyId = null;

    const now = Date.now();

    snap.forEach(docSnap=>{

        const s = docSnap.data();

        if(s.createdAt){

            const time = s.createdAt.toDate().getTime();

            if(now - time < 86400000){

                storyId = docSnap.id;

            }

        }

    });


    if(storyId){

        openStory(storyId);

    }else{

        document.getElementById("popupAvatarImg").src = avatar.src;
        avatarPopup.classList.add("active");

    }

};

document.getElementById("closeAvatarPopup").onclick = () => {
    avatarPopup.classList.remove("active");
};

avatarPopup.onclick = (e) => {
    if (e.target === avatarPopup) {
        avatarPopup.classList.remove("active");
    }
};

document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        avatarPopup.classList.remove("active");
    }
});
cancelNickname.onclick = () => {

    nicknameModal.classList.remove("active");

};

nicknameModal.onclick = e => {

    if (e.target === nicknameModal) {

        nicknameModal.classList.remove("active");

    }

};
saveNickname.onclick = async () => {

    const value = nicknameInput.value.trim();

    const ref = doc(
        db,
        "users",
        auth.currentUser.uid,
        "nicknames",
        profileUid
    );
      const profileNameText = document.getElementById("profileNameText");
    // Nếu xóa hết chữ -> xóa biệt danh
    if(value === ""){

        await deleteDoc(ref);

        // Hiện lại tên gốc
        const userSnap = await getDoc(
            doc(db,"users",profileUid)
        );

        profileNameText.innerText =
            userSnap.data().name || "Người dùng";

    }else{

        await setDoc(ref,{
    nickname: value
});

        profileNameText.innerText = value;

    }

    nicknameModal.classList.remove("active");

};
closeFollowSheet.onclick=()=>{
followSheet.classList.remove("active");
};

followSheet.onclick=e=>{
if(e.target===followSheet){
followSheet.classList.remove("active");
}
};
editNickname.onclick = async () => {

    nicknameModal.classList.add("active");

    nicknameInput.value = "";

    const snap = await getDoc(
        doc(
            db,
            "users",
            auth.currentUser.uid,
            "nicknames",
            profileUid
        )
    );

    if (snap.exists()) {
       nicknameInput.value =
    snap.data().nickname || "";
    }

    setTimeout(() => {
        nicknameInput.focus();
    }, 100);

};
unfollowBtn.onclick = async () => {

    await unfollowUser(profileUid);

    followSheet.classList.remove("active");

    await updateFollowButton();

};
addStoryBtn.onclick = ()=>{

    if(!auth.currentUser){

        alert("Bạn cần đăng nhập");

        return;

    }

    storyFile.click();

};
storyFile.onchange = async () => {

    const file = storyFile.files[0];

    if(!file) return;

    if(!auth.currentUser){
        alert("Bạn cần đăng nhập");
        return;
    }

    const uid = auth.currentUser.uid;

    const userSnap = await getDoc(doc(db,"users",uid));

    if(!userSnap.exists()) return;

    const user = userSnap.data();

    const formData = new FormData();

    formData.append("file", file);

    // TÊN UPLOAD PRESET CỦA MÀY
    formData.append("upload_preset","stech_up");

    const uploadUrl =
    file.type.startsWith("video/")
    ? "https://api.cloudinary.com/v1_1/dmz9gpp1b/video/upload"
    : "https://api.cloudinary.com/v1_1/dmz9gpp1b/image/upload";

    const res = await fetch(uploadUrl,{
        method:"POST",
        body:formData
    });

    const data = await res.json();

    console.log(data);

    if(!data.secure_url){

        alert(data.error?.message || "Upload thất bại");

        return;

    }

  await addDoc(collection(db,"profile_stories"),{

    uid: uid,

    media: data.secure_url,

    type: file.type.startsWith("video/")
        ? "video"
        : "image",

    hidden: false,

    text: prompt("Nhập nội dung story (có thể để trống):") || "",

    viewers: [],

    likeCount: 0,

    createdAt: serverTimestamp()

});

storyFile.value = "";

alert("Đăng story thành công");

loadStories();
await checkProfileStory();
};   
async function loadStories(){

    const storyBar = document.getElementById("storyBar");

    if(!storyBar) return;
storyBar.innerHTML = `
<div class="storyItem" id="addStoryBtn">

    <div class="storyAvatar mine">

        <img
        id="myStoryAvatar"
        src="${document.getElementById('profileAvatar')?.src || 'https://i.ibb.co/Z1kv9nJj/logo.png'}">

        <span class="storyPlus">+</span>

    </div>

    <div class="storyName">
        Story
    </div>

</div>
`;

document.getElementById("addStoryBtn").onclick = () => {

    if(!auth.currentUser){
        alert("Bạn cần đăng nhập");
        return;
    }

    storyFile.click();

};
const block = auth.currentUser
    ? await isBlocked(auth.currentUser.uid, profileUid)
    : { iBlocked:false, blockedMe:false };

if(block.iBlocked || block.blockedMe){
    return;
}
let blocked = false;

if(auth.currentUser){
    const block = await isBlocked(auth.currentUser.uid, profileUid);
    blocked = block.iBlocked || block.blockedMe;
}

if(blocked){
    storyBar.innerHTML = "";
    storyBar.style.display = "none";
    return;
}

storyBar.style.display = "";
    const snap = await getDocs(
        query(
           collection(db,"profile_stories"),
            where("uid","==",profileUid)
        )
    );

    for (const docSnap of snap.docs) {

       const s = docSnap.data();

const userSnap = await getDoc(doc(db,"users",s.uid));

const u = userSnap.exists()
? userSnap.data()
: {};

        

storyBar.insertAdjacentHTML(
"beforeend",
`
<div class="storyItem" onclick="openStory('${docSnap.id}')">

    <div class="storyAvatar">

        ${
        s.type==="video"
        ?
        `<video src="${s.media}" muted></video>`
        :
        `<img src="${u.avatar || 'https://i.ibb.co/Z1kv9nJj/logo.png'}">`
        }

    </div>

    <div class="storyName">
        ${s.text || ""}
    </div>

</div>
`
);
        const video = storyBar.lastElementChild.querySelector("video");

if (video) {
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
        video.play().catch(() => {});
    };
}
   }

}
const storyViewer = document.getElementById("storyViewer");
const storyOwnerAvatar =
document.getElementById("storyOwnerAvatar");

const storyOwnerName =
document.getElementById("storyOwnerName");

const storyOwnerBadge =
document.getElementById("storyOwnerBadge");

const storyTime =
document.getElementById("storyTime");
const storyVideo = document.getElementById("storyVideo");
const storyImage = document.getElementById("storyImage");
const storyText =
document.getElementById("storyText");
async function sendStoryMessage(
text,
story
){


    const user = auth.currentUser;

    if(!user || !currentStoryOwner)
        return;


    if(user.uid === currentStoryOwner)
        return;



    const snap = await getDocs(
        query(
            collection(db,"conversations"),
            where(
                "members",
                "array-contains",
                user.uid
            )
        )
    );


    let conversationId = null;


    snap.forEach(docSnap=>{

        const data = docSnap.data();


        if(
            data.members &&
            data.members.includes(currentStoryOwner)
        ){

            conversationId = docSnap.id;

        }

    });



   if(!conversationId){

const mySnap = await getDoc(
    doc(db,"users",user.uid)
);

const ownerSnap = await getDoc(
    doc(db,"users",currentStoryOwner)
);


const ref = await addDoc(
collection(db,"conversations"),
{

members:[
user.uid,
currentStoryOwner
],

users:{
[user.uid]:{
    name:mySnap.data()?.name || "",
    avatar:mySnap.data()?.avatar || ""
},

[currentStoryOwner]:{
    name:ownerSnap.data()?.name || "",
    avatar:ownerSnap.data()?.avatar || ""
}

},

lastMessage:text,

updatedAt:serverTimestamp()

}
);
        conversationId = ref.id;

    }



   await addDoc(
collection(
db,
"conversations",
conversationId,
"messages"
),
{
    senderId: user.uid,

    text: text,               // bình luận

    type: "story_reply",

    storyId: currentStoryId,

    storyType: story.type,

    storyMedia: story.media,

    storyText: story.text || "",

    createdAt: serverTimestamp(),

    seenBy:[user.uid]
}
);


    await updateDoc(

        doc(
            db,
            "conversations",
            conversationId
        ),

        {

            lastMessage:text,

            updatedAt:
            serverTimestamp()

        }

    );


}
const storyLikeBtn =
document.getElementById("storyLikeBtn");


if(storyLikeBtn){

storyLikeBtn.onclick = async()=>{

    if(!currentStoryId || !auth.currentUser)
        return;


    const storyRef = doc(
        db,
        "profile_stories",
        currentStoryId
    );


    const storySnap = await getDoc(storyRef);


    if(!storySnap.exists())
        return;


    const story = storySnap.data();


    const likes = story.likes || [];


    const storyTitle =
        story.text ||
        story.fileName ||
        "story";


    // BỎ LIKE
    if(likes.includes(auth.currentUser.uid)){


        await updateDoc(
            storyRef,
            {
                likes: likes.filter(
                    uid => uid !== auth.currentUser.uid
                ),
                likeCount: increment(-1)
            }
        );


        storyLikeBtn.classList.remove("liked");


        return;

    }



    // THÊM LIKE
    await updateDoc(
        storyRef,
        {
            likes: arrayUnion(
                auth.currentUser.uid
            ),
            likeCount: increment(1)
        }
    );


    storyLikeBtn.classList.add("liked");



// GỬI TIN NHẮN CHO CHỦ STORY
if(currentStoryOwner !== auth.currentUser.uid){

   await sendStoryMessage(

`❤️ đã thích story "${storyTitle}" của bạn`,

story

);

        }

    }

};     
const storyCommentSend =
document.getElementById("storySendBtn");
if(storyCommentSend){

storyCommentSend.onclick = async()=>{


const input =
document.getElementById("storyReplyInput");


const text = input.value.trim();


if(!text || !currentStoryId) return;


const storySnap =
await getDoc(
doc(db,"profile_stories",currentStoryId)
);
const story = storySnap.data();

const storyText = story.text || "";

await addDoc(
collection(
db,
"profile_stories",
currentStoryId,
"comments"
),
{
uid:auth.currentUser.uid,
text:text,
createdAt:serverTimestamp()
}
);


await sendStoryMessage(

`đã bình luận story của bạn: ${text}`,

story

);
input.value="";


};


}
window.openStory = async function(id){
let blocked = false;

if(auth.currentUser){
    const block = await isBlocked(auth.currentUser.uid, profileUid);
    blocked = block.iBlocked || block.blockedMe;
}

if(blocked){
    return;
}
    currentStoryId = id;

    const snap = await getDoc(
       doc(db,"profile_stories",id)
    );

    if(!snap.exists()) return;

    const s = snap.data();
    const userSnap = await getDoc(doc(db,"users",s.uid));

const u = userSnap.exists()
? userSnap.data()
: {};
    if(auth.currentUser){

    await updateDoc(
        doc(db,"profile_stories",id),
        {
            viewers: arrayUnion(auth.currentUser.uid)
        }
    );

}
    currentStoryOwner = s.uid;
    // HIỂN THỊ NGƯỜI ĐĂNG STORY

storyOwnerAvatar.src =
u.avatar ||
"https://i.ibb.co/Z1kv9nJj/logo.png";

storyOwnerName.innerHTML =
`
${u.name || "Người dùng"}
${getVerifiedBadge(s.uid)}
`;


// HIỂN THỊ NGÀY GIỜ ĐĂNG

if(s.createdAt){
const now = new Date();

const time = s.createdAt.toDate();

const diff = Math.floor(
    (now - time) / 1000
);


if(diff < 60){

    storyTime.innerText = "Vừa xong";

}
else if(diff < 3600){

    storyTime.innerText =
    Math.floor(diff / 60) + " phút trước";

}
else if(diff < 86400){

    storyTime.innerText =
    Math.floor(diff / 3600) + " giờ trước";

}
else{

    storyTime.innerText =
    time.toLocaleDateString("vi-VN",{
        day:"2-digit",
        month:"2-digit"
    });

}
    
}else{

    storyTime.innerText="";

}
    storyOwnerAvatar.onclick = ()=>{

    location.href =
    `profile-review.html?uid=${s.uid}`;

};
   storyViewer.classList.add("active");


const storyLikeBox = document.getElementById("storyLikeBox");
const storyCommentBox = document.getElementById("storyCommentBox");

const isOwner =
    auth.currentUser &&
    auth.currentUser.uid === s.uid;

storyMore.style.display = isOwner ? "block" : "none";

if (storyLikeBox) {
    storyLikeBox.style.display = "flex";
}

if (storyCommentBox) {
    if (isOwner) {
        storyCommentBox.style.display = "none";
        storyCommentBox.hidden = true;
    } else {
        storyCommentBox.hidden = false;
        storyCommentBox.style.display = "flex";
    }
}
storyVideo.style.display="none";
storyImage.style.display="none";


if(s.type==="video"){

    storyVideo.src=s.media;
    storyVideo.style.display="block";

    storyVideo.currentTime = 0;

    storyVideo.play().catch(()=>{});


    // VIDEO STORY HẾT TỰ THOÁT
    storyVideo.onended = () => {

        storyViewer.classList.remove("active");

        storyVideo.pause();
        storyVideo.currentTime = 0;
        storyVideo.src="";

        currentStoryId = null;
        currentStoryOwner = null;

    };


}else{

    storyImage.src=s.media;
    storyImage.style.display="block";

}

};
storyMore.onclick = async ()=>{

    if(!currentStoryId) return;

    if(!confirm("Xóa story này?")) return;

   await deleteDoc(
    doc(db,"profile_stories",currentStoryId)
);

    storyViewer.classList.remove("active");

    storyVideo.pause();
    storyVideo.src="";

   await checkProfileStory();
loadStories();

};
document.getElementById("closeStory").onclick=()=>{

    storyViewer.classList.remove("active");

    storyVideo.pause();
    storyVideo.src="";

};
const followingCountBtn =
document.getElementById("followingCount").parentElement;


const followerCountBtn =
document.getElementById("followerCount").parentElement;



followingCountBtn.onclick = ()=>{

    openFollowList("following");

};


followerCountBtn.onclick = ()=>{

    openFollowList("followers");

};



function openFollowList(type){

    document
    .getElementById("followListSheet")
    .classList.add("active");


    document.getElementById("followListTitle").innerText =
    type === "following"
    ? "Đã follow"
    : "Follower";


    loadFollowList(type);

}



document.getElementById("closeFollowList").onclick=()=>{

    document
    .getElementById("followListSheet")
    .classList.remove("active");

};
async function loadFollowList(type){

    const box =
    document.getElementById("followListContent");


    box.innerHTML = "Đang tải...";


    const ref = collection(
        db,
        "users",
        profileUid,
        type
    );


    const snap = await getDocs(ref);


    box.innerHTML="";


    if(snap.empty){

        box.innerHTML =
        `
        <div style="
        text-align:center;
        padding:30px;
        color:#777;
        ">
        Chưa có dữ liệu
        </div>
        `;

        return;
    }


    for(const item of snap.docs){


        const uid = item.id;


        const userSnap =
        await getDoc(
            doc(db,"users",uid)
        );


        if(!userSnap.exists()) continue;


        const u=userSnap.data();


       box.innerHTML += `
<div class="follow-user">

    <img
        src="${u.avatar || 'https://i.ibb.co/Z1kv9nJj/logo.png'}"
        onclick="location.href='profile-review.html?uid=${uid}'"
        style="cursor:pointer">

    <span
        onclick="location.href='profile-review.html?uid=${uid}'"
        style="cursor:pointer">
        ${u.name || "Người dùng"}
    </span>

</div>
`;

    }

}
// ==========================
// SETTINGS BUTTONS
// ==========================

document.getElementById("accountBtn").onclick = () => {
    location.href = "edit-profile.html";
};

document.getElementById("securityBtn").onclick = () => {
    location.href = "security.html";
};

document.getElementById("deviceBtn").onclick = () => {
    location.href = "devices.html";
};

document.getElementById("privateBtn").onclick = () => {
    location.href = "private-account.html";
};

document.getElementById("blockedBtn").onclick = () => {

    const list = document.getElementById("blockedList");

    if (!list) {
        alert("Không tìm thấy danh sách người đã chặn.");
        return;
    }

    list.style.display = "block";

    loadBlockedUsers();

};

document.getElementById("commentSetting").onclick = () => {
    location.href = "comment-settings.html";
};

document.getElementById("messageSetting").onclick = () => {
    location.href = "message-settings.html";
};

document.getElementById("mentionSetting").onclick = () => {
    location.href = "mention-settings.html";
};

document.getElementById("logoutBtn").onclick = async () => {

    if (!confirm("Đăng xuất?")) return;

    await auth.signOut();

    location.href = "index.html";
};
async function checkProfileStory(){

    const q = query(
        collection(db,"profile_stories"),
        where("uid","==",profileUid)
    );

    const snap = await getDocs(q);

    let hasStory = false;

    const now = Date.now();

    snap.forEach(docSnap=>{

        const s = docSnap.data();

        if(!s.createdAt) return;


        const time = s.createdAt.toDate().getTime();


        // còn trong 24h
        if(now - time < 86400000){

            hasStory = true;

        }

    });


    if(hasStory){

        avatar.classList.add("has-story");

    }else{

        avatar.classList.remove("has-story");

    }

}
