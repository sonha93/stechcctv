

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
const imageBtn =
document.getElementById("imageBtn");

const imageInput =
document.getElementById("imageInput");
const backBtn =
document.getElementById("backBtn");



// ================================
// DATA
// ================================
    let currentUser = null;
    let userCache = {};
    let seenUserCache = {};
    let selectedImage = null;


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

async function loadMessages() {

db.collection("conversations")
.doc(conversationId)
.collection("messages")
.orderBy("createdAt","asc")
.onSnapshot(async snap=>{

    if(!messageBox) return;

    messageBox.innerHTML="";

    const messages = [];

   snap.forEach(doc=>{

    let data = doc.data();

    data.id = doc.id;

    messages.push(data);

});

    for(let i=0;i<messages.length;i++){

        const msg = messages[i];
if(
msg.senderId !== currentUser.uid &&
(!msg.seenBy || !msg.seenBy.includes(currentUser.uid))
){

    msg.seenBy = [
        ...(msg.seenBy || []),
        currentUser.uid
    ];

    db.collection("conversations")
    .doc(conversationId)
    .collection("messages")
    .doc(msg.id)
    .update({

        seenBy:
        firebase.firestore.FieldValue.arrayUnion(
            currentUser.uid
        )

    });

}
        if(!userCache[msg.senderId]){

            const userSnap = await db
            .collection("users")
            .doc(msg.senderId)
            .get();

            if(userSnap.exists){

                userCache[msg.senderId] = userSnap.data();

            }else{

                userCache[msg.senderId] = {};

            }

        }

        const nextMsg = messages[i+1];


// lấy avatar người đã xem
if(msg.seenBy){

    for(const uid of msg.seenBy){

        if(uid === currentUser.uid) continue;

        if(!seenUserCache[uid]){

            const seenSnap = await db
            .collection("users")
            .doc(uid)
            .get();

            if(seenSnap.exists){

                seenUserCache[uid] =
                seenSnap.data();

            }

        }

    }

}

renderMessage(
    msg,
    userCache[msg.senderId],
    nextMsg
);

    }

    scrollBottom();

});

}


// ================================
// RENDER MESSAGE
// ================================

function renderMessage(msg,user,nextMsg){

const div=document.createElement("div");

const mine =
msg.senderId===currentUser.uid;

div.className=
mine ? "message mine":"message other";

const showAvatar =
!mine &&
(
!nextMsg ||
nextMsg.senderId!==msg.senderId
);

div.innerHTML=`

${showAvatar?`
<img
class="msg-avatar"
style="cursor:pointer"
onclick="window.location.href='profile-review.html?uid=${msg.senderId}'"
src="${
user.avatar ||
'https://i.ibb.co/Z1kv9nJj/logo.png'
}">
`:"<div class='msg-avatar-space'></div>"}

<div class="message-body">

<div class="message-content ${msg.image ? "image-only" : ""}">


${
msg.image
?
`
<img
class="chat-image"
src="${msg.image}"
onclick="showChatImage(this.src)">
`
:
""
}

${msg.text ? `
<div class="chat-text">
${escapeHTML(msg.text)}
</div>
` : ""}

</div>

<div class="message-time">
${formatTime(msg.createdAt)}
</div>


${
mine &&
msg.seenBy &&
msg.seenBy.some(uid=>uid!==currentUser.uid) &&
(!nextMsg || nextMsg.senderId !== currentUser.uid)
?
`
<img
class="seen-avatar"
src="${
seenUserCache[
msg.seenBy.find(uid=>uid!==currentUser.uid)
]?.avatar
||
'https://i.ibb.co/Z1kv9nJj/logo.png'
}">
`
:""
}
</div>
`;

messageBox.appendChild(div);

}

// ================================
// SEND MESSAGE
// ================================

async function sendMessage(){


const text =
messageInput.value.trim();


if(!text && !selectedImage)
return;


if(!currentUser)
return;



try{

let imageUrl = "";


if(selectedImage){


const form = new FormData();


form.append(
"file",
selectedImage
);


form.append(
"upload_preset",
"stech_up"
);



const upload = await fetch(

"https://api.cloudinary.com/v1_1/dmz9gpp1b/image/upload",

{

method:"POST",

body:form

}

);



const data =
await upload.json();



imageUrl =
data.secure_url;


}
    const now =
    firebase.firestore
    .Timestamp
    .now();



    await db
    .collection("conversations")
.doc(conversationId)
.collection("messages")
   .add({

    senderId:
    currentUser.uid,

    text:text,
    image:imageUrl,
    createdAt:
    now,

    seenBy:[
        currentUser.uid
    ]

});


  const convSnap = await db
.collection("conversations")
.doc(conversationId)
.get();


const otherUid = convSnap.data().members.find(
uid => uid !== currentUser.uid
);



await db
.collection("conversations")
.doc(conversationId)
.update({

    lastMessage: text,

    updatedAt: now,

    [`unread.${otherUid}`]:
    firebase.firestore.FieldValue.increment(1)

});
    messageInput.value="";

    selectedImage = null;

imageInput.value="";


document.getElementById("imagePreview").innerHTML="";

}catch(err){

    console.error(
        "Gửi tin nhắn lỗi:",
        err
    );

}


}


// ================================
// SEND IMAGE
// ================================

// ================================
// SEND IMAGE CLOUDINARY
// ================================

async function sendImage(){

const file = imageInput.files[0];

if(!file)
return;


try{


const form = new FormData();

form.append(
"file",
file
);

form.append(
"upload_preset",
"stech_up"
);



const upload = await fetch(

"https://api.cloudinary.com/v1_1/dmz9gpp1b/image/upload",

{

method:"POST",

body:form

}

);



const data = await upload.json();



if(!data.secure_url){

console.error(
"Cloudinary lỗi:",
data
);

return;

}



const now =
firebase.firestore.Timestamp.now();



await db
.collection("conversations")
.doc(conversationId)
.collection("messages")
.add({

senderId:
currentUser.uid,

text:"",

image:
data.secure_url,

createdAt:now,

seenBy:[
currentUser.uid
]

});



imageInput.value="";


}catch(err){

console.error(
"Gửi ảnh lỗi:",
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

if(imageBtn){

imageBtn.onclick=()=>{

    imageInput.click();

};

}





if(imageInput){

imageInput.onchange = ()=>{

    selectedImage = imageInput.files[0];

    if(selectedImage){

        const url = URL.createObjectURL(selectedImage);

        const preview =
        document.getElementById("imagePreview");


        if(preview){

            preview.innerHTML = `
            <img src="${url}">
            `;

        }

    }

};

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

    [`unread.${currentUser.uid}`]:0

});
}


});
function openChatImage(url){

const popup = document.createElement("div");

popup.className = "image-popup";

popup.innerHTML = `
<img src="${url}">
`;

popup.onclick = ()=>{
    popup.remove();
};

document.body.appendChild(popup);

}
window.showChatImage = function(src){

const popup = document.createElement("div");

popup.className = "chat-image-viewer";

popup.innerHTML = `
<img src="${src}">
`;

popup.onclick = function(){
    popup.remove();
};

document.body.appendChild(popup);

};
