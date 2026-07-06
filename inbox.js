import { app } from "./auth.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {

    getFirestore,

    collection,

    query,

    where,

    orderBy,

    onSnapshot,

    updateDoc,

    doc,

    Timestamp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let unsubscribeInbox = null;
let unsubscribeBadge = null;

function listenNotificationBadge() {

    if (!currentUser) return;

    const q = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
    );

    if (unsubscribeBadge) {
        unsubscribeBadge();
    }

    unsubscribeBadge = onSnapshot(q, snap => {

        let unreadCount = 0;

        snap.forEach(docSnap => {
            if (!docSnap.data().read) unreadCount++;
        });

        const badge = document.getElementById("notifyBadge");

        if (!badge) return;

        if (unreadCount > 0) {
            badge.style.display = "flex";
            badge.textContent = unreadCount > 99 ? "99+" : unreadCount;
        } else {
            badge.style.display = "none";
        }

    });

}
let unreadCount = 0;
onAuthStateChanged(auth, user => {

    currentUser = user;

    if (user) {
        listenNotificationBadge();
    }

});

function timeAgo(time){

    if(!time) return "";

    let date;

    if(time instanceof Timestamp){

        date = time.toDate();

    }else{

        date = new Date(time);

    }

    const sec =
        Math.floor((Date.now()-date.getTime())/1000);

    if(sec<60) return "Vừa xong";

    const min=Math.floor(sec/60);

    if(min<60)
        return min+" phút trước";

    const hour=Math.floor(min/60);

    if(hour<24)
        return hour+" giờ trước";

    const day=Math.floor(hour/24);

    if(day<30)
        return day+" ngày trước";

    const month=Math.floor(day/30);

    if(month<12)
        return month+" tháng trước";

    return Math.floor(month/12)+" năm trước";

}

window.openInbox=function(){

    if(!currentUser){

        alert("Bạn chưa đăng nhập");

        return;

    }

    const sheet =
        document.getElementById("inboxSheet");

    sheet.classList.add("active");

    loadInbox();

}

window.closeInbox=function(){

    document
        .getElementById("inboxSheet")
        .classList.remove("active");

    if(unsubscribeInbox){

        unsubscribeInbox();

        unsubscribeInbox=null;

    }

}

function loadInbox(){

    const list =
        document.getElementById("inboxList");

    list.innerHTML=`
        <div class="loadingInbox">
            Đang tải...
        </div>
    `;

    const q=query(

        collection(db,"notifications"),

        where(
            "userId",
            "==",
            currentUser.uid
        ),

        orderBy(
            "createdAt",
            "desc"
        )

    );

    if(unsubscribeInbox){

        unsubscribeInbox();

    }

    unsubscribeInbox=onSnapshot(q,snap=>{

        if(snap.empty){

            list.innerHTML=`

            <div class="emptyInbox">

                <div class="emptyIcon">📭</div>

                <div>

                    Chưa có thông báo

                </div>

            </div>

            `;

            return;

        }

        list.innerHTML="";
      unreadCount = 0;
        snap.forEach(docSnap=>{

            const n=docSnap.data();
               if (!n.read) unreadCount++; 
            const image =
                n.image ||
                "https://i.ibb.co/Z1kv9nJj/logo.png";

            const unread =
                !n.read
                ? `<div class="notifyDot"></div>`
                : "";

           const statusIcon = {

    pending: "📦",
    confirmed: "✅",
    shipping: "🚚",
    delivered: "🎉",
    cancelled: "❌",
    returnApproved: "↩️",
    returnRejected: "⛔"

}[n.status] || "📦";

list.innerHTML += `

<div class="notifyItem"
     onclick="openOrder('${docSnap.id}','${n.orderId}')">

    <div class="notifyLeft">

        <div class="notifyStatus">

            ${statusIcon}

        </div>

    </div>

    <div class="notifyContent">

        <div class="notifyTitle">

            ${n.title}

        </div>

        <div class="notifyMessage">

            ${n.message}

        </div>

        <div class="notifyTime">

            ${timeAgo(n.createdAt)}

        </div>

    </div>

    <img
        class="notifyImage"
        src="${image}">

    ${unread}

</div>

`;



   });

     const badge = document.getElementById("notifyBadge");

if (badge) {

    if (unreadCount > 0) {

        badge.style.display = "flex";
        badge.textContent = unreadCount > 99 ? "99+" : unreadCount;

    } else {

        badge.style.display = "none";

    }

}   

    });

}
window.openOrder = async function(notificationId, orderId){

    try{

        await updateDoc(
            doc(db,"notifications",notificationId),
            {
                read:true
            }
        );

    }catch(e){
        console.error(e);
    }

    // Tạm thời chuyển sang trang chi tiết
    // Sau này làm order-detail.html sẽ tự đọc id này
    window.location.href =
        "order-detail.html?id="+orderId;

}


// Đánh dấu tất cả đã đọc
window.readAllNotifications = async function(){

    if(!currentUser) return;

    const q = query(
        collection(db,"notifications"),
        where("userId","==",currentUser.uid)
    );

    const unsubscribe = onSnapshot(q,async snap=>{

        unsubscribe();

        for(const d of snap.docs){

            if(!d.data().read){

                try{

                    await updateDoc(
                        doc(db,"notifications",d.id),
                        {
                            read:true
                        }
                    );

                }catch(e){
                    console.error(e);
                }

            }

        }

    });
}


// Refresh thủ công
window.reloadInbox=function(){

    if(unsubscribeInbox){

        unsubscribeInbox();

        unsubscribeInbox=null;

    }

    loadInbox();

}


// Đóng bằng phím ESC (PC)
document.addEventListener("keydown",e=>{

    if(e.key==="Escape"){

        const sheet =
            document.getElementById("inboxSheet");

        if(sheet &&
           sheet.classList.contains("active")){

            closeInbox();

        }

    }

});


// Đóng khi bấm nền tối
window.closeInboxBackground=function(e){

    if(e.target.id==="inboxSheet"){

        closeInbox();

    }

}
