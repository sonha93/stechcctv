// ================================
// MESSAGE LIST JS (FIREBASE V8)
// ================================


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


        list =
        list.filter(
            x=>x.online===true
        );


    }



    if(currentFilter==="shop"){


        list =
        list.filter(
            x=>x.type==="shop"
        );


    }

if(currentFilter==="requests"){

    list =
    list.filter(
        x=>x.type==="follow_request"
    );

}
if(currentFilter==="requests"){

    chatList.innerHTML = "";

    const user = auth.currentUser;

    if(!user) return;

    const snap = await db
    .collection("follow_requests")
    .where("toUid","==",user.uid)
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


    snap.forEach(doc=>{

        const r = doc.data();


        chatList.innerHTML += `

        <div class="chat-item">

            <div class="chat-button">

                <div class="avatar-wrap">

                    <img class="avatar"
                    src="${r.avatar || './avatar.png'}">

                </div>


                <div class="chat-body">

                    <div class="chat-name">
                        ${r.name || "Người dùng"}
                    </div>

                    <div class="message-preview">

                        <span>
                        Đã gửi lời mời theo dõi
                        </span>

                    </div>

                </div>


                <button onclick="acceptFollow('${doc.id}')">
                    Chấp nhận
                </button>


            </div>

        </div>

        `;

    });


    return;

}

    const keyword =
    searchInput?.value
    ?.toLowerCase()
    .trim() || "";



    if(keyword){


        list =
        list.filter(x=>{


            return (
                x.name ||
                ""
            )
            .toLowerCase()
            .includes(keyword);


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
()=>{

    renderChats();

});

}



if(clearSearch){

clearSearch.onclick=()=>{


    searchInput.value="";

    renderChats();


};

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

if(chatList){

chatList.addEventListener(
"click",
e=>{


    const item =
    e.target.closest(
        ".chat-item"
    );


    if(!item)
    return;



    const id =
    item.dataset.conversationId;



    location.href =
    `message.html?id=${id}`;


});


}




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

    await db
    .collection("follow_requests")
    .doc(id)
    .update({

        status:"accepted"

    });

    alert("Đã chấp nhận");

};
