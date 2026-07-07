import { app, auth } from "./auth.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    updateDoc,
    deleteDoc,
    setDoc,
    increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(app);

// ===== Lấy uid trên URL =====

const params = new URLSearchParams(location.search);

const profileUid = params.get("uid");


// ===== HTML =====

const avatar = document.getElementById("profileAvatar");

const name = document.getElementById("profileName");

const username = document.getElementById("profileUsername");

const bio = document.getElementById("profileBio");

const followBtn = document.getElementById("followBtn");

const editBtn = document.getElementById("editBtn");

const followingCount = document.getElementById("followingCount");

const followerCount = document.getElementById("followerCount");

const likeCount = document.getElementById("likeCount");
let selectedVideoId = null;

// ===========================
// LOAD USER
// ===========================

async function loadProfile() {

    const snap = await getDoc(doc(db,"users",profileUid));

    if(!snap.exists()){

        alert("Không tìm thấy người dùng");

        return;

    }

    const u = snap.data();

    avatar.src = u.avatar || "https://i.ibb.co/Z1kv9nJj/logo.png";

    name.innerHTML = u.name || "Người dùng";

    username.innerHTML = "@" + (u.username || "");

    bio.innerHTML = u.bio || "";



    followingCount.innerHTML = u.followingCount || 0;

    followerCount.innerHTML = u.followerCount || 0;



    // ===== TÍNH TỔNG LIKE VIDEO =====

    let totalLike = 0;

    const q = query(

        collection(db,"videos"),

        where("uid","==",profileUid)

    );

    const videoSnap = await getDocs(q);

    videoSnap.forEach(d=>{

        totalLike += d.data().likeCount || 0;

    });

    likeCount.innerHTML = totalLike;

}

loadProfile();


// ===========================
// HIỆN FOLLOW / EDIT
// ===========================

onAuthStateChanged(auth,user=>{

    if(!user) return;

    if(user.uid===profileUid){

        followBtn.style.display="none";

        editBtn.style.display="block";

    }else{

        followBtn.style.display="block";

        editBtn.style.display="none";

    }

});

followBtn.onclick = async () => {

    if (!auth.currentUser) {
        alert("Bạn cần đăng nhập");
        return;
    }

    const myUid = auth.currentUser.uid;

    // Không cho tự follow chính mình
    if (myUid === profileUid) return;

    await setDoc(
        doc(db, "users", myUid, "following", profileUid),
        {
            time: Date.now()
        }
    );

    await setDoc(
        doc(db, "users", profileUid, "followers", myUid),
        {
            time: Date.now()
        }
    );

    await updateDoc(
        doc(db, "users", myUid),
        {
            followingCount: increment(1)
        }
    );

    await updateDoc(
        doc(db, "users", profileUid),
        {
            followerCount: increment(1)
        }
    );

    followBtn.innerText = "Đã Follow";

};
// ===========================
// BACK
// ===========================

document
.getElementById("backBtn")
.onclick=()=>history.back();
// ===========================
// TAB
// ===========================

const tabs = document.querySelectorAll(".tab");

const grid = document.getElementById("videosGrid");
const videoMenu = document.getElementById("videoMenu");

const privacyBtn = document.getElementById("privacyBtn");

const commentBtn = document.getElementById("commentBtn");

const deleteBtn = document.getElementById("deleteBtn");

const cancelBtn = document.getElementById("cancelBtn");
tabs.forEach(tab=>{

    tab.onclick=()=>{

        tabs.forEach(t=>t.classList.remove("active"));

        tab.classList.add("active");

        loadTab(tab.dataset.tab);

    };

});


// ===========================
// LOAD TAB
// ===========================

async function loadTab(type){

    grid.innerHTML="";

    // --------------------
    // VIDEO CÔNG KHAI
    // --------------------

    if(type==="videos"){

        const q=query(

            collection(db,"videos"),

            where("uid","==",profileUid),

            where("visibility","==","public")

        );

        const snap=await getDocs(q);

        renderVideos(snap);

    }

    // --------------------
    // VIDEO RIÊNG TƯ
    // --------------------

    if(type==="private"){

        if(!auth.currentUser) return;

        if(auth.currentUser.uid!==profileUid){

            grid.innerHTML="<p style='padding:40px;text-align:center'>Không có quyền xem.</p>";

            return;

        }

        const q=query(

            collection(db,"videos"),

            where("uid","==",profileUid),

            where("visibility","==","private")

        );

        const snap=await getDocs(q);

        renderVideos(snap);

    }

    // --------------------
    // VIDEO ĐÃ THÍCH
    // --------------------

    if(type==="liked"){

        const likeSnap=await getDocs(

            collection(db,"users",profileUid,"likes")

        );

        for(const item of likeSnap.docs){

            const video=await getDoc(

                doc(db,"videos",item.id)

            );

            if(video.exists()){

                renderOne(video);

            }

        }

    }

    // --------------------
    // VIDEO ĐÃ LƯU
    // --------------------

    if(type==="saved"){

        const saveSnap=await getDocs(

            collection(db,"users",profileUid,"saved")

        );

        for(const item of saveSnap.docs){

            const video=await getDoc(

                doc(db,"videos",item.id)

            );

            if(video.exists()){

                renderOne(video);

            }

        }

    }

}



// ===========================
// HIỂN THỊ DANH SÁCH
// ===========================

function renderVideos(snap){

    snap.forEach(docSnap=>{

        renderOne(docSnap);

    });

}



// ===========================
// 1 VIDEO
// ===========================

function renderOne(docSnap){

    const v=docSnap.data();

    grid.innerHTML+=`

<div class="video-card"

onclick="location.href='review.html?video=${docSnap.id}'"

${auth.currentUser && auth.currentUser.uid===profileUid

?`oncontextmenu="openVideoMenu('${docSnap.id}');return false;"`

:""}

>

<img

src="${v.thumbnail||''}"

loading="lazy">

<div class="play-count">

▶ ${v.viewCount||0}

</div>

</div>

`;

}
window.openVideoMenu = function(videoId){

    selectedVideoId = videoId;

    videoMenu.classList.add("active");

};

cancelBtn.onclick = function(){

    videoMenu.classList.remove("active");

};

privacyBtn.onclick = async function(){

    if(!selectedVideoId) return;

    const ref = doc(db,"videos",selectedVideoId);

    const snap = await getDoc(ref);

    if(!snap.exists()) return;

    const current = snap.data().visibility || "public";

    await updateDoc(ref,{
        visibility: current==="public"
            ? "private"
            : "public"
    });

    videoMenu.classList.remove("active");

    loadTab("videos");

};
commentBtn.onclick = async function(){

    if(!selectedVideoId) return;

    const ref = doc(db,"videos",selectedVideoId);

    const snap = await getDoc(ref);

    if(!snap.exists()) return;

    const enable = snap.data().commentEnabled !== false;

    await updateDoc(ref,{
        commentEnabled: !enable
    });

    videoMenu.classList.remove("active");

};
deleteBtn.onclick = async function(){

    if(!selectedVideoId) return;

    if(!confirm("Bạn có chắc muốn xóa video này?")) return;

    await deleteDoc(
        doc(db,"videos",selectedVideoId)
    );

    videoMenu.classList.remove("active");

    loadTab("videos");

};
// ===========================
// LOAD MẶC ĐỊNH
// ===========================

loadTab("videos");
