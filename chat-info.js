// =====================================
// CHAT INFO JS FIREBASE V8
// =====================================

import { db, auth } from "./firebase-init.js";
import { getVerifiedBadge } from "./verified-users.js";


// =====================================
// CHECK LOGIN
// =====================================

auth.onAuthStateChanged(user=>{

if(!user){

location.href="login.html";

return;

}


});

// =====================================
// GET PARAM
// =====================================

const params =
new URLSearchParams(location.search);


const uid =
params.get("uid");


const chatId = params.get("chatId");

// =====================================
// ELEMENT
// =====================================

const avatar =
document.getElementById("avatar");

const username =
document.getElementById("username");
const verified =
document.getElementById("verified");
// ================================
// CLICK XEM AVATAR
// ================================

if(avatar){

    avatar.style.cursor = "pointer";

    avatar.onclick = ()=>{

        const box = document.createElement("div");

        box.style.position = "fixed";
        box.style.top = "0";
        box.style.left = "0";
        box.style.width = "100%";
        box.style.height = "100%";
        box.style.background = "rgba(0,0,0,.8)";
        box.style.display = "flex";
        box.style.alignItems = "center";
        box.style.justifyContent = "center";
        box.style.zIndex = "99999";


        box.innerHTML = `
            <img src="${avatar.src}"
            style="
            max-width:90%;
            max-height:90%;
            border-radius:50%;
            ">
        `;


        box.onclick = ()=>{

            box.remove();

        };


        document.body.appendChild(box);

    };

}

const backBtn =
document.getElementById("backBtn");

const mute =
document.getElementById("mute");



// =====================================
// BACK
// =====================================

if(backBtn){

backBtn.onclick=()=>{

history.back();

};

}



// =====================================
// LOAD USER INFO
// =====================================

async function loadUserInfo(){


if(!uid) return;


const snap =
await db.collection("users")
.doc(uid)
.get();


if(!snap.exists) return;


const user =
snap.data();



if(avatar){

avatar.src =
user.avatar ||
"default-avatar.png";

}



if(username){

let displayName =
user.name ||
"Người dùng";


const current =
auth.currentUser;


if(current){


const nickSnap =
await db.collection("users")
.doc(current.uid)
.collection("nicknames")
.doc(uid)
.get();



if(nickSnap.exists){

displayName =
nickSnap.data().nickname ||
displayName;

}


}



username.textContent = displayName;
verified.innerHTML = getVerifiedBadge(uid);
}


}



auth.onAuthStateChanged(user=>{

if(user){

loadUserInfo();
loadMedia();
}

});
// =====================================
// LOAD MEDIA
// =====================================

async function loadMedia(){

if(!chatId) return;


const snap =
await db.collection("conversations")
.doc(chatId)
.collection("messages")
.get();


const mediaList =
document.getElementById("mediaList");


if(!mediaList) return;


let html = "";


snap.forEach(doc=>{

const msg = doc.data();


if(msg.image){

html += `
<img class="media-photo"
src="${msg.image}">
`;

}


if(msg.images){

msg.images.forEach(img=>{

html += `
<img class="media-photo"
src="${img}">
`;

});

}


if(msg.video){

html += `
<video class="media-video"
controls
src="${msg.video}">
</video>
`;

}


});


mediaList.innerHTML = html;


}

// =====================================
// LOAD PINNED MESSAGE
// =====================================

async function loadPinned(){


if(!chatId)return;



const snap =
await db.collection("conversations")
.doc(chatId)
.collection("messages")
.where(
"pinned",
"==",
true
)
.get();



let pinned=[];



snap.forEach(doc=>{


pinned.push(doc.data());


});



console.log(
"Tin nhắn ghim:",
pinned
);


}



loadPinned();





// =====================================
// SEARCH MESSAGE
// =====================================

window.searchChatMessage =
async function(keyword){


if(!chatId)return;



keyword =
keyword.toLowerCase();



const snap =
await db.collection("chats")
.doc(chatId)
.collection("messages")
.get();



let result=[];



snap.forEach(doc=>{


const data =
doc.data();



const text =
(data.text || "")
.toLowerCase();



if(
text.includes(keyword)
){

result.push(data);

}


});



return result;


};





// =====================================
// NICKNAME
// =====================================

window.changeNickname =
async function(){


const name =
prompt(
"Nhập biệt danh"
);



if(!name)return;



const current =
auth.currentUser;



if(!current)return;



await db.collection("users")
.doc(current.uid)
.collection("nicknames")
.doc(uid)
.set({

nickname:name,
updatedAt:
firebase.firestore.FieldValue.serverTimestamp()

});



alert(
"Đã đổi biệt danh"
);
location.reload();

};





// =====================================
// MUTE CHAT
// =====================================

if(mute){


mute.onchange =
async()=>{


if(!chatId)return;



await db.collection("chats")
.doc(chatId)
.update({

[`settings.${auth.currentUser.uid}.mute`]:
mute.checked

});


};


}






// =====================================
// BLOCK USER
// =====================================

window.blockUser =
async function(){


const current =
auth.currentUser;


if(!current)return;



await db.collection("users")
.doc(current.uid)
.update({

blockedUsers:
firebase.firestore.FieldValue
.arrayUnion(uid)

});



alert(
"Đã chặn người dùng"
);


};






// =====================================
// DELETE CHAT FOR ME
// =====================================

window.deleteChat =
async function(){


if(!chatId)return;



const current =
auth.currentUser;



await db.collection("chats")
.doc(chatId)
.update({

deletedFor:
firebase.firestore.FieldValue
.arrayUnion(current.uid)

});



alert(
"Đã xóa đoạn chat"
);


};




// ================================
// VIEW AVATAR
// ================================

window.viewAvatar = function(){

if(!avatar) return;


const box = document.createElement("div");

box.className = "avatar-viewer";


box.innerHTML = `
<img src="${avatar.src}">
`;


box.onclick = ()=>{

box.remove();

};


document.body.appendChild(box);

};



// ================================
// LOAD MEDIA CLICK
// ================================

async function renderMedia(){


if(!chatId) return;


const snap =
await db.collection("conversations")
.doc(chatId)
.collection("messages")
.get();


let html = "";


snap.forEach(doc=>{


const msg = doc.data();



if(msg.image){

html += `
<img src="${msg.image}"
style="width:100px;border-radius:10px">
`;

}



if(msg.link){

html += `
<a href="${msg.link}" target="_blank">
${msg.link}
</a>
`;

}



});


console.log(
"MEDIA:",
html
);


}



renderMedia();



// ================================
// NICKNAME LOAD
// ================================

async function loadNickname(){

    const current =
    auth.currentUser;


    if(!current || !uid || !username)
    return;


    const snap =
    await db.collection("users")
    .doc(current.uid)
    .collection("nicknames")
    .doc(uid)
    .get();


    let displayName =
    username.innerText ||
    "Người dùng";


    if(snap.exists){

        displayName =
        snap.data().nickname ||
        displayName;

    }


    username.textContent = displayName;

verified.innerHTML = getVerifiedBadge(uid);

}
// =====================================
// PROFILE
// =====================================

window.openProfile =
function(){


location.href =
"profile-review.html?uid="+uid;


};
const avatarViewer =
document.getElementById("avatarViewer");

const avatarViewerImg =
document.getElementById("avatarViewerImg");

const closeAvatarViewer =
document.getElementById("closeAvatarViewer");

if(avatar){

    avatar.onclick = ()=>{

        avatarViewerImg.src = avatar.src;

        avatarViewer.hidden = false;

        requestAnimationFrame(()=>{

            avatarViewer.classList.add("show");

        });

    };

}

function hideAvatarViewer(){

    avatarViewer.classList.remove("show");

    setTimeout(()=>{

        avatarViewer.hidden = true;

    },250);

}

closeAvatarViewer.onclick = hideAvatarViewer;

avatarViewer.onclick = e=>{

    if(e.target===avatarViewer){

        hideAvatarViewer();

    }

};
const mediaToggle = document.getElementById("mediaToggle");
const mediaList = document.getElementById("mediaList");

mediaToggle.onclick = () => {
    mediaList.classList.toggle("show");
};
// ================================
// LOAD FILES
// ================================

async function loadFiles(){

    if(!chatId) return;

    const snap = await db.collection("conversations")
    .doc(chatId)
    .collection("messages")
    .get();

    const fileList = document.getElementById("fileList");

    if(!fileList) return;

    let html = "";

    snap.forEach(doc=>{

        const msg = doc.data();

        if(msg.file){

            html += `
            <div class="file-item">
                <a href="${msg.file}" target="_blank">
                    📄 ${msg.fileName || "Tệp đính kèm"}
                </a>
            </div>
            `;

        }

    });

    fileList.innerHTML = html || "Không có tệp";

}
// ================================
// LOAD LINKS
// ================================

async function loadLinks(){

    if(!chatId) return;

    const snap = await db.collection("conversations")
    .doc(chatId)
    .collection("messages")
    .get();

    const linkList = document.getElementById("linkList");

    if(!linkList) return;

    let html = "";

    snap.forEach(doc=>{

        const msg = doc.data();

        if(msg.link){

            html += `
            <div class="link-item">
                <a href="${msg.link}" target="_blank">
                    🔗 ${msg.link}
                </a>
            </div>
            `;

        }

    });

    linkList.innerHTML = html || "Không có liên kết";

}
// ================================
// LOAD PINNED
// ================================

async function loadPinnedMessages(){

    if(!chatId) return;

    const snap = await db.collection("conversations")
    .doc(chatId)
    .collection("messages")
    .where("pinned","==",true)
    .get();

    const pinnedList = document.getElementById("pinnedList");

    if(!pinnedList) return;

    let html = "";

    snap.forEach(doc=>{

        const msg = doc.data();

        html += `
        <div class="pinned-item">

            ${msg.text || ""}

            ${msg.image ? `
                <br><img src="${msg.image}" class="media-photo">
            ` : ""}

        </div>
        `;

    });

    pinnedList.innerHTML = html || "Không có tin nhắn ghim";

}
const fileToggle = document.getElementById("fileToggle");
const linkToggle = document.getElementById("linkToggle");
const pinnedToggle = document.getElementById("pinnedToggle");

const fileList = document.getElementById("fileList");
const linkList = document.getElementById("linkList");
const pinnedList = document.getElementById("pinnedList");

if(fileToggle){

    fileToggle.onclick = async ()=>{

        if(!fileList.innerHTML.trim()){
            await loadFiles();
        }

        fileList.classList.toggle("show");

    };

}

if(linkToggle){

    linkToggle.onclick = async ()=>{

        if(!linkList.innerHTML.trim()){
            await loadLinks();
        }

        linkList.classList.toggle("show");

    };

}

if(pinnedToggle){

    pinnedToggle.onclick = async ()=>{

        if(!pinnedList.innerHTML.trim()){
            await loadPinnedMessages();
        }

        pinnedList.classList.toggle("show");

    };

}
