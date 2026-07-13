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

"hideProfile",
"hideFollowList",

"friendOnlyMessage",
"limitMessage",

"storyFriendOnly",

"showOnline",

"allowMention",

"allowVoiceCall",

"allowVideoCall",

"searchByUsername"

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

    hideProfile:false,

    hideFollowList:false,


    friendOnlyMessage:false,

    limitMessage:true,


    storyFriendOnly:false,


    showOnline:true,


    allowMention:true,


    allowVoiceCall:true,


    allowVideoCall:true,


    searchByUsername:true

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


    // Ẩn hồ sơ

    if(
        controls.hideProfile &&
        controls.hideProfile.checked
    ){

        if(controls.storyFriendOnly){

            controls.storyFriendOnly.disabled = true;

        }

    }
    else{

        if(controls.storyFriendOnly){

            controls.storyFriendOnly.disabled = false;

        }

    }


    // Tin nhắn

    if(
        controls.friendOnlyMessage &&
        controls.limitMessage
    ){

        controls.limitMessage.disabled = false;

    }


}
