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
