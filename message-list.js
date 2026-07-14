// ================================
// MESSAGE LIST JS (FIREBASE V8)
// ================================

import {
    acceptFollowRequest,
    rejectFollowRequest
} from "./follow-request.js";
// Firebase
import { getVerifiedBadge } from "./verified-users.js";
import { db, auth } from "./firebase-init.js";


// ================================
// ELEMENT
// ================================
const avatarSheet =
document.getElementById("avatarSheet");

const viewStoryBtn =
document.getElementById("viewStoryBtn");

const viewAvatarBtn =
document.getElementById("viewAvatarBtn");

let currentStoryId = "";
let currentAvatar = "";
const chatList =
document.getElementById("chatList");
const notificationList =
document.getElementById("notificationList");
const onlineFriends =
document.getElementById("onlineFriends");
const chatCount =
document.getElementById("chatCount");

const emptyChats =
document.getElementById("emptyChats");

const searchInput =
document.getElementById("searchInput");

const clearSearch =
document.getElementById("clearSearch");
const searchHistory =
JSON.parse(localStorage.getItem("searchHistory") || "[]");
const closeUserSearch =
document.getElementById("closeUserSearch");
const filterBtns =
document.querySelectorAll(".filterBtn");

const toast =
document.getElementById("notificationToast");

const toastText =
document.getElementById("notificationText");



// ================================
// DATA
// ================================

let chats = [];

let currentFilter = "all";



// ================================
// TOAST
// ================================

function showToast(text){

    if(!toast) return;


    if(toastText){

        toastText.textContent = text;

    }


    toast.style.display="flex";


    setTimeout(()=>{

        toast.style.display="none";

    },2000);

}

async function loadOnlineFriends(){

    const user = auth.currentUser;

    if(!user || !onlineFriends) return;


    onlineFriends.innerHTML = "";


    const snap = await db
    .collection("users")
    .doc(user.uid)
    .collection("following")
    .get();



    for(const doc of snap.docs){

        const friendUid = doc.id;


        const userSnap = await db
        .collection("users")
        .doc(friendUid)
        .get();


        if(!userSnap.exists) continue;


        const data = userSnap.data();


        if(data.online !== true) continue;



        onlineFriends.innerHTML += `

        <div class="online-user">

            <img src="${data.avatar || './avatar.png'}">

            <span>
                ${data.name || "Người dùng"}
            </span>

        </div>

        `;


    }

}

// ================================
// LOAD CHAT
// ================================
function loadChats(){

const user = auth.currentUser;

if(!user) return;

db.collection("conversations")
.where("members","array-contains",user.uid)
.orderBy("updatedAt","desc")
.onSnapshot(
    snap=>{

        chats=[];

        snap.forEach(doc=>{
            chats.push({
                id:doc.id,
                ...doc.data()
            });
        });

        renderChats();

    },
    err=>{
        console.error("Load chat lỗi:", err);
    }
);
}

// ================================
// RENDER
// ================================

async function renderChats(){


    if(!chatList)
    return;


    const currentUser = auth.currentUser;

    chatList.innerHTML="";



    let list =
    [...chats];



  if(currentFilter==="unread"){


    list =
    list.filter(
        x=>Number(x.unread?.[currentUser.uid] || 0)>0
    );


}


   if(currentFilter==="online"){

    chatList.innerHTML="";

    const user = auth.currentUser;

    if(!user) return;


    const snap = await db
    .collection("users")
    .doc(user.uid)
    .collection("following")
    .get();



    for(const doc of snap.docs){


        const uid = doc.id;


        const userSnap = await db
        .collection("users")
        .doc(uid)
        .get();


        if(!userSnap.exists)
        continue;


        const data = userSnap.data();



        if(data.online !== true)
        continue;



        chatList.innerHTML += `

        <div class="chat-item" data-uid="${uid}">

            <div class="chat-button">


                <div class="avatar-wrap">

                    <img class="avatar"
                    src="${data.avatar || './avatar.png'}">


                    <span class="online-dot"></span>

                </div>


                <div class="chat-body">

                    <div class="chat-name">

                        ${data.name || "Người dùng"}

                    </div>


                    <div class="message-preview">

                        Đang hoạt động

                    </div>

                </div>


            </div>

        </div>

        `;


    }


    return;

}



    if(currentFilter==="shop"){


        list =
        list.filter(
            x=>x.type==="shop"
        );


    }


 if(currentFilter==="notifications"){

    chatList.innerHTML = "";

   chatList.hidden = false;

    const user = auth.currentUser;

    if(!user) return;


   const snap = await db
    .collection("notifications")
    .where("receiverId","==",user.uid)
    .orderBy("createdAt","desc")
    .get();


    if(snap.empty){

        chatList.innerHTML = `
        <div style="padding:30px;text-align:center;color:#999">
            Không có thông báo
        </div>
        `;

        return;

    }


    snap.forEach(doc=>{

        const data = doc.data();


        chatList.innerHTML += `

<div class="chat-item">

    <div class="chat-button">

        <div class="avatar-wrap">

            <img class="avatar"
            src="${userData.avatar || "./avatar.png"}">

        </div>

        <div class="chat-body">

            <div class="chat-name">
                ${userData.name || "Người dùng"}
            </div>

            <div class="message-preview">
                Đã gửi lời mời theo dõi
            </div>

            <div style="margin-top:10px;display:flex;gap:8px">

                <button
                onclick="event.stopPropagation();acceptFollow('${doc.id}')">
                    Chấp nhận
                </button>

                <button
                onclick="event.stopPropagation();rejectFollow('${doc.id}')">
                    Từ chối
                </button>

            </div>

        </div>

    </div>

</div>

`;
    return;

}
if(currentFilter==="requests"){

    chatList.innerHTML = "";

    const user = auth.currentUser;

    if(!user) return;

    const snap = await db
    .collection("follow_requests")
.where("to","==",user.uid)
.where("status","==","pending")
    .get();


    if(snap.empty){

        chatList.innerHTML = `
            <div style="padding:30px;text-align:center;color:#999">
                Không có lời mời kết bạn
            </div>
        `;

        return;
    }


    for(const doc of snap.docs){

    const r = doc.data();

    const userSnap = await db
    .collection("users")
    .doc(r.from)
    .get();

    const userData = userSnap.exists
    ? userSnap.data()
    : {};

        chatList.innerHTML += `

          <div class="chat-item" data-uid="${r.from}">
            <div class="chat-button">

                <div class="avatar-wrap">

                    <img class="avatar"
                   src="${userData.avatar || './avatar.png'}">

                </div>


                <div class="chat-body">

                    <div class="chat-name">
                       ${userData.name || "Người dùng"}
                    </div>

                    <div class="message-preview">

                        <span>
                        Đã gửi lời mời theo dõi
                        </span>

                    </div>

                </div>


                <button onclick="event.stopPropagation(); acceptFollow('${doc.id}')">
    Chấp nhận
</button>


            </div>

        </div>

        `;

    }


    return;

}


chatList.hidden = false;
    const keyword =
    searchInput?.value
    ?.toLowerCase()
    .trim() || "";



   if(keyword){

    list =
    list.filter(x=>{

        return (
            (x.name || "")
            .toLowerCase()
            .includes(keyword)

        );

    });

}




    if(chatCount){

        chatCount.textContent =
        `${list.length} cuộc trò chuyện`;

    }




    if(list.length===0){


        if(emptyChats){

            emptyChats.hidden=false;

        }


        return;

    }



    if(emptyChats){

        emptyChats.hidden=true;

    }




    list.forEach(async chat=>{
    let otherUid = null;


if(chat.members && currentUser){

    otherUid =
    chat.members.find(
        uid => uid !== currentUser.uid
    );

}

        const template =
        document.getElementById(
            "chatItemTemplate"
        );



        if(!template)
        return;



        const node =
        template.content
        .cloneNode(true);



        const item =
        node.querySelector(
            ".chat-item"
        );



if(chat.members){

    otherUid =
    chat.members.find(
        uid => uid !== currentUser.uid
    );

}


let otherUser = {};


if(otherUid){

    const userSnap =
    await db.collection("users")
    .doc(otherUid)
    .get();


    if(userSnap.exists){

        otherUser =
        userSnap.data();

    }

}
// Kiểm tra người này có story không
const storySnap = await db
    .collection("stories")
    .where("uid", "==", otherUid)
    .limit(1)
    .get();

const hasStory = !storySnap.empty;

        if(!item)
        return;



        item.dataset.conversationId =
        chat.id;



        const name =
        node.querySelector(
            ".chat-name"
        );


      if (name) {

    let displayName =
        otherUser.name ||
        otherUser.displayName ||
        "Người dùng";

    const nickSnap = await db
        .collection("users")
        .doc(currentUser.uid)
        .collection("nicknames")
        .doc(otherUid)
        .get();

    if (nickSnap.exists) {
        displayName = nickSnap.data().nickname;
    }

    name.innerHTML = `
        ${displayName}
        ${getVerifiedBadge(otherUid)}
    `;

}



        const msg =
        node.querySelector(
            ".message-text"
        );


        if(msg){

            msg.textContent =
            chat.lastMessage ||
            "";

        }
        // Badge chưa đọc
const unreadBadge = node.querySelector(".unread-badge");
const unread =
Number(chat.unread?.[currentUser.uid] || 0);

if (unreadBadge) {
    if (unread >= 1) {
        unreadBadge.hidden = false;
        unreadBadge.textContent = unread > 99 ? "99+" : String(unread);
    } else {
        unreadBadge.hidden = true;
        unreadBadge.textContent = "";
    }
}

// Chữ đậm khi chưa đọc
if (name && msg) {

    if (
        Number(chat.unread?.[currentUser.uid] || 0) > 0
    ) {

        name.style.fontWeight = "700";
        msg.style.fontWeight = "600";
        msg.style.color = "#fff";

    } else {

        name.style.fontWeight = "500";
        msg.style.fontWeight = "400";
        msg.style.color = "#999";

    }

}
        const time =
        node.querySelector(
            ".chat-time"
        );


        if(time){

            time.textContent =
            formatTime(
                chat.updatedAt
            );

        }




        const avatar =
        node.querySelector(
            ".avatar"
        );
const avatarWrap =
node.querySelector(".avatar-wrap");

if (avatar) {

    avatar.src =
        otherUser.avatar ||
        otherUser.photoURL ||
        "./avatar.png";

}

if (hasStory && avatarWrap) {

    avatarWrap.classList.add("has-story");

}
const ring =
node.querySelector(".story-ring");

if(ring){

    ring.hidden = !hasStory;

}
if (avatarWrap) {

    avatarWrap.onclick = async (e) => {

        e.stopPropagation();

        currentAvatar =
            avatar.src;

        if (hasStory) {

           currentStoryId = otherUid;

            avatarSheet.hidden = false;

        } else {

            showAvatar(currentAvatar);

        }

    };

}

 


        chatList.appendChild(node);


    });


}




// ================================
// TIME
// ================================

function formatTime(time){


    if(!time)
    return "";



    if(time.seconds !== undefined){


        return new Date(
            time.seconds * 1000
        )
        .toLocaleDateString(
            "vi-VN"
        );


    }



    if(time.toDate){


        return time
        .toDate()
        .toLocaleDateString(
            "vi-VN"
        );


    }



    return "";

}



// ================================
// SEARCH
// ================================

if(searchInput){

searchInput.addEventListener(
"input",
async ()=>{
if(closeUserSearch){

    closeUserSearch.style.display =
    searchInput.value.trim()
    ? "flex"
    : "none";

}
if(clearSearch){

    clearSearch.style.display =
    searchInput.value.trim()
    ? "flex"
    : "none";

}
    const keyword =
    searchInput.value
    .toLowerCase()
    .trim();



    if(!keyword){

        renderChats();

        return;

    }



    const users =
    await searchUsers(keyword);



    chatList.innerHTML = "";



     users.forEach(user=>{

        chatList.innerHTML += `

        <div class="chat-item"
        data-uid="${user.uid}">

            <div class="chat-button">

                <div class="avatar-wrap">

                    <img class="avatar"
                    src="${user.avatar || './avatar.png'}">

                </div>

                <div class="chat-body">

                    <div class="chat-name">
                        ${user.name || user.displayName || "Người dùng"}
                    </div>

                    <div class="message-preview">
                        @${user.username || user.userId || ""}
                    </div>

                </div>

            </div>

        </div>

        `;

    });

});
} 
if(clearSearch){

    clearSearch.onclick = ()=>{

        searchInput.value = "";

        clearSearch.style.display = "none";

        if(closeUserSearch){
            closeUserSearch.style.display = "none";
        }

        renderChats();

    };

}
  
async function searchUsers(keyword){

    const snap = await db
    .collection("users")
    .get();


    const result = [];


    snap.forEach(doc=>{

        const data = doc.data();


        const name =
(
    data.name ||
    data.displayName ||
    ""
)
.toLowerCase();


const username =
(
    data.username ||
    data.userId ||
    data.id ||
    ""
)
.toLowerCase();


const uid =
doc.id.toLowerCase();



if(
    name.includes(keyword) ||
    username.includes(keyword) ||
    uid.includes(keyword)
){
            result.push({

                uid: doc.id,

                ...data

            });

        }


    });


    return result;

}


// ================================
// FILTER
// ================================

filterBtns.forEach(btn=>{


btn.onclick=()=>{


    filterBtns.forEach(b=>{

        b.classList.remove(
            "active"
        );

    });



    btn.classList.add(
        "active"
    );



    currentFilter =
    btn.dataset.filter;



    renderChats();


};


});



// ================================
// OPEN CHAT
// ================================

chatList.addEventListener("click", async (e) => {

    const item = e.target.closest(".chat-item");
    if (!item) return;

    // Nếu là cuộc trò chuyện đã có
    if (item.dataset.conversationId) {
        location.href = `message.html?id=${item.dataset.conversationId}`;
        return;
    }

    // Nếu là người đang hoạt động
    const uid = item.dataset.uid;
    if (!uid) return;

    const currentUser = auth.currentUser;

    // Tìm conversation giữa 2 người
    const snap = await db
        .collection("conversations")
        .where("members", "array-contains", currentUser.uid)
        .get();

    let conversationId = null;

    snap.forEach(doc => {
        const data = doc.data();

        if (
            data.members &&
            data.members.includes(uid)
        ) {
            conversationId = doc.id;
        }
    });

    // Chưa có thì tạo mới
    if (!conversationId) {

        const ref = await db
            .collection("conversations")
            .add({

                members: [
                    currentUser.uid,
                    uid
                ],

                createdAt: firebase.firestore.FieldValue.serverTimestamp(),

                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),

                lastMessage: "",

                unread: {}

            });

        conversationId = ref.id;
    }

    location.href = `message.html?id=${conversationId}`;

});







// ================================
// BUTTON
// ================================

const backBtn =
document.getElementById("backBtn");


if(backBtn){

backBtn.onclick=()=>{

    history.back();

};

}



const newChatBtn =
document.getElementById("newChatBtn");


if(newChatBtn){

newChatBtn.onclick=()=>{

    location.href =
    "new-chat.html";

};

}

function showAvatar(src){

    const box = document.createElement("div");

  box.className = "avatar-popup";

    box.innerHTML = `
        <img src="${src}">
    `;

    box.onclick = () => {

        box.remove();

    };

    document.body.appendChild(box);

}

// ================================
// AUTH START
// ================================

auth.onAuthStateChanged(
user=>{


    if(user){

        loadChats();

        loadOnlineFriends();

    }


});
function openAvatar(src){

    if(!src) return;

    const box=document.createElement("div");

    box.className="avatar-popup";

    box.innerHTML=`
        <img src="${src}">
    `;

    box.onclick=()=>box.remove();

    document.body.appendChild(box);

}
if (viewStoryBtn) {

    viewStoryBtn.onclick = () => {

        avatarSheet.hidden = true;

        openStory(currentStoryId);

    };

}

if (viewAvatarBtn) {

    viewAvatarBtn.onclick = () => {

        avatarSheet.hidden = true;

        showAvatar(currentAvatar);

    };

}

if (avatarSheet) {

    avatarSheet.onclick = (e) => {

        if (e.target === avatarSheet) {

            avatarSheet.hidden = true;

        }

    };

}
window.acceptFollow = async function(id){

    await acceptFollowRequest(id);

    renderChats();

    showToast("Đã chấp nhận lời mời");

};

window.rejectFollow = async function(id){

    await rejectFollowRequest(id);

    renderChats();

    showToast("Đã từ chối lời mời");

};
