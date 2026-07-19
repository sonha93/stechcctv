

// ================================
// MESSAGE JS (FIREBASE V8)
// ================================
import { getVerifiedBadge } from "./verified-users.js";
import { initCallSystem } from "./call/call-manager.js";
// Firebase
import { db, auth } from "./firebase-init.js";
import { isBlocked } from "./block.js";

// ================================
// MESSAGE SOUND
// ================================

const messageSound = new Audio();

messageSound.src = "./message.mp3";
messageSound.preload = "auto";
messageSound.volume = 0.7;


// ================================
// GET CONVERSATION ID
// ================================

const params =
new URLSearchParams(
    window.location.search
);


const conversationId =
params.get("id");
window.currentConversationId = conversationId;


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
const audioCallBtn = document.getElementById("audioCallBtn");

const callPopup = document.getElementById("callPopup");
const callAvatar = document.getElementById("callAvatar");
const callName = document.getElementById("callName");
const callStatus = document.getElementById("callStatus");

const rejectBtn = document.getElementById("chatRejectBtn");
const acceptBtn = document.getElementById("chatAcceptBtn");
const endBtn = document.getElementById("chatEndBtn");

// ================================
// DATA
// ================================
    let currentUser = null;
    let userCache = {};
    let seenUserCache = {};
   let selectedFiles = [];
let typingTimer = null;
let replyMessage = null;
let otherUid = "";
let messageMap = {};
let blockState = {
    iBlocked:false,
    blockedMe:false
};
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

    otherUid =
data.members.find(uid => uid !== currentUser.uid);

blockState = await isBlocked(
    currentUser.uid,
    otherUid
);

    const userSnap = await db
    .collection("users")
    .doc(otherUid)
    .get();

    if(userSnap.exists){

  const u = userSnap.data();

const blocked =
blockState.iBlocked || blockState.blockedMe;
if(blocked){

    if(messageInput)
        messageInput.style.display = "none";

    if(sendBtn)
        sendBtn.style.display = "none";

    if(imageBtn)
        imageBtn.style.display = "none";

}else{

    if(messageInput)
        messageInput.style.display = "";

    if(sendBtn)
        sendBtn.style.display = "";

    if(imageBtn)
        imageBtn.style.display = "";

}
const chatInput = document.querySelector(".chat-input");

if(chatInput){

    chatInput.style.display =
    blocked ? "none" : "flex";

}
if(chatTitle){

    let displayName = blocked
        ? "Người dùng"
        : (u.name || "Người dùng");

    if(!blocked){

        const nickSnap = await db
        .collection("users")
        .doc(currentUser.uid)
        .collection("nicknames")
        .doc(otherUid)
        .get();

        if(nickSnap.exists){

            displayName = nickSnap.data().nickname;

        }

    }

    chatTitle.innerHTML = blocked
    ? `<span>Người dùng</span>`
    : `
        <span>${displayName}</span>
        ${getVerifiedBadge(otherUid)}
    `;
}

if(chatAvatar){

    chatAvatar.src = blocked
        ? "https://i.ibb.co/Z1kv9nJj/logo.png"
        : (u.avatar || "https://i.ibb.co/Z1kv9nJj/logo.png");

    chatAvatar.style.cursor = blocked
        ? "default"
        : "pointer";

    chatAvatar.onclick = blocked
        ? null
        : ()=>{
            location.href =
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


    // phát âm thanh khi có tin nhắn mới
    snap.docChanges().forEach(change=>{

        if(change.type === "added"){

            const data = change.doc.data();


            // chỉ kêu khi người khác gửi
            if(
                data.senderId !== currentUser.uid
            ){

                messageSound.play()
                .catch(err=>{
                    console.log(
                        "Trình duyệt chặn âm thanh:",
                        err
                    );
                });

            }

        }

    });



    messageBox.innerHTML="";

    const messages = [];

   snap.forEach(doc=>{

    let data = doc.data();

    data.id = doc.id;

    messages.push(data);

});
messageMap = {};

messages.forEach(m => {

    messageMap[m.id] = m;

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
div.dataset.messageId = msg.id;
const showAvatar =
!mine &&
(
!nextMsg ||
nextMsg.senderId!==msg.senderId
);

div.innerHTML=`

${showAvatar ? `
<img
class="msg-avatar"
style="cursor:${(blockState.iBlocked || blockState.blockedMe) ? "default" : "pointer"}"
onclick="${
(blockState.iBlocked || blockState.blockedMe)
? ""
: `window.location.href='profile-review.html?uid=${msg.senderId}'`
}"
src="${
(blockState.iBlocked || blockState.blockedMe)
? "https://i.ibb.co/Z1kv9nJj/logo.png"
: (user.avatar || "https://i.ibb.co/Z1kv9nJj/logo.png")
}">
` : "<div class='msg-avatar-space'></div>"}

<div class="message-body">

<div class="message-content ${
    msg.type === "audio"
        ? "audio-only"
        : msg.type === "story_reply"
        ? "story-only"
        : (msg.image || (msg.images && msg.images.length))
        ? "image-only"
        : msg.video
        ? "video-only"
        : ""
}">


${
msg.replyTo
?
`
<div
class="reply-box"
${
messageMap[msg.replyTo.id]
? `onclick="scrollToMessage('${msg.replyTo.id}')"`
: ""
}>

↩ ${
messageMap[msg.replyTo.id]
? (
    messageMap[msg.replyTo.id].recalled
        ? "Tin nhắn đã thu hồi"
        : escapeHTML(messageMap[msg.replyTo.id].text || "")
)
: "Tin nhắn đã thu hồi"
}

</div>
`
:""
}
${
msg.images && msg.images.length
?
`
<div class="chat-images count-${Math.min(msg.images.length,4)}">

${msg.images.slice(0,4).map((img,index)=>`

<div class="chat-image-item">

<img
class="chat-image"
src="${img}"
onclick='showChatGallery(${JSON.stringify(msg.images)},${index})'>
${
msg.images.length>4 && index===3
?
`<div class="more-images">
+${msg.images.length-4}
</div>`
:
""
}

</div>

`).join("")}

</div>
`
:
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
${
msg.type === "story_reply"
?
`
<div class="story-reply-card">

${
msg.storyType === "video"
?
`
<video
class="chat-video"
controls
playsinline
preload="metadata"
src="${msg.storyMedia}">
</video>
`
:
`
<img
class="chat-image"
src="${msg.storyMedia}"
onclick="showChatImage(this.src)">
`
}

<div class="story-reply-label">
 Đã trả lời story
</div>

${
msg.storyText
?
`
<div class="story-caption">
${escapeHTML(msg.storyText)}
</div>
`
:
""
}

</div>
`
:
msg.video
?
`
<video
class="chat-video"
controls
playsinline
preload="metadata"
src="${msg.video}">
</video>
`
:
""
}
${
msg.type === "audio"
?
`
<div class="chat-audio">

<audio
controls
preload="metadata"
src="${msg.audioUrl}">
</audio>

<div class="audio-duration">
${msg.duration || 0}s
</div>

</div>
`
:
""
    
}
${
msg.type==="call"
?
`
<div class="chat-call">

<div class="call-icon">
${msg.callType==="video"?"📹":"📞"}
</div>

<div class="call-detail">

<div class="call-title">

${
msg.status==="missed"
?
`${msg.callType==="video"?"📹":"📞"} Cuộc gọi ${msg.callType==="video"?"video ":""}nhỡ`

:
msg.status==="rejected"
?
`${msg.callType==="video"?"📹":"📞"} Cuộc gọi bị từ chối`

:
mine
?
`${msg.callType==="video"?"📹":"📞"} Cuộc gọi ${msg.callType==="video"?"video ":""}đi`

:
`${msg.callType==="video"?"📹":"📞"} Cuộc gọi ${msg.callType==="video"?"video ":""}đến`
}

</div>

<div class="call-duration">

${
msg.duration>0
?
formatDuration(msg.duration)
:
"Không trả lời"
}

</div>

<div class="call-time">

${formatFullDate(msg.createdAt)}

</div>

<button
class="call-back-btn"
onclick="callAgain('${mine?otherUid:msg.senderId}','${msg.callType}')">

GỌI LẠI

</button>

</div>

</div>
`
:
""
}
${
msg.recalled
?
`
<div class="chat-text">
Tin nhắn đã được thu hồi
</div>
`
:
(
msg.replyTo &&
messageMap[msg.replyTo.id] &&
messageMap[msg.replyTo.id].recalled
)
?
`
<div class="chat-text">
Tin nhắn đã được thu hồi
</div>
`
:
msg.text
?
`
<div class="chat-text">
${escapeHTML(msg.text)}
</div>
`
:""
}

</div>

<div class="message-time">
${formatTime(msg.createdAt)}
</div>
<div class="message-reply-btn">

<button onclick="replyMessageFn(
'${msg.id}',
'${escapeHTML(msg.text || "Hình ảnh")}',
'${msg.senderId}'
)">
↩ Trả lời
</button>


${
mine && !msg.recalled
?
`
<button onclick="recallMessage('${msg.id}')">
Thu hồi
</button>
`
:""
}
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


if(!text && selectedFiles.length === 0)
return;

if(!currentUser)
return;
blockState = await isBlocked(
    currentUser.uid,
    otherUid
);

if(blockState.iBlocked){

    alert("Bạn đã chặn người này.");

    return;

}

if(blockState.blockedMe){

    alert("Người này đã chặn bạn.");

    return;

}


try{

let imageUrl = "";
let videoUrl = "";

if(selectedFiles.length){

const images = [];
const videos = [];

for(const file of selectedFiles){

    const form = new FormData();

    form.append("file", file);
    form.append("upload_preset", "stech_up");

    const isVideo = file.type.startsWith("video");

    const upload = await fetch(

        isVideo
        ? "https://api.cloudinary.com/v1_1/dmz9gpp1b/video/upload"
        : "https://api.cloudinary.com/v1_1/dmz9gpp1b/image/upload",

        {
            method:"POST",
            body:form
        }

    );

    const data = await upload.json();

    if(isVideo){
        videos.push(data.secure_url);
    }else{
        images.push(data.secure_url);
    }

}

const urlRegex = /(https?:\/\/[^\s]+)/i;

const link = urlRegex.test(text)
? text.match(urlRegex)[0]
: "";

await db
.collection("conversations")
.doc(conversationId)
.collection("messages")
.add({

    senderId: currentUser.uid,

    text: text,

    link: link,

    image: "",

    images: images,

    video: videos.length ? videos[0] : "",
     replyTo: replyMessage,
    pinned:false,

    createdAt: firebase.firestore.Timestamp.now(),

    seenBy:[currentUser.uid]

});
selectedFiles = [];

imageInput.value = "";

document.getElementById("imagePreview").innerHTML = "";

messageInput.value = "";
replyMessage = null;


const preview =
document.getElementById("replyPreview");


if(preview){

    preview.innerHTML="";

    preview.classList.remove("active");

}
return;

}
    const now =
    firebase.firestore
    .Timestamp
    .now();



    const urlRegex = /(https?:\/\/[^\s]+)/i;

const link = urlRegex.test(text)
? text.match(urlRegex)[0]
: "";

await db
.collection("conversations")
.doc(conversationId)
.collection("messages")
.add({

    senderId: currentUser.uid,

    text: text,

    link: link,

    image: imageUrl,

   video: videoUrl,

replyTo: replyMessage,

pinned: false,

    createdAt: now,

    seenBy:[
        currentUser.uid
    ]

});
const convSnap = await db
.collection("conversations")
.doc(conversationId)
.get();

const receiverUid = convSnap.data().members.find(
    uid => uid !== currentUser.uid
);

await db
.collection("users")
.doc(receiverUid)
.collection("activities")
.add({

    type:"message",

    uid: currentUser.uid,

    conversationId: conversationId,

    preview:"",

    read:false,

    createdAt: firebase.firestore.Timestamp.now()

});


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

replyMessage = null;

const preview =
document.getElementById("replyPreview");

if(preview){

    preview.innerHTML="";

    preview.classList.remove("active");

}


selectedFiles = [];

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
blockState = await isBlocked(
    currentUser.uid,
    otherUid
);

if(blockState.iBlocked){

    alert("Bạn đã chặn người này.");

    return;

}

if(blockState.blockedMe){

    alert("Người này đã chặn bạn.");

    return;

}

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
        .toLocaleString(
            "vi-VN",
            {
                day:"2-digit",
                month:"2-digit",
                year:"numeric",
                hour:"2-digit",
                minute:"2-digit"
            }
        );

    }

    return "";

}
function formatDuration(sec){

sec=Number(sec)||0;

const h=Math.floor(sec/3600);

const m=Math.floor((sec%3600)/60);

const s=sec%60;

if(h){

return `${h} giờ ${m} phút ${s} giây`;

}

if(m){

return `${m} phút ${s} giây`;

}

return `${s} giây`;

}

function formatFullDate(time){

if(!time)return "";

return time.toDate().toLocaleString(
"vi-VN",
{

day:"2-digit",

month:"2-digit",

year:"numeric",

hour:"2-digit",

minute:"2-digit",

second:"2-digit"

}

);

}
window.callAgain=function(uid,type){

window.location.href=

type==="video"

?

`call.html?uid=${uid}&video=1`

:

`call.html?uid=${uid}`;

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

   selectedFiles = Array.from(imageInput.files);

const preview =
document.getElementById("imagePreview");

preview.innerHTML="";

selectedFiles.forEach(file=>{

const url =
URL.createObjectURL(file);

if(file.type.startsWith("image")){

preview.innerHTML += `
<img src="${url}">
`;

}else{

preview.innerHTML += `
<video
src="${url}"
controls
muted></video>
`;

}

});


};

}

if(messageInput){


messageInput.addEventListener("input",()=>{


if(!currentUser) return;



db.collection("conversations")
.doc(conversationId)
.update({

[`typing.${currentUser.uid}`]: true

});



clearTimeout(typingTimer);



typingTimer=setTimeout(()=>{


db.collection("conversations")
.doc(conversationId)
.update({

[`typing.${currentUser.uid}`]: false

});


},1500);



});



messageInput.addEventListener("blur",()=>{


if(!currentUser) return;


db.collection("conversations")
.doc(conversationId)
.update({

[`typing.${currentUser.uid}`]: false

});


});



messageInput.addEventListener(
"keydown",
e=>{


if(e.key==="Enter"){

sendMessage();

}


});


}





if(backBtn){

backBtn.onclick=()=>{

    history.back();

};

}
if(audioCallBtn){

    audioCallBtn.onclick = async ()=>{

        const userSnap = await db
        .collection("users")
        .doc(otherUid)
        .get();

        if(userSnap.exists){

            const u = userSnap.data();

            callAvatar.src =
                u.avatar || "https://i.ibb.co/Z1kv9nJj/logo.png";

            callName.textContent =
                u.name || "Người dùng";

        }

        callStatus.textContent = "Đang gọi...";

        callPopup.classList.remove("hidden");

        rejectBtn.classList.remove("hidden");
        acceptBtn.classList.add("hidden");
        endBtn.classList.add("hidden");

    };

}
rejectBtn.onclick = ()=>{

    callPopup.classList.add("hidden");

};

// ================================
// AUTH START
// ================================

auth.onAuthStateChanged(
user=>{
document.addEventListener(
"click",
()=>{

    messageSound.play()
    .then(()=>{

        messageSound.pause();

        messageSound.currentTime = 0;

    })
    .catch(()=>{});


},
{
    once:true
});

if(user){


    currentUser =
    user;
    initCallSystem({
    db,
    auth,
    conversationId,
    currentUser
});
    loadChatInfo();


    loadMessages();
    listenTyping();
    if(window.loadTheme){
    window.loadTheme(conversationId);
}

if(window.listenTheme){
    window.listenTheme(conversationId);
}

db.collection("conversations")
.doc(conversationId)
.update({
    [`unread.${currentUser.uid}`]:0
});
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
window.showChatGallery = function(images,startIndex=0){

let index=startIndex;

const popup=document.createElement("div");

popup.className="chat-image-viewer";

popup.innerHTML=`
<div class="gallery-wrap">

<img id="galleryImg" src="${images[index]}">

<button id="galleryPrev">&#10094;</button>

<button id="galleryNext">&#10095;</button>

<button id="galleryClose">&times;</button>

</div>
`;

document.body.appendChild(popup);

const img=
popup.querySelector("#galleryImg");
let startX = 0;
let endX = 0;

img.addEventListener("touchstart",(e)=>{

startX = e.changedTouches[0].clientX;

},{passive:true});

img.addEventListener("touchend",(e)=>{

endX = e.changedTouches[0].clientX;

const diff = endX - startX;

if(Math.abs(diff) < 50) return;

// vuốt sang trái -> ảnh tiếp theo
if(diff < 0){

index++;

if(index >= images.length){

index = 0;

}

img.src = images[index];

}

// vuốt sang phải -> ảnh trước
else{

index--;

if(index < 0){

index = images.length - 1;

}

img.src = images[index];

}

},{passive:true});
popup.querySelector("#galleryPrev").onclick=(e)=>{

e.stopPropagation();

index--;

if(index<0)
index=images.length-1;

img.src=images[index];

};

popup.querySelector("#galleryNext").onclick=(e)=>{

e.stopPropagation();

index++;

if(index>=images.length)
index=0;

img.src=images[index];

};

popup.querySelector("#galleryClose").onclick=(e)=>{

e.stopPropagation();

popup.remove();

};

popup.onclick=(e)=>{

if(e.target===popup){

popup.remove();

}

};

};
function listenTyping(){


const typingStatus =
document.getElementById("typingStatus");


if(!typingStatus) return;



db.collection("conversations")
.doc(conversationId)
.onSnapshot(snap=>{


const data=snap.data();


if(!data || !data.typing){

typingStatus.innerHTML="";
return;

}



const otherUid =
Object.keys(data.typing)
.find(uid=>uid !== currentUser.uid);



if(
otherUid &&
data.typing[otherUid] === true
){


typingStatus.innerHTML =
`
<span>Đang soạn tin</span>
<span class="typing-dot">...</span>
`;



}else{


typingStatus.innerHTML="";


}


});


}
const infoBtn = document.getElementById("infoBtn");

if(infoBtn){

    infoBtn.onclick = async ()=>{

        const snap = await db
        .collection("conversations")
        .doc(conversationId)
        .get();


        if(!snap.exists) return;


        const data = snap.data();


        const otherUid =
        data.members.find(
            uid => uid !== currentUser.uid
        );


        if(!otherUid) return;


        window.location.href =
        "chat-info.html?uid="
        + otherUid
        + "&chatId="
        + conversationId;

    };

}
// ================================
// PIN MESSAGE
// ================================

window.pinMessage = async function(messageId){

    await db
    .collection("conversations")
    .doc(conversationId)
    .collection("messages")
    .doc(messageId)
    .update({

        pinned: true

    });

};
// ================================
// LOAD CHAT THEME
// ================================

window.loadTheme = async function(chatId){

    if(!chatId) return;

    const doc = await db
        .collection("conversations")
        .doc(chatId)
        .get();

    if(!doc.exists) return;

    const data = doc.data();

    const theme = data.theme;

if(theme){

    document.body.dataset.theme = theme;

}else{

    document.body.dataset.theme = "default";

}


const bg = data.themeImage;
if(bg){

   const messageArea = document.getElementById("messageBox");

if(messageArea){
    messageArea.style.backgroundImage = `url(${bg})`;
    messageArea.style.backgroundSize = "cover";
    messageArea.style.backgroundPosition = "center";
    messageArea.style.backgroundRepeat = "no-repeat";
}
}else{

    const messageArea = document.getElementById("messageBox");

if(messageArea){
    messageArea.style.backgroundImage = "";
}

}
};
// ================================
// LISTEN THEME REALTIME
// ================================

window.listenTheme = function(chatId){

    db.collection("conversations")
    .doc(chatId)
    .onSnapshot(doc=>{

        if(!doc.exists) return;

        const data = doc.data();

       document.body.dataset.theme =
    data.theme || "default";


const bg =
    data.themeImage || "";

        if(bg){

           const messageArea = document.getElementById("messageBox");

if(messageArea){
    messageArea.style.backgroundImage = `url(${bg})`;
    messageArea.style.backgroundSize = "cover";
    messageArea.style.backgroundPosition = "center";
    messageArea.style.backgroundRepeat = "no-repeat";
}
        }else{

           const messageArea = document.getElementById("messageBox");

if(messageArea){
    messageArea.style.backgroundImage = "";
}

        }

    });

}
// ================================
// REPLY MESSAGE
// ================================

window.replyMessageFn = function(
id,
text,
senderId
){

replyMessage = {
    id: id,
    text: text,
    senderId: senderId
};


const preview =
document.getElementById("replyPreview");


if(preview){

    preview.innerHTML =
    `
    <span class="reply-text">
        ↩ ${escapeHTML(text)}
    </span>

    <button 
    class="reply-close"
    onclick="cancelReply()">
        ×
    </button>
    `;

    preview.classList.add("active");

}


messageInput.focus();

};

window.scrollToMessage = function(id){


const el =
document.querySelector(
`[data-message-id="${id}"]`
);


if(el){

el.scrollIntoView({

behavior:"smooth",
block:"center"

});

}


};
// ================================
// CANCEL REPLY
// ================================

window.cancelReply = function(){

    replyMessage = null;


    const preview =
    document.getElementById("replyPreview");


    if(preview){

        preview.innerHTML = "";

        preview.classList.remove("active");

    }

};
// ================================
// RECALL MESSAGE
// ================================

window.recallMessage = async function(id){

    if(!confirm("Thu hồi tin nhắn này?"))
    return;

    await db
    .collection("conversations")
    .doc(conversationId)
    .collection("messages")
    .doc(id)
    .update({

        text:"Tin nhắn đã được thu hồi",
        image:"",
        images:[],
        video:"",
        recalled:true

    });
const replies = await db
.collection("conversations")
.doc(conversationId)
.collection("messages")
.where("replyTo.id", "==", id)
.get();

const batch = db.batch();

replies.forEach(docSnap => {

    const data = docSnap.data();

    batch.update(docSnap.ref, {

        replyTo: {

            ...(data.replyTo || {}),

            text: "Tin nhắn đã thu hồi",

            recalled: true

        }

    });

});

await batch.commit();
    await db
    .collection("conversations")
    .doc(conversationId)
    .update({

        lastMessage:"Tin nhắn đã được thu hồi",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()

    });

};
document.addEventListener("voiceRecorded",async(e)=>{

    const voice=e.detail;

    console.log(voice);

    /*
        blob
        duration
        fileName
    */

});
