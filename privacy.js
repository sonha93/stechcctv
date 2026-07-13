// =====================================
// PRIVACY JS FIREBASE V8
// =====================================

import { db, auth } from "./firebase-init.js";

// =====================================
// ELEMENT
// =====================================

const backBtn =
document.getElementById("backBtn");

const ids = [

"privateAccount",

"showProfile",

"showStory",

"showVideos",

"showLikes",

"showFollow",

"allowMessage",

"messageRequest",

"limitThreeMessages",

"allowComment",

"allowLike",

"allowShare",

"allowMention",

"showOnline",

"allowSearch",

"syncContacts",

"showLocation"

];
const controls = {};

ids.forEach(id=>{

    controls[id] =
    document.getElementById(id);

});

// =====================================
// BACK
// =====================================

if(backBtn){

    backBtn.onclick = ()=>{

        location.href = "profile-review.html";

    };

}

// =====================================
// DEFAULT
// =====================================

const DEFAULT_SETTINGS = {

    privateAccount:false,

    showProfile:true,

    showStory:true,

    showVideos:true,

    showLikes:true,

    showFollow:true,

    allowMessage:true,

    messageRequest:true,

    limitThreeMessages:false,

    allowComment:true,

    allowLike:true,

    allowShare:true,

    allowMention:true,

    showOnline:true,

    allowSearch:true,

    syncContacts:false,

    showLocation:false

};
// =====================================
// CHECK LOGIN
// =====================================

auth.onAuthStateChanged(async user=>{

    if(!user){

        location.href="review.html";
        return;

    }

    await loadPrivacy();

});
// =====================================
// LOAD
// =====================================

async function loadPrivacy(){

    const uid = auth.currentUser.uid;

    const ref =
    db.collection("users")
    .doc(uid)
    .collection("private")
    .doc("settings");

    const snap =
    await ref.get();

    let data;

    if(!snap.exists){

        await ref.set(DEFAULT_SETTINGS);

        data = DEFAULT_SETTINGS;

    }else{

        data = {

            ...DEFAULT_SETTINGS,

            ...snap.data()

        };

    }

    ids.forEach(id=>{

        if(controls[id]){

            controls[id].checked =
            !!data[id];

        }

    });

    bindEvents();

    updateDepend();

}
// =====================================
// SAVE
// =====================================

async function savePrivacy(key,value){

    const user = auth.currentUser;

    if(!user){
        console.log("Chưa đăng nhập");
        return;
    }

    await db.collection("users")
    .doc(user.uid)
    .collection("private")
    .doc("settings")
    .set({

        [key]: value,

        updatedAt: new Date()

    },{
        merge:true
    })
    .then(()=>{

        console.log("Đã lưu:", key, value);

    })
    .catch(error=>{

        console.error("Lỗi lưu privacy:", error);

    });

}
// =====================================
// BIND
// =====================================

function bindEvents(){

    ids.forEach(id=>{

        const el = controls[id];

        if(!el) return;

        el.onchange = async ()=>{

            await savePrivacy(

                id,

                el.checked

            );

            updateDepend();

        };

    });

}
// =====================================
// DEPEND
// =====================================

function updateDepend(){

    // Nếu tài khoản riêng tư bật
    // có thể giới hạn một số hiển thị

    if(
        controls.privateAccount
    ){

        const privateMode =
        controls.privateAccount.checked;


        if(controls.showProfile){

            controls.showProfile.disabled =
            privateMode;

        }


        if(controls.showFollow){

            controls.showFollow.disabled =
            privateMode;

        }

    }


    // Nếu không cho nhắn tin
    // khóa yêu cầu tin nhắn

    if(
        controls.allowMessage &&
        controls.messageRequest
    ){

        if(
            !controls.allowMessage.checked
        ){

            controls.messageRequest.disabled = true;

            controls.messageRequest.checked = false;

        }
        else{

            controls.messageRequest.disabled = false;

        }

    }

}
