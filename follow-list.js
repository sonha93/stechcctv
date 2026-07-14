import { app, auth } from "./auth.js";
import { getVerifiedBadge } from "./verified-users.js";
   import {
    toggleFollow,
    isFollowing,
    isFriend,
    unfollowUser
} from "./follow_requests.js";
import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    orderBy,
  deleteDoc,
updateDoc,
increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const db = getFirestore(app);



const params = new URLSearchParams(location.search);
const type = params.get("type") || "followers";

let profileUid = params.get("uid");


const pageTitle = document.getElementById("pageTitle");
const loading = document.getElementById("loading");
const empty = document.getElementById("empty");
const userList = document.getElementById("userList");
const searchInput = document.getElementById("searchInput");

if(pageTitle){
    pageTitle.innerText =
    type === "following"
    ? "Đã follow"
    : "Follower";
}

const backBtn = document.getElementById("backBtn");

if(backBtn){
    backBtn.onclick = () => history.back();
}
let allUsers = [];

onAuthStateChanged(auth, async (user)=>{

    if(!profileUid){
        profileUid = user?.uid;
    }

    if(!profileUid){
        console.error("Không có UID");
        return;
    }

    await loadUsers();

});
async function loadUsers(){

    loading.style.display = "block";

    empty.style.display = "none";

    userList.innerHTML = "";

    allUsers = [];

    const snap = await getDocs(

        collection(
    db,
    "users",
    profileUid,
    type
)

    );

    for(const item of snap.docs){

        const userSnap = await getDoc(
            doc(db,"users",item.id)
        );

        if(!userSnap.exists()) continue;

        const u = userSnap.data();

        allUsers.push({

            uid:item.id,

            ...u

        });

    }

    loading.style.display = "none";

    if(allUsers.length===0){

        empty.style.display="block";

        return;

    }

    renderUsers(allUsers);

}
async function renderUsers(list){

    userList.innerHTML = "";

    for(const u of list){

        let buttonHtml = "";

if(auth.currentUser && auth.currentUser.uid !== u.uid){
   const friend = await isFriend(u.uid);

const following = await isFollowing(u.uid);


if(friend){

buttonHtml = `
<button class="follow-btn following" data-uid="${u.uid}">
    Bạn bè
</button>
`;

}
else if(following){

buttonHtml = `
<button class="follow-btn following" data-uid="${u.uid}">
    Đã gửi
</button>
`;

}
else{

buttonHtml = `
<button class="follow-btn follow" data-uid="${u.uid}">
    Follow
</button>
  
        userList.insertAdjacentHTML(
            "beforeend",
           <div class="user-item" data-uid="${u.uid}">

             <img
class="follow-avatar"
src="${u.avatar || "https://i.ibb.co/Z1kv9nJj/logo.png"}"
onclick="location.href='profile-review.html?uid=${u.uid}'">

                <div class="user-info">

                    <div class="user-name">

                        <span class="user-name-text">
                            ${u.name || "Người dùng"}
                        </span>

                        ${getVerifiedBadge(u.uid)}

                    </div>

                    <div class="user-username">

                        @${u.username || ""}

                    </div>

                </div>

                ${buttonHtml}

            </div>
            `
        );

        const item = userList.lastElementChild;

        
        item.querySelector(".user-info").onclick = ()=>{

            location.href =
            `profile-review.html?uid=${u.uid}`;

        };

    }

}
searchInput.oninput = ()=>{

    const keyword =
    searchInput.value
    .trim()
    .toLowerCase();

    if(!keyword){

        renderUsers(allUsers);

        return;

    }

    const result = allUsers.filter(u=>{

        return (

            (u.name || "")
            .toLowerCase()
            .includes(keyword)

            ||

            (u.username || "")
            .toLowerCase()
            .includes(keyword)

        );

    });

    renderUsers(result);

};

document.addEventListener("click",async e=>{

    const btn=e.target.closest(".follow-btn");

    if(!btn) return;


    e.stopPropagation();


    if(!auth.currentUser){

        alert("Bạn cần đăng nhập");

        return;

    }


    const uid=btn.dataset.uid;


    btn.disabled=true;


    try{


        // đang follow thì không hủy ngay nữa
       if(btn.classList.contains("following")){

    openFollowPopup(uid);

    btn.disabled=false;

    return;

}



        // chưa follow
       if(btn.classList.contains("follow")){

    await toggleFollow(uid);

    btn.classList.remove("follow");
    btn.classList.add("following");

    btn.textContent = "Đã gửi";

}



    }catch(err){

        console.error(err);

        alert("Có lỗi xảy ra");

    }



    btn.disabled=false;


});
async function openFollowPopup(uid){

    document.getElementById("followPopup").style.display="flex";

    document.getElementById("unfollowBtn").onclick = async ()=>{

        await unfollowUser(uid);

        document.getElementById("followPopup").style.display="none";

        loadUsers();

    };

}

document.getElementById("closeFollowPopup").onclick=()=>{

    document.getElementById("followPopup").style.display="none";

};
