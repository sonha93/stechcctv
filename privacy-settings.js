// =====================================
// PRIVACY SETTINGS
// =====================================

import { db, auth } from "./firebase-init.js";

// ================================
// ELEMENT
// ================================

const privacyBtn =
document.getElementById("privateBtn");

const privacyPage =
document.getElementById("privacyPage");

const closePrivacyPage =
document.getElementById("closePrivacyPage");

const privateAccount =
document.getElementById("privateAccount");

const hideProfile =
document.getElementById("hideProfile");

const hideFollowList =
document.getElementById("hideFollowList");

const friendOnlyMessage =
document.getElementById("friendOnlyMessage");

const limitMessage =
document.getElementById("limitMessage");

const storyFriendOnly =
document.getElementById("storyFriendOnly");

// ================================
// OPEN
// ================================

if(privacyBtn){

    privacyBtn.onclick = async()=>{

        privacyPage.classList.add("active");

        await loadPrivacy();

    };

}

if(closePrivacyPage){

    closePrivacyPage.onclick = ()=>{

        privacyPage.classList.remove("active");

    };

}

// ================================
// LOAD
// ================================

async function loadPrivacy(){

    const user = auth.currentUser;

    if(!user) return;

    const snap =
    await db.collection("users")
    .doc(user.uid)
    .collection("private")
    .doc("privacy")
    .get();

    if(!snap.exists){

        return;

    }

    const data =
    snap.data() || {};

    privateAccount.checked =
    !!data.privateAccount;

    hideProfile.checked =
    !!data.hideProfile;

    hideFollowList.checked =
    !!data.hideFollowList;

    friendOnlyMessage.checked =
    !!data.friendOnlyMessage;

    limitMessage.checked =
    !!data.limitMessage;

    storyFriendOnly.checked =
    !!data.storyFriendOnly;

}

// ================================
// SAVE
// ================================

async function savePrivacy(){

    const user =
    auth.currentUser;

    if(!user) return;

    await db.collection("users")
    .doc(user.uid)
    .collection("private")
    .doc("privacy")
    .set({

        privateAccount:
        privateAccount.checked,

        hideProfile:
        hideProfile.checked,

        hideFollowList:
        hideFollowList.checked,

        friendOnlyMessage:
        friendOnlyMessage.checked,

        limitMessage:
        limitMessage.checked,

        storyFriendOnly:
        storyFriendOnly.checked,

        updatedAt:
        firebase.firestore.FieldValue.serverTimestamp()

    },{

        merge:true

    });

}

// ================================
// EVENT
// ================================

[
privateAccount,
hideProfile,
hideFollowList,
friendOnlyMessage,
limitMessage,
storyFriendOnly

].forEach(item=>{

    if(item){

        item.onchange =
        savePrivacy;

    }

});
