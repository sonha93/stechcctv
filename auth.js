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
  const products = document.getElementById("products");
  const profileUID = document.getElementById("userUID");

  // Popup login
  loginLink?.addEventListener("click", e => {
    e.preventDefault();
    authModal.style.display = "flex";
    authMessage.innerText = "";
  });

  closeAuth?.addEventListener("click", () => authModal.style.display = "none");

  // Đăng ký
  authRegisterBtn?.addEventListener("click", () => {
    const email = authEmail.value.trim();
    const pass = authPassword.value.trim();
    if(!email || !pass){
      authMessage.style.color = "red";
      authMessage.innerText = "Vui lòng nhập email và mật khẩu!";
      return;
    }

createUserWithEmailAndPassword(auth, email, pass)
  .then(async (userCredential) => {

    const user = userCredential.user;
    const uid = user.uid;

    // lưu firestore
    await setDoc(doc(db, "users", uid), {
      email,
      createdAt: new Date()
    });

    currentUserUID = uid;

    if(profileUID) profileUID.textContent = uid;

    authMessage.style.color = "green";
    authMessage.innerText = "Đăng ký thành công! 🎉";

    authEmail.value = "";
    authPassword.value = "";
    authModal.style.display = "none";

    // chuyển trang
    window.location.href = "pages/profile.html";

  })
      .catch(err => {
        authMessage.style.color = "red";
        if(err.code === "auth/email-already-in-use"){
          authMessage.innerText = "Email đã tồn tại! Hãy đăng nhập.";
        } else {
          authMessage.innerText = err.message;
        }
      });
  });

  // Đăng nhập
    // Đăng nhập
  authLoginBtn?.addEventListener("click", () => {

    const email = authEmail.value.trim();
    const pass = authPassword.value.trim();

    if(!email || !pass){
      authMessage.style.color = "red";
      authMessage.innerText = "Vui lòng nhập email và mật khẩu!";
      return;
    }

    signInWithEmailAndPassword(auth, email, pass)

      .then((userCredential) => {

        const user = userCredential.user;

        currentUserUID = user.uid;

        authMessage.style.color = "green";
        authMessage.innerText = "Đăng nhập thành công! 🎉";

        authModal.style.display = "none";

        // chuyển trang
        window.location.href = "pages/profile.html";

      })

      .catch((err) => {

        authMessage.style.color = "red";
        authMessage.innerText = err.message;

      });

  });
  // Đăng xuất
  logoutLink?.addEventListener("click", () => {
    signOut(auth).then(() => {
      currentUserUID = null;
      if(typeof renderCart === "function") renderCart(); // reset cart
      loginLink.style.display = "block";
      logoutLink.style.display = "none";
      if(products) products.style.display = "none";
      if(profileUID) profileUID.textContent = "";
    });
  });

  // Kiểm tra auth state
  onAuthStateChanged(auth, (user) => {
    if(user){
      currentUserUID = user.uid;
      loginLink.style.display = "none";
      logoutLink.style.display = "block";
      if(products) products.style.display = "grid";
      if(profileUID) profileUID.textContent = user.uid;
      if(typeof renderCart === "function") renderCart(); // load cart user
    } else {
      currentUserUID = null;
      if(typeof renderCart === "function") renderCart(); // reset cart
      loginLink.style.display = "block";
      logoutLink.style.display = "none";
      if(products) products.style.display = "none";
      if(profileUID) profileUID.textContent = "";
    }
  });
});
