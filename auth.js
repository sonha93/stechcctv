// ==========================
// AUTH.JS – POPUP + UID + MULTI-USER CART
// ==========================

import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
    getFirestore, 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase instances
const auth = getAuth();
const db = getFirestore();
let currentUserUID = null;

// DOM ready
document.addEventListener("DOMContentLoaded", () => {

    // DOM elements
    const loginLink = document.getElementById("loginLink");
    const logoutLink = document.getElementById("logoutLink");
    const authModal = document.getElementById("authModal");
    const authEmail = document.getElementById("authEmail");
    const authPassword = document.getElementById("authPassword");
    const authRegisterBtn = document.getElementById("authRegisterBtn");
    const authLoginBtn = document.getElementById("authLoginBtn");
    const closeAuth = document.getElementById("closeAuth");
    const authMessage = document.getElementById("authMessage");
    const userInfoPreview = document.getElementById("userInfoPreview");
    const userNamePreview = document.getElementById("sidebarUserNamePreview");

    // ==========================
    // OPEN LOGIN POPUP
    // ==========================
    loginLink?.addEventListener("click", e => {
        e.preventDefault();
        authModal.style.display = "flex";
        authMessage.innerText = "";
    });

    closeAuth?.addEventListener("click", () => authModal.style.display = "none");

    // ==========================
    // REGISTER USER
    // ==========================
    authRegisterBtn?.addEventListener("click", async () => {
        const email = authEmail.value.trim();
        const pass = authPassword.value.trim();

        if (!email || !pass) {
            authMessage.style.color = "red";
            authMessage.innerText = "Vui lòng nhập email và mật khẩu!";
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;
            currentUserUID = user.uid;

            // Save to Firestore
            await setDoc(doc(db, "users", currentUserUID), {
                email,
                createdAt: new Date()
            });

            // Redirect
            window.location.href = "profile.html";

        } catch (err) {
            authMessage.style.color = "red";
            authMessage.innerText = (err.code === "auth/email-already-in-use") 
                ? "Email đã tồn tại! Hãy đăng nhập." 
                : err.message;
        }
    });

    // ==========================
    // LOGIN USER
    // ==========================
    authLoginBtn?.addEventListener("click", async () => {
        const email = authEmail.value.trim();
        const pass = authPassword.value.trim();

        if (!email || !pass) {
            authMessage.style.color = "red";
            authMessage.innerText = "Vui lòng nhập email và mật khẩu!";
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;
            currentUserUID = user.uid;

            // Close modal
            authModal.style.display = "none";

        } catch (err) {
            authMessage.style.color = "red";
            authMessage.innerText = err.message;
        }
    });

    // ==========================
    // LOGOUT USER
    // ==========================
    logoutLink?.addEventListener("click", async () => {

    // XÓA CART CHÍNH
    localStorage.removeItem("cart");

    // XÓA CART UID CŨ
    Object.keys(localStorage).forEach(key => {

        if(key.startsWith("cart_")){

            localStorage.removeItem(key);

        }

    });

    await signOut(auth);

    currentUserUID = null;

    loginLink.style.display = "block";
    logoutLink.style.display = "none";

    // ẨN USER INFO
    if (userInfoPreview)
        userInfoPreview.style.display = "none";

    if (userNamePreview)
        userNamePreview.innerText = "";

    // reload sạch trạng thái
    location.reload();

});

    // ==========================
    // AUTH STATE CHANGE
    // ==========================
    onAuthStateChanged(auth, (user) => {
        currentUserUID = user ? user.uid : null;

        if (user) {
            loginLink.style.display = "none";
            logoutLink.style.display = "block";

            if (userInfoPreview) userInfoPreview.style.display = "block";
            if (userNamePreview) userNamePreview.innerText = "Xin chào\n" + (user.email || "");

       } else {
    loginLink.style.display = "block";
    logoutLink.style.display = "none";

    // ẩn avatar + xóa text bằng JS
    if (userInfoPreview) userInfoPreview.style.display = "none";
    if (userNamePreview) userNamePreview.innerText = "";
}
    });

});
