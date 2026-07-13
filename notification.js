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
const notifySnap = await db
.collection("notifications")
.where("receiverId","==",auth.currentUser.uid)
.orderBy("createdAt","desc")
.get();

for(const docSnap of notifySnap.docs){

    const n = docSnap.data();

    if(n.type !== "follow_request") continue;

    const userSnap = await db
    .collection("users")
    .doc(n.senderId)
    .get();

    if(!userSnap.exists) continue;

    const u = userSnap.data();

    list.innerHTML += `
<div class="notify-item">

<img
src="${u.avatar || "./avatar.png"}"
class="notify-avatar">

<div class="notify-content">

<div class="notify-title">

<b>${u.name || "Người dùng"}</b>
đã gửi lời mời theo dõi bạn

</div>

</div>

</div>
`;
}
    const requests = await getMyFollowRequests();
console.log("FOLLOW REQUESTS:", requests);
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
