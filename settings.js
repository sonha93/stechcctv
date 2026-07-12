// =====================================
// SETTINGS JS FIREBASE V8
// =====================================

import { db, auth } from "./firebase-init.js";

// =====================================
// ELEMENT
// =====================================

const backBtn =
document.getElementById("backBtn");

const logoutBtn =
document.getElementById("logoutBtn");

const autoSaveMedia =
document.getElementById("autoSaveMedia");

const darkMode =
document.getElementById("darkMode");

const notifySwitch =
document.getElementById("notifySwitch");

const blockedList =
document.getElementById("blockedList");

// =====================================
// BACK
// =====================================

if(backBtn){

    backBtn.onclick = ()=>{

        history.back();

    };

}

// =====================================
// CHECK LOGIN
// =====================================

auth.onAuthStateChanged(async user=>{

    if(!user){

        location.href = "login.html";
        return;

    }

    await loadSettings();

    await loadBlockedUsers();

});

// =====================================
// LOAD SETTINGS
// =====================================

async function loadSettings(){

    const user = auth.currentUser;

    if(!user) return;

    const snap =
    await db.collection("users")
    .doc(user.uid)
    .collection("private")
    .doc("settings")
    .get();

    if(!snap.exists) return;

    const data = snap.data() || {};

    autoSaveMedia.checked =
    !!data.autoSaveMedia;

    darkMode.checked =
    !!data.darkMode;

    notifySwitch.checked =
    data.notification !== false;

}
// =====================================
// SAVE SETTINGS
// =====================================

async function saveSettings(){

    const user = auth.currentUser;

    if(!user) return;

    await db.collection("users")
    .doc(user.uid)
    .collection("private")
    .doc("settings")
    .set({

        autoSaveMedia:
        autoSaveMedia.checked,

        darkMode:
        darkMode.checked,

        notification:
        notifySwitch.checked,

        updatedAt:
        firebase.firestore.FieldValue.serverTimestamp()

    },{

        merge:true

    });

}

// =====================================
// SWITCH EVENTS
// =====================================

if(autoSaveMedia){

    autoSaveMedia.onchange =
    saveSettings;

}

if(darkMode){

    darkMode.onchange =
    saveSettings;

}

if(notifySwitch){

    notifySwitch.onchange =
    saveSettings;

}

// =====================================
// LOGOUT
// =====================================

if(logoutBtn){

    logoutBtn.onclick = async ()=>{

        const ok = confirm(
            "Bạn có muốn đăng xuất?"
        );

        if(!ok) return;

        await auth.signOut();

        location.href = "login.html";

    };

}
// =====================================
// SAVE SETTINGS
// =====================================

async function saveSettings(){

    const user = auth.currentUser;

    if(!user) return;

    await db.collection("users")
    .doc(user.uid)
    .collection("private")
    .doc("settings")
    .set({

        autoSaveMedia:
        autoSaveMedia.checked,

        darkMode:
        darkMode.checked,

        notification:
        notifySwitch.checked,

        updatedAt:
        firebase.firestore.FieldValue.serverTimestamp()

    },{

        merge:true

    });

}

// =====================================
// SWITCH EVENTS
// =====================================

if(autoSaveMedia){

    autoSaveMedia.onchange =
    saveSettings;

}

if(darkMode){

    darkMode.onchange =
    saveSettings;

}

if(notifySwitch){

    notifySwitch.onchange =
    saveSettings;

}

// =====================================
// LOGOUT
// =====================================

if(logoutBtn){

    logoutBtn.onclick = async ()=>{

        const ok = confirm(
            "Bạn có muốn đăng xuất?"
        );

        if(!ok) return;

        await auth.signOut();

        location.href = "login.html";

    };

}
// =====================================
// LOAD BLOCKED USERS
// =====================================

async function loadBlockedUsers(){

    const user = auth.currentUser;

    if(!user || !blockedList) return;

    blockedList.innerHTML = "";


    const meSnap =
    await db.collection("users")
    .doc(user.uid)
    .get();


    if(!meSnap.exists){

        blockedList.innerHTML = `
        <div class="empty-block">
            Không có dữ liệu.
        </div>`;

        return;

    }


    const blockedUsers =
    meSnap.data().blockedUsers || [];


    if(blockedUsers.length === 0){

        blockedList.innerHTML = `
        <div class="empty-block">
            Bạn chưa chặn ai.
        </div>`;

        return;

    }


    let html = "";


    for(const uid of blockedUsers){


        const snap =
        await db.collection("users")
        .doc(uid)
        .get();


        if(!snap.exists) continue;


        const u = snap.data();


        html += `

        <div class="block-user">


            <div class="block-left">


                <img
                class="block-avatar"
                src="${
                    u.avatar ||
                    "https://i.ibb.co/Z1kv9nJj/logo.png"
                }">


                <div class="block-name">
                    ${u.name || "Người dùng"}
                </div>


            </div>



            <button
            class="unblock-btn"
            onclick="unblockUser('${uid}')">

                Bỏ chặn

            </button>


        </div>

        `;


    }


    blockedList.innerHTML = html;


}
window.unblockUser = async function(uid){

    const user = auth.currentUser;

    if(!user) return;


    const ref =
    db.collection("users")
    .doc(user.uid);


    const snap =
    await ref.get();


    let blocked =
    snap.data().blockedUsers || [];


    blocked =
    blocked.filter(id => id !== uid);


    await ref.update({

        blockedUsers: blocked

    });


    loadBlockedUsers();


};
