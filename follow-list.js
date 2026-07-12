import { app, auth } from "./auth.js";
import { getVerifiedBadge } from "./verified-users.js";
import {
    sendFollowRequest,
    cancelFollowRequest,
    hasPendingFollowRequest,
    isFollowing,
    isFriend
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

const profileUid = params.get("uid");
const type = params.get("type") || "followers";

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

document.getElementById("backBtn").onclick = () => history.back();

let allUsers = [];

onAuthStateChanged(auth, async () => {

    await loadUsers();

});
async function loadUsers(){

    loading.style.display = "block";

    empty.style.display = "none";

    userList.innerHTML = "";

    allUsers = [];

    const snap = await getDocs(

        query(
            collection(
                db,
                "users",
                profileUid,
                type
            ),
            orderBy("__name__")
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

    if(await isFriend(u.uid)){

        buttonHtml = `
        <button
        class="follow-btn friend"
        data-uid="${u.uid}">
            Bạn bè
        </button>
        `;

    }

    else if(await isFollowing(u.uid)){

        buttonHtml = `
        <button
        class="follow-btn following"
        data-uid="${u.uid}">
            Đã follow
        </button>
        `;

    }

    else if(await hasPendingFollowRequest(u.uid)){

        buttonHtml = `
        <button
        class="follow-btn request"
        data-uid="${u.uid}">
            Đã gửi
        </button>
        `;

    }

    else{

        buttonHtml = `
        <button
        class="follow-btn follow"
        data-uid="${u.uid}">
            Follow
        </button>
        `;

    }

}
        userList.insertAdjacentHTML(
            "beforeend",
            `
            <div class="user-item">

               <<img
class="user-avatar"
data-uid="${u.uid}"
onclick="location.href='profile-review.html?uid=${u.uid}'"
src="${
    u.avatar ||
    "https://i.ibb.co/Z1kv9nJj/logo.png"
}">

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

        if(btn.classList.contains("friend")){
            return;
        }

        if(btn.classList.contains("follow")){

            await sendFollowRequest(uid);

            btn.classList.remove("follow");
            btn.classList.add("request");

            btn.innerText="Đã gửi";

        }

        else if(btn.classList.contains("request")){

            await cancelFollowRequest(uid);

            btn.classList.remove("request");
            btn.classList.add("follow");

            btn.innerText="Follow";

        }

        else if(btn.classList.contains("following")){

            if(!confirm("Hủy follow người này?")){

                btn.disabled=false;
                return;

            }

        await deleteDoc(
    doc(db, "users", auth.currentUser.uid, "following", uid)
);

await deleteDoc(
    doc(db, "users", uid, "followers", auth.currentUser.uid)
);

await updateDoc(
    doc(db, "users", auth.currentUser.uid),
    {
        followingCount: increment(-1)
    }
);

await updateDoc(
    doc(db, "users", uid),
    {
        followerCount: increment(-1)
    }
);
            btn.classList.remove("following");
            btn.classList.add("follow");

            btn.innerText="Follow";

        }

    }finally{

        btn.disabled=false;

    }

});
userList.addEventListener("click", e=>{

    const avatar = e.target.closest(".user-avatar");

    if(!avatar) return;

    const uid = avatar.dataset.uid;

    if(uid){
        window.location.href =
        "profile-review.html?uid=" + uid;
    }

});
