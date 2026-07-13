// ================================
// NOTIFICATIONS V8
// ================================

import { db, auth } from "./firebase-init.js";

import {
    acceptFollowRequest,
    rejectFollowRequest,
    getMyFollowRequests
} from "./follow_requests.js";


// ================================
// DOM
// ================================

const list = document.getElementById("notificationList");

const popup = document.getElementById("notificationPopup");


// ================================
// AUTH
// ================================

auth.onAuthStateChanged(user=>{

    if(!user) return;

    loadNotifications();

});


// ================================
// OPEN POPUP
// ================================

window.openNotification = function(){

    if(popup){

        popup.style.display = "flex";

    }

    loadNotifications();

};


// ================================
// CLOSE POPUP
// ================================

window.closeNotification = function(){

    if(popup){

        popup.style.display = "none";

    }

};


// ================================
// LOAD FOLLOW REQUEST
// ================================

async function loadNotifications(){

    if(!list) return;


    list.innerHTML = `
        <div class="notify-empty">
            Đang tải...
        </div>
    `;


    try{


        const requests = await getMyFollowRequests();


        list.innerHTML = "";


        if(requests.length === 0){


            list.innerHTML = `

            <div class="notify-empty">

                Không có thông báo

            </div>

            `;

            return;

        }



        for(const item of requests){


            const data = item.data();



            const userSnap =
            await db
            .collection("users")
            .doc(data.from)
            .get();



            if(!userSnap.exists) continue;



            const u = userSnap.data();



            list.innerHTML += `

            <div 
            class="notify-item"
            id="request-${item.id}">


                <img
                class="notify-avatar"
                src="${
                    u.avatar ||
                    "./avatar.png"
                }">


                <div class="notify-content">


                    <div class="notify-title">

                        <b>
                        ${u.name || "Người dùng"}
                        </b>

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



    }catch(e){

        console.error(
            "Lỗi tải thông báo:",
            e
        );


    }


}



// ================================
// BUTTON
// ================================

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
