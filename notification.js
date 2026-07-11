// ================================
// NOTIFICATION
// ================================

import { app, auth } from "./auth.js";

import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    acceptFollowRequest,
    rejectFollowRequest,
    getMyFollowRequests
} from "./follow_requests.js";

const db = getFirestore(app);

const list = document.getElementById("notificationList");

auth.onAuthStateChanged(async user=>{

    if(!user) return;

    loadNotifications();

});
async function loadNotifications(){

    list.innerHTML = "";

    const requests = await getMyFollowRequests();

    for(const item of requests){

        const data = item.data();

        const userSnap = await getDoc(
            doc(db,"users",data.from)
        );

        if(!userSnap.exists()) continue;

        const u = userSnap.data();

        list.innerHTML += `

<div class="notify-item" id="request-${item.id}">

<img
src="${u.avatar || 'https://i.ibb.co/Z1kv9nJj/logo.png'}"
class="notify-avatar">

<div class="notify-content">

<div class="notify-title">

<b>${u.name}</b>
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
function bindButtons(){

    document
    .querySelectorAll(".acceptBtn")
    .forEach(btn=>{

        btn.onclick = async()=>{

            await acceptFollowRequest(
                btn.dataset.id
            );

            document
            .getElementById(
                "request-"+btn.dataset.id
            )
            ?.remove();

        };

    });

    document
    .querySelectorAll(".rejectBtn")
    .forEach(btn=>{

        btn.onclick = async()=>{

            await rejectFollowRequest(
                btn.dataset.id
            );

            document
            .getElementById(
                "request-"+btn.dataset.id
            )
            ?.remove();

        };

    });

}
