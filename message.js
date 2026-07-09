

// ================================
// MESSAGE JS (FIREBASE V8)
// ================================
import { getVerifiedBadge } from "./verified-users.js";

// Firebase
import { db, auth } from "./firebase-init.js";



// ================================
// GET CONVERSATION ID
// ================================

const params =
new URLSearchParams(
    window.location.search
);


const conversationId =
params.get("id");



if(!conversationId){

    console.error(
        "Không có conversation id"
    );

}



// ================================
// ELEMENT
// ================================

const chatTitle =
document.getElementById("chatTitle");

const chatAvatar =
document.getElementById("chatAvatar");

const messageBox =
document.getElementById("messageBox");

const messageInput =
document.getElementById("messageInput");

const sendBtn =
document.getElementById("sendBtn");

const backBtn =
document.getElementById("backBtn");



// ================================
// DATA
// ================================

let currentUser = null;
let userCache = {};
async function getUserInfo(uid){

    if(userCache[uid]){
        return userCache[uid];
    }

    const snap = await db
        .collection("users")
        .doc(uid)
        .get();

    let user = {
        avatar: "https://i.ibb.co/Z1kv9nJj/logo.png",
        name: "Người dùng"
    };

    if(snap.exists){

        const data = snap.data();

        user = {
            avatar: data.avatar || "https://i.ibb.co/Z1kv9nJj/logo.png",
            name: data.name || "Người dùng"
        };

    }

    userCache[uid] = user;

    return user;

}

// ================================
// LOAD CHAT INFO
// ================================

async function loadChatInfo(){

try{

    const snap = await db
    .collection("conversations")
    .doc(conversationId)
    .get();

    if(!snap.exists) return;

    const data = snap.data();

    const otherUid =
    data.members.find(uid => uid !== currentUser.uid);

    const userSnap = await db
    .collection("users")
    .doc(otherUid)
    .get();

    if(userSnap.exists){

        const u = userSnap.data();

        if(chatTitle){
           let displayName = u.name || "Người dùng";

const nickSnap = await db
.collection("users")
.doc(currentUser.uid)
.collection("nicknames")
.doc(otherUid)
.get();

if(nickSnap.exists){

    displayName = nickSnap.data().nickname;

}

chatTitle.innerHTML = `
<span>${displayName}</span>
${getVerifiedBadge(otherUid)}
`;
        }

        if(chatAvatar){

    chatAvatar.src =
    u.avatar ||
    "https://i.ibb.co/Z1kv9nJj/logo.png";


    chatAvatar.style.cursor = "pointer";


    chatAvatar.onclick = ()=>{

        window.location.href =
        "profile-review.html?uid=" + otherUid;

    };

}

    }

}catch(err){

    console.error(err);

}

}


// ================================
// LOAD MESSAGES REALTIME
// ================================

function loadMessages(){


db
.collection("conversations")
.doc(conversationId)
.collection("messages")
.orderBy(
    "createdAt",
    "asc"
)
.onSnapshot(
snap=>{


    if(!messageBox)
    return;



    messageBox.innerHTML="";



   (async()=>{

    messageBox.innerHTML="";

    for(const doc of snap.docs){

        const msg = doc.data();

        await renderMessage(msg);

    }

    scrollBottom();

})();



    scrollBottom();



});



}



// ================================
// RENDER MESSAGE
// ================================

function renderMessage(msg){


const div =
document.createElement("div");



div.className =
"message";



if(
    msg.senderId ===
    currentUser.uid
){

    div.classList.add(
        "mine"
    );

}else{

    div.classList.add(
        "other"
    );

}



div.innerHTML = `

<div class="message-content">

${escapeHTML(
    msg.text || ""
)}

</div>

<div class="message-time">

${formatTime(
    msg.createdAt
)}

</div>

`;



messageBox.appendChild(div);


}




// ================================
// SEND MESSAGE
// ================================

async function renderMessage(msg){

    const div = document.createElement("div");

    const mine = msg.senderId === currentUser.uid;

    div.className = mine ? "message mine" : "message other";

    let avatarHTML = "";

    if(!mine){

        const user = await getUserInfo(msg.senderId);

        avatarHTML = `
            <img
                class="message-avatar"
                src="${user.avatar}"
                onclick="location.href='profile-review.html?uid=${msg.senderId}'"
            >
        `;

    }

    div.innerHTML = `

        ${avatarHTML}

        <div class="message-body">

            <div class="message-content">

                ${escapeHTML(msg.text || "")}

            </div>

            <div class="message-time">

                ${formatTime(msg.createdAt)}

            </div>

        </div>

    `;

    messageBox.appendChild(div);

}

   await db
.collection("conversations")
.doc(conversationId)
.update({

    lastMessage: text,

    updatedAt: now,

    unread: firebase.firestore.FieldValue.increment(1)

});

    messageInput.value="";



}catch(err){

    console.error(
        "Gửi tin nhắn lỗi:",
        err
    );

}


}




// ================================
// FORMAT TIME
// ================================

function formatTime(time){


if(!time)
return "";



if(time.toDate){

    return time
    .toDate()
    .toLocaleTimeString(
        "vi-VN",
        {
            hour:"2-digit",
            minute:"2-digit"
        }
    );

}



return "";

}




// ================================
// ESCAPE HTML
// ================================

function escapeHTML(str){

return str
.replace(
/</g,
"&lt;"
)
.replace(
/>/g,
"&gt;"
)
.replace(
/"/g,
"&quot;"
)
.replace(
/'/g,
"&#039;"
);

}



// ================================
// SCROLL
// ================================

function scrollBottom(){

if(messageBox){

    messageBox.scrollTop =
    messageBox.scrollHeight;

}

}



// ================================
// EVENTS
// ================================

if(sendBtn){

sendBtn.onclick =
sendMessage;

}



if(messageInput){

messageInput.addEventListener(
"keydown",
e=>{


if(
e.key==="Enter"
){

sendMessage();

}


});


}



if(backBtn){

backBtn.onclick=()=>{

    history.back();

};

}




// ================================
// AUTH START
// ================================

auth.onAuthStateChanged(
user=>{


if(user){


    currentUser =
    user;


    loadChatInfo();


    loadMessages();

db.collection("conversations")
.doc(conversationId)
.update({
    unread:0
});
}


});
