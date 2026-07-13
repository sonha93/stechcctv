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

    console.log("LOAD NOTIFICATIONS");

    if(!list) {
        console.log("Không có notificationList");
        return;
    }

    console.log("UID:", auth.currentUser.uid);
    list.innerHTML = "";

    const snap = await db
        .collection("notifications")
        .where("receiverId","==",auth.currentUser.uid)
        .orderBy("createdAt","desc")
        .get();

    if(snap.empty){
        list.innerHTML = `<div class="notify-empty">Chưa có thông báo</div>`;
        return;
    }

    for(const docSnap of snap.docs){

        const data = docSnap.data();

        if(data.type !== "follow_request") continue;

        const userSnap = await db
            .collection("users")
            .doc(data.senderId)
            .get();

        if(!userSnap.exists) continue;

        const u = userSnap.data();

        list.innerHTML += `
<div class="notify-item" id="request-${data.requestId}">

    <img
        src="${u.avatar || "./avatar.png"}"
        class="notify-avatar">

    <div class="notify-content">

        <div class="notify-title">
            <b>${u.name || "Người dùng"}</b>
            đã gửi lời mời theo dõi bạn
        </div>

        <div class="notify-action">

            <button
                class="acceptBtn"
                data-id="${data.requestId}">
                Chấp nhận
            </button>

            <button
                class="rejectBtn"
                data-id="${data.requestId}">
                Từ chối
            </button>

        </div>

    </div>

</div>`;
    }

    bindButtons();
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
