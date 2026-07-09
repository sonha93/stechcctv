// ================================
// MESSAGE LIST JS
// ================================


// Firebase
import {
    db,
    auth
} from "./firebase.js";

import {
    collection,
    query,
    where,
    orderBy,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



// ================================
// ELEMENT
// ================================

const chatList =
document.getElementById("chatList");

const chatCount =
document.getElementById("chatCount");

const emptyChats =
document.getElementById("emptyChats");

const searchEmpty =
document.getElementById("searchEmpty");

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



// DATA

let chats = [];

let currentFilter = "all";



// ================================
// TOAST
// ================================

function showToast(text){

    if(!toast) return;

    toastText.textContent = text;

    toast.style.display = "flex";


    setTimeout(()=>{

        toast.style.display="none";

    },2000);

}




// ================================
// LOAD CHAT
// ================================

async function loadChats(){

try{


    const user = auth.currentUser;


    if(!user){

        return;

    }


    const q = query(
        collection(db,"conversations"),
        where(
            "members",
            "array-contains",
            user.uid
        ),
        orderBy(
            "updatedAt",
            "desc"
        )
    );


    const snap =
    await getDocs(q);


    chats=[];


    snap.forEach(doc=>{


        chats.push({

            id:doc.id,

            ...doc.data()

        });


    });



    renderChats();



}catch(err){

    console.error(
        "Load chat lỗi:",
        err
    );

}

}




// ================================
// RENDER
// ================================

function renderChats(){


    chatList.innerHTML="";


    let list =
    [...chats];


    if(currentFilter==="unread"){

        list =
        list.filter(
            x=>x.unread>0
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
    searchInput.value
    .toLowerCase()
    .trim();



    if(keyword){

        list =
        list.filter(
            x=>
            (x.name||"")
            .toLowerCase()
            .includes(keyword)
        );

    }



    chatCount.textContent =
    `${list.length} cuộc trò chuyện`;



    if(list.length===0){

        emptyChats.hidden=false;

        return;

    }


    emptyChats.hidden=true;



    list.forEach(chat=>{


        const template =
        document
        .getElementById(
            "chatItemTemplate"
        );


        const node =
        template
        .content
        .cloneNode(true);



        const item =
        node.querySelector(
            ".chat-item"
        );


        item.dataset.conversationId =
        chat.id;



        node.querySelector(
            ".chat-name"
        ).textContent =
        chat.name ||
        "Người dùng";



        node.querySelector(
            ".message-text"
        ).textContent =
        chat.lastMessage ||
        "";



        node.querySelector(
            ".chat-time"
        ).textContent =
        formatTime(
            chat.updatedAt
        );



        if(chat.avatar){

            node.querySelector(
                ".avatar"
            ).src =
            chat.avatar;

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


    if(time.seconds){

        return new Date(
            time.seconds*1000
        )
        .toLocaleDateString(
            "vi-VN"
        );

    }


    return "";

}




// ================================
// SEARCH
// ================================

searchInput
.addEventListener(
"input",
()=>{

    renderChats();

});



clearSearch
.addEventListener(
"click",
()=>{

    searchInput.value="";

    renderChats();

});




// ================================
// FILTER
// ================================

filterBtns
.forEach(btn=>{


btn.onclick=()=>{


    filterBtns
    .forEach(
        b=>b.classList.remove(
            "active"
        )
    );


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

chatList
.addEventListener(
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





// ================================
// BUTTON
// ================================


document
.getElementById("backBtn")
.onclick=()=>{

    history.back();

};



document
.getElementById("newChatBtn")
.onclick=()=>{

    showToast(
        "Tạo cuộc trò chuyện mới"
    );

};





// ================================
// AUTH START
// ================================

auth.onAuthStateChanged(
user=>{


    if(user){

        loadChats();

    }


});
