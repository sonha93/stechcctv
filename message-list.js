// ================================
// MESSAGE LIST JS (FIREBASE V8)
// ================================


// Firebase
import { db, auth } from "./firebase-init.js";


// ================================
// ELEMENT
// ================================

const chatList =
document.getElementById("chatList");

const chatCount =
document.getElementById("chatCount");

const emptyChats =
document.getElementById("emptyChats");

const searchInput =
document.getElementById("searchInput");

const clearSearch =
document.getElementById("clearSearch");

const filterBtns =
document.querySelectorAll(".filterBtn");

const toast =
document.getElementById("notificationToast");

const toastText =
document.getElementById("notificationText");



// ================================
// DATA
// ================================

let chats = [];

let currentFilter = "all";



// ================================
// TOAST
// ================================

function showToast(text){

    if(!toast) return;


    if(toastText){

        toastText.textContent = text;

    }


    toast.style.display="flex";


    setTimeout(()=>{

        toast.style.display="none";

    },2000);

}



// ================================
// LOAD CHAT
// ================================
function loadChats(){

const user = auth.currentUser;

if(!user) return;

db.collection("conversations")
.where("members","array-contains",user.uid)
.orderBy("updatedAt","desc")
.onSnapshot(
    snap=>{

        chats=[];

        snap.forEach(doc=>{
            chats.push({
                id:doc.id,
                ...doc.data()
            });
        });

        renderChats();

    },
    err=>{
        console.error("Load chat lỗi:", err);
    }
);
}

// ================================
// RENDER
// ================================

async function renderChats(){


    if(!chatList)
    return;


    const currentUser = auth.currentUser;

    chatList.innerHTML="";



    let list =
    [...chats];



    if(currentFilter==="unread"){


        list =
        list.filter(
            x=>Number(x.unread)>0
        );


    }



    if(currentFilter==="online"){


        list =
        list.filter(
            x=>x.online===true
        );


    }



    if(currentFilter==="shop"){


        list =
        list.filter(
            x=>x.type==="shop"
        );


    }




    const keyword =
    searchInput?.value
    ?.toLowerCase()
    .trim() || "";



    if(keyword){


        list =
        list.filter(x=>{


            return (
                x.name ||
                ""
            )
            .toLowerCase()
            .includes(keyword);


        });


    }




    if(chatCount){

        chatCount.textContent =
        `${list.length} cuộc trò chuyện`;

    }




    if(list.length===0){


        if(emptyChats){

            emptyChats.hidden=false;

        }


        return;

    }



    if(emptyChats){

        emptyChats.hidden=true;

    }




    list.forEach(async chat=>{
    let otherUid = null;


if(chat.members && currentUser){

    otherUid =
    chat.members.find(
        uid => uid !== currentUser.uid
    );

}

        const template =
        document.getElementById(
            "chatItemTemplate"
        );



        if(!template)
        return;



        const node =
        template.content
        .cloneNode(true);



        const item =
        node.querySelector(
            ".chat-item"
        );
let otherUid = null;


if(chat.members){

    otherUid =
    chat.members.find(
        uid => uid !== currentUser.uid
    );

}


let otherUser = {};


if(otherUid){

    const userSnap =
    await db.collection("users")
    .doc(otherUid)
    .get();


    if(userSnap.exists){

        otherUser =
        userSnap.data();

    }

}


        if(!item)
        return;



        item.dataset.conversationId =
        chat.id;



        const name =
        node.querySelector(
            ".chat-name"
        );


        if(name){

    name.textContent =
    otherUser.name ||
    otherUser.displayName ||
    "Người dùng";

}



        const msg =
        node.querySelector(
            ".message-text"
        );


        if(msg){

            msg.textContent =
            chat.lastMessage ||
            "";

        }
        // Badge chưa đọc
const unreadBadge = node.querySelector(".unread-badge");
const unread = Number(chat.unread || 0);

if (unreadBadge) {
    if (unread >= 1) {
        unreadBadge.hidden = false;
        unreadBadge.textContent = unread > 99 ? "99+" : String(unread);
    } else {
        unreadBadge.hidden = true;
        unreadBadge.textContent = "";
    }
}

// Chữ đậm khi chưa đọc
if (name && msg) {
    if (Number(chat.unread || 0) > 0) {
        name.style.fontWeight = "700";
        msg.style.fontWeight = "600";
        msg.style.color = "#fff";
    } else {
        name.style.fontWeight = "500";
        msg.style.fontWeight = "400";
        msg.style.color = "#999";
    }
}
        const time =
        node.querySelector(
            ".chat-time"
        );


        if(time){

            time.textContent =
            formatTime(
                chat.updatedAt
            );

        }




        const avatar =
        node.querySelector(
            ".avatar"
        );


        if(
 avatar
){

 avatar.src =
 otherUser.avatar ||
 otherUser.photoURL ||
 "./avatar.png";

}



        chatList.appendChild(node);


    });


}




// ================================
// TIME
// ================================

function formatTime(time){


    if(!time)
    return "";



    if(time.seconds !== undefined){


        return new Date(
            time.seconds * 1000
        )
        .toLocaleDateString(
            "vi-VN"
        );


    }



    if(time.toDate){


        return time
        .toDate()
        .toLocaleDateString(
            "vi-VN"
        );


    }



    return "";

}



// ================================
// SEARCH
// ================================

if(searchInput){

searchInput.addEventListener(
"input",
()=>{

    renderChats();

});

}



if(clearSearch){

clearSearch.onclick=()=>{


    searchInput.value="";

    renderChats();


};

}



// ================================
// FILTER
// ================================

filterBtns.forEach(btn=>{


btn.onclick=()=>{


    filterBtns.forEach(b=>{

        b.classList.remove(
            "active"
        );

    });



    btn.classList.add(
        "active"
    );



    currentFilter =
    btn.dataset.filter;



    renderChats();


};


});



// ================================
// OPEN CHAT
// ================================

if(chatList){

chatList.addEventListener(
"click",
e=>{


    const item =
    e.target.closest(
        ".chat-item"
    );


    if(!item)
    return;



    const id =
    item.dataset.conversationId;



    location.href =
    `message.html?id=${id}`;


});


}




// ================================
// BUTTON
// ================================

const backBtn =
document.getElementById("backBtn");


if(backBtn){

backBtn.onclick=()=>{

    history.back();

};

}



const newChatBtn =
document.getElementById("newChatBtn");


if(newChatBtn){

newChatBtn.onclick=()=>{

    location.href =
    "new-chat.html";

};

}



// ================================
// AUTH START
// ================================

auth.onAuthStateChanged(
user=>{


    if(user){

        loadChats();

    }


});
