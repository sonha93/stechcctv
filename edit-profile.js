import { app, auth } from "./auth.js";

import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const db = getFirestore(app);

// ==========================
// HTML
// ==========================

const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");

const nameInput = document.getElementById("nameInput");
const usernameInput = document.getElementById("usernameInput");
const usernameStatus = document.getElementById("usernameStatus");
const bioInput = document.getElementById("bioInput");
const bioCount = document.getElementById("bioCount");

const websiteInput = document.getElementById("websiteInput");
const facebookInput = document.getElementById("facebookInput");
const youtubeInput = document.getElementById("youtubeInput");
const tiktokInput = document.getElementById("tiktokInput");
const zaloInput = document.getElementById("zaloInput");

const saveBtn = document.getElementById("saveBtn");

// ==========================
// Avatar Preview
// ==========================

avatarInput.onchange = async e=>{

    const file = e.target.files[0];

    if(!file) return;

    avatarPreview.src = URL.createObjectURL(file);

    const form = new FormData();

    form.append("file",file);

   form.append(
    "upload_preset",
    "stechcamera"
);

const res = await fetch(
    "https://api.cloudinary.com/v1_1/dmz9gpp1b/image/upload",
    {
        method:"POST",
        body:form
    }
);

    const data = await res.json();

    avatarUrl = data.secure_url;

};

// ==========================
// Bio Counter
// ==========================

bioInput.oninput = () => {

    bioCount.innerText = bioInput.value.length;

};

// ==========================
// Back
// ==========================

document.getElementById("backBtn").onclick = () => {

    history.back();

};

// ==========================
// Load User
// ==========================
let currentUser = null;
let oldUsername = "";
let usernameChangedAt = 0;

let avatarUrl = "";
onAuthStateChanged(auth, async(user)=>{

    if(!user){

        location.href="index.html";

        return;

    }

    currentUser = user;

    const snap = await getDoc(
        doc(db,"users",user.uid)
    );

    if(!snap.exists()) return;

    const data = snap.data();

   avatarUrl =
    data.avatar ||
    "https://i.ibb.co/Z1kv9nJj/logo.png";

avatarPreview.src = avatarUrl;
    nameInput.value =
        data.name || "";

    usernameInput.value =
        data.username || "";

    bioInput.value =
        data.bio || "";

    websiteInput.value =
        data.website || "";

    facebookInput.value =
        data.facebook || "";

    youtubeInput.value =
        data.youtube || "";

    tiktokInput.value =
        data.tiktok || "";

    zaloInput.value =
        data.zalo || "";

    bioCount.innerText =
        bioInput.value.length;

    oldUsername =
        data.username || "";

    usernameChangedAt =
        data.usernameChangedAt || 0;

});
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==========================
// SAVE
// ==========================

saveBtn.onclick = async () => {

    if (!currentUser) return;

    const name = nameInput.value.trim();
    const username = usernameInput.value.trim().toLowerCase();
    if (
    username === "stechcctv" &&
    currentUser.uid !== "YuqmtdI6KIQHVp3j7HknPofQGon1"
) {
    alert("ID này đã được đăng ký độc quyền.");
    return;
}
    if (name === "") {
        alert("Vui lòng nhập tên.");
        return;
    }

    if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
        alert("ID chỉ gồm chữ thường, số, dấu . _ - và từ 3-30 ký tự.");
        return;
    }

    // ==========================
    // Kiểm tra đổi ID sau 30 ngày
    // ==========================

    let changedUsername = false;

    if (username !== oldUsername) {
    
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

        if (
            usernameChangedAt &&
            Date.now() - usernameChangedAt < THIRTY_DAYS
        ) {
            alert("Bạn chỉ được đổi ID sau 30 ngày.");
            return;
        }

        // ==========================
        // Kiểm tra ID trùng
        // ==========================

        const q = query(
            collection(db, "users"),
            where("username", "==", username)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {

            const duplicated = snap.docs.some(
                d => d.id !== currentUser.uid
            );

            if (duplicated) {
                alert("ID này đã được sử dụng.");
                return;
            }

        }

        changedUsername = true;
    }

    // ==========================
    // Lưu Firestore
    // ==========================

    await updateDoc(
        doc(db, "users", currentUser.uid),
        {
             avatar: avatarUrl,
            name: name,

            username: username,

            bio: bioInput.value.trim(),

            website: websiteInput.value.trim(),

            facebook: facebookInput.value.trim(),

            youtube: youtubeInput.value.trim(),

            tiktok: tiktokInput.value.trim(),

            zalo: zaloInput.value.trim(),

            ...(changedUsername && {
                usernameChangedAt: Date.now()
            })

        }
    );

    oldUsername = username;

    if (changedUsername) {
        usernameChangedAt = Date.now();
    }

    alert("Đã lưu hồ sơ.");

};
usernameInput.addEventListener("input", async () => {

    const username = usernameInput.value
        .trim()
        .toLowerCase();

    if (!username) {
        usernameStatus.textContent = "";
        return;
    }

    if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
        usernameStatus.textContent =
            "ID không hợp lệ";
        usernameStatus.style.color = "#ff3b30";
        return;
    }

    const q = query(
        collection(db, "users"),
        where("username", "==", username)
    );

    const snap = await getDocs(q);

    const duplicated = snap.docs.some(
        d => d.id !== currentUser.uid
    );

    if (duplicated) {

        usernameStatus.textContent =
            "❌ ID đã được sử dụng";

        usernameStatus.style.color =
            "#ff3b30";

    } else {

        usernameStatus.textContent =
            "✅ ID có thể sử dụng";

        usernameStatus.style.color =
            "#16a34a";
    }

});
