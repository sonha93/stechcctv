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

        history.back();

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
    limitThreeMessages:true,

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

    const uid = auth.currentUser.uid;

    await db.collection("users")
    .doc(uid)
    .collection("private")
    .doc("settings")
    .set({

        [key]:value,

        updatedAt:
        firebase.firestore.FieldValue.serverTimestamp()

    },{

        merge:true

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

    // ======================
    // NHẮN TIN
    // ======================

    if(!controls.allowMessage.checked){

        controls.messageRequest.disabled = true;

        controls.limitThreeMessages.disabled = true;

        return;

    }

    controls.messageRequest.disabled = false;

    if(!controls.messageRequest.checked){

        controls.limitThreeMessages.disabled = true;

    }else{

        controls.limitThreeMessages.disabled = false;

    }

}
// tài khoản riêng tư

if(!controls.privateAccount.checked){

    controls.showFollow.disabled = false;

}else{

    controls.showFollow.disabled = false;

}

// nếu ẩn profile

if(!controls.showProfile.checked){

    controls.showStory.disabled = true;

    controls.showVideos.disabled = true;

}else{

    controls.showStory.disabled = false;

    controls.showVideos.disabled = false;

}
