// ================================
// STORY JS FIREBASE V8
// ================================

import { db, auth } from "./firebase-init.js";


// CLOUDINARY
const CLOUDINARY_URL =
"https://api.cloudinary.com/v1_1/dmz9gpp1b/image/upload";

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



const data =
await upload.json();



const now =
firebase.firestore.Timestamp.now();



const expire =
new Date();


expire.setHours(
expire.getHours()+24
);



await db
.collection("stories")
.add({

uid:user.uid,

image:data.secure_url,

createdAt:now,

expiresAt:
firebase.firestore.Timestamp.fromDate(expire)

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


const snap =
await db.collection("stories")
.where("uid","==",uid)
.get();



let story = null;


snap.forEach(doc=>{

const data=doc.data();


if(
data.expiresAt.toDate()
>
new Date()
){

story=data;

}

});



if(!story){

alert("Chưa có story");

return;

}



const popup =
document.createElement("div");


popup.className =
"story-popup";


popup.innerHTML = `

<img src="${story.image}">

`;



popup.onclick=()=>{

popup.remove();

};


document.body.appendChild(
popup
);



};
window.openStory = async function(uid){


const snap =
await db.collection("stories")
.where("uid","==",uid)
.get();



let story=null;


snap.forEach(doc=>{

const s=doc.data();


if(
s.expiresAt.toDate()>new Date()
){

story=s;

}

});



if(!story){

alert("Chưa có tin");

return;

}



const box =
document.createElement("div");


box.className="story-popup";


box.innerHTML=`

<img src="${story.image}">

`;



box.onclick=()=>box.remove();



document.body.appendChild(box);


};
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
