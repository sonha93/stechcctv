// auth.js – popup + UID + multi-user cart
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();
let currentUserUID = null;

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

  // mở popup login
  loginLink?.addEventListener("click", e => {
    e.preventDefault();
    authModal.style.display = "flex";
    authMessage.innerText = "";
  });

  closeAuth?.addEventListener("click", () => authModal.style.display = "none");

  // Đăng ký
  authRegisterBtn?.addEventListener("click", async () => {
    const email = authEmail.value.trim();
    const pass = authPassword.value.trim();
    if(!email || !pass){
      authMessage.style.color = "red";
      authMessage.innerText = "Vui lòng nhập email và mật khẩu!";
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      currentUserUID = user.uid;

      // Lưu vào Firestore
      await setDoc(doc(db, "users", currentUserUID), {
        email,
        createdAt: new Date()
      });

      // Redirect ngay
     window.location.href = "profile.html";
    } catch(err) {
      authMessage.style.color = "red";
      authMessage.innerText = (err.code === "auth/email-already-in-use") 
        ? "Email đã tồn tại! Hãy đăng nhập." 
        : err.message;
    }
  });

  // Đăng nhập
  authLoginBtn?.addEventListener("click", async () => {
    const email = authEmail.value.trim();
    const pass = authPassword.value.trim();
    if(!email || !pass){
      authMessage.style.color = "red";
      authMessage.innerText = "Vui lòng nhập email và mật khẩu!";
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      currentUserUID = user.uid;

      // Redirect ngay
  authModal.style.display = "none";
    } catch(err) {
      authMessage.style.color = "red";
      authMessage.innerText = err.message;
    }
  });

  // Đăng xuất
  logoutLink?.addEventListener("click", async () => {
    await signOut(auth);
    currentUserUID = null;
    loginLink.style.display = "block";
    localStorage.removeItem("cart");
    logoutLink.style.display = "none";
    userInfoPreview.style.display = "none";
  });

  // Kiểm tra auth state
 onAuthStateChanged(auth, (user) => {

  currentUserUID = user ? user.uid : null;

  if(user){

    loginLink.style.display = "none";
    logoutLink.style.display = "block";

    if(userInfoPreview){
      userInfoPreview.style.display = "block";
    }

    if(userNamePreview){
      userNamePreview.innerText =
      "Xin chào\n" + (user.email || "");
    }

  }

  else{

    loginLink.style.display = "block";
    logoutLink.style.display = "none";

    if(userInfoPreview){
      userInfoPreview.style.display = "none";
    }

  }

});
  });
