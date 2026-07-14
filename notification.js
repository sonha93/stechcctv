// ================================
// NOTIFICATION (FIREBASE V8)
// ================================

import { db, auth } from "./firebase-init.js";

import {
    acceptFollowRequest,
    rejectFollowRequest,
    getMyFollowRequests
} from "./follow_requests.js";

const list = document.getElementById("notificationList");

auth.onAuthStateChanged(user=>{

    if(!user) return;

    loadNotifications();

});

// ================================
// LOAD
// ================================

async function loadNotifications(){

    if(!list) return;

    list.innerHTML = "";

    const requests = await getMyFollowRequests();
    
const notifications = await getNotifications();

console.log("NOTIFICATIONS:", notifications);
    for(const item of requests){

        const data = item.data();

        const userSnap = await db
.collection("users")
.doc(data.from)
.get();

        if(!userSnap.exists){
    console.log("Không tìm thấy user gửi:", data.from);
    continue;
}

        const u = userSnap.data();

        list.innerHTML += `

<div class="notify-item" id="request-${item.id}">

    <img
        src="${u.avatar || "https://i.ibb.co/Z1kv9nJj/logo.png"}"
        class="notify-avatar">

    <div class="notify-content">

        <div class="notify-title">

            <b>${u.name || "Người dùng"}</b>
            đã gửi lời mời theo dõi bạn

        </div>

        <div class="notify-action">

            <button
                class="acceptBtn"
                data-id="${item.id}">
                Chấp nhận
            </button>

            <button
                class="rejectBtn"
                data-id="${item.id}">
                Từ chối
            </button>

        </div>

    </div>

</div>

`;

    }
for(const item of notifications){

        const data = item.data();

        const userSnap = await db
        .collection("users")
        .doc(data.senderId)
        .get();

        if(!userSnap.exists) continue;

        const u = userSnap.data();

       list.innerHTML += `

<div class="notify-item">

    <img
        src="${u.avatar || "https://i.ibb.co/Z1kv9nJj/logo.png"}"
        class="notify-avatar"
        data-uid="${data.senderId}">

    <div class="notify-content" data-uid="${data.senderId}">

        <div class="notify-name">
            <b>${u.name || "Người dùng"}</b>
        </div>

        <div class="notify-username">
            @${u.username || ""}
        </div>

        <div class="notify-text">
            Đã theo dõi bạn
        </div>

    </div>

</div>

`;

    }
    bindButtons();

}

async function getNotifications(){

    const snap = await db
    .collection("notifications")
    .where("receiverId","==",auth.currentUser.uid)
    .orderBy("createdAt","desc")
    .get();

    return snap.docs;
}
// ================================
// BUTTON
// ================================

function bindButtons(){

    document
    .querySelectorAll(".acceptBtn")
    .forEach(btn=>{

      btn.onclick = async()=>{

    try{

        await acceptFollowRequest(btn.dataset.id);

        document
        .getElementById("request-"+btn.dataset.id)
        ?.remove();

    }catch(e){

        console.error(e);
        alert(e.message);

    }

};

    });

    document
    .querySelectorAll(".rejectBtn")
    .forEach(btn=>{

        btn.onclick = async()=>{

            await rejectFollowRequest(btn.dataset.id);

            document
            .getElementById("request-"+btn.dataset.id)
            ?.remove();

        };

    });

}
