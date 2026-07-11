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

console.log(
"Đăng nhập:",
user.uid
);

});

// =====================================
// GET PARAM
// =====================================

const params =
new URLSearchParams(location.search);


const uid =
params.get("uid");


const chatId =
params.get("chatId");
console.log("UID:",uid);
console.log("CHAT:",chatId);

// =====================================
// ELEMENT
// =====================================

const avatar =
document.getElementById("avatar");

const username =
document.getElementById("username");

const verified =
document.getElementById("verified");

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


if(!uid)return;


const snap =
await db.collection("users")
.doc(uid)
.get();



if(!snap.exists)return;



const user =
snap.data();



if(avatar){

avatar.src =
user.avatar ||
"default-avatar.png";

}



if(username){

username.innerHTML =
user.name ||
"Người dùng";

}



if(verified && user.verified){

verified.innerHTML =
getVerifiedBadge() || "";

}


}


loadUserInfo();




// =====================================
// LOAD MEDIA
// =====================================

async function loadMedia(){


if(!chatId)return;



const snap =
await db.collection("chats")
.doc(chatId)
.collection("messages")
.orderBy("createdAt","desc")
.get();



let images=[];
let videos=[];
let files=[];
let links=[];



snap.forEach(doc=>{


const msg =
doc.data();



if(msg.image){

images.push(msg.image);

}



if(msg.video){

videos.push(msg.video);

}



if(msg.file){

files.push(msg.file);

}



if(msg.link){

links.push(msg.link);

}



});



console.log({

images,
videos,
files,
links

});


}



loadMedia();





// =====================================
// LOAD PINNED MESSAGE
// =====================================

async function loadPinned(){


if(!chatId)return;



const snap =
await db.collection("chats")
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





// =====================================
// PROFILE
// =====================================

window.openProfile =
function(){


location.href =
"profile-review.html?uid="+uid;


};
