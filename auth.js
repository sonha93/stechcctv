// ==========================
// AUTH.JS – POPUP + UID + MULTI-USER CART (FIX HIỂN THỊ GIỎ HÀNG)
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
let cartData = [];

// DOM ready
document.addEventListener("DOMContentLoaded", () => {

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

    loginLink?.addEventListener("click", e => { e.preventDefault(); authModal.style.display="flex"; authMessage.innerText=""; });
    closeAuth?.addEventListener("click", () => authModal.style.display="none");

    authRegisterBtn?.addEventListener("click", async () => {
        const email = authEmail.value.trim();
        const pass = authPassword.value.trim();
        if(!email||!pass){ authMessage.style.color="red"; authMessage.innerText="Vui lòng nhập email và mật khẩu!"; return; }
        try{
            const userCredential = await createUserWithEmailAndPassword(auth,email,pass);
            currentUserUID = userCredential.user.uid;
            await setDoc(doc(db,"users",currentUserUID),{email, createdAt: new Date()});
            window.location.href="profile.html";
        } catch(err){
            authMessage.style.color="red";
            authMessage.innerText=(err.code==="auth/email-already-in-use")?"Email đã tồn tại! Hãy đăng nhập.":err.message;
        }
    });

    authLoginBtn?.addEventListener("click", async () => {
        const email = authEmail.value.trim();
        const pass = authPassword.value.trim();
        if(!email||!pass){ authMessage.style.color="red"; authMessage.innerText="Vui lòng nhập email và mật khẩu!"; return; }
        try{
            const userCredential = await signInWithEmailAndPassword(auth,email,pass);
            currentUserUID = userCredential.user.uid;
            authModal.style.display="none";
        } catch(err){ authMessage.style.color="red"; authMessage.innerText=err.message; }
    });

    logoutLink?.addEventListener("click", async () => {
        await signOut(auth);
        currentUserUID=null;
        cartData=[];
        loginLink.style.display="block";
        logoutLink.style.display="none";
        if(userInfoPreview) userInfoPreview.style.display="none";
        if(userNamePreview) userNamePreview.innerText="";
        location.reload();
    });

    // ==========================
    // AUTH STATE + LOAD CART FIX
    // ==========================
    onAuthStateChanged(auth,user=>{
        currentUserUID = user ? user.uid : null;

        if(user){
            loginLink.style.display="none";
            logoutLink.style.display="block";
            if(userInfoPreview) userInfoPreview.style.display="block";
            if(userNamePreview) userNamePreview.innerText="Xin chào\n"+(user.email||"");

            const cartKey = "cart_"+currentUserUID;
            cartData = JSON.parse(localStorage.getItem(cartKey))||[];

            // ---- nếu rỗng thì thêm sản phẩm test để hiển thị ----
            if(cartData.length===0){
                cartData.push({id:1,name:"Sản phẩm test",price:100000,img:"https://via.placeholder.com/80",qty:1});
                localStorage.setItem(cartKey,JSON.stringify(cartData));
            }

            window.cartData=cartData; 
            renderCart(); // render trực tiếp cartData

            window.updateCart = (newCart)=>{
                cartData=newCart;
                localStorage.setItem(cartKey,JSON.stringify(cartData));
                renderCart();
            };

        } else {
            loginLink.style.display="block";
            logoutLink.style.display="none";
            if(userInfoPreview) userInfoPreview.style.display="none";
            if(userNamePreview) userNamePreview.innerText="";
            cartData=[];
            renderCart();
        }
    });

});
