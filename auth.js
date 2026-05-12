// auth.js – chuẩn popup sidebar + UID + Firestore

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTS
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
  const profileUID = document.getElementById("userUID"); // đúng với HTML
  // HIỆN POPUP LOGIN
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    authModal.style.display = "flex";
    authMessage.innerText = "";
  });

  // ĐÓNG POPUP
  closeAuth.addEventListener("click", () => {
    authModal.style.display = "none";
  });

  // ĐĂNG KÝ
  authRegisterBtn.addEventListener("click", () => {
    const email = authEmail.value.trim();
    const pass = authPassword.value.trim();
    if (!email || !pass) {
      authMessage.style.color = "red";
      authMessage.innerText = "Vui lòng nhập email và mật khẩu!";
      return;
    }

    createUserWithEmailAndPassword(auth, email, pass)
      .then((userCredential) => {
        const user = userCredential.user;
        const uid = user.uid;
        console.log("UID mới:", uid);

        // Lưu thông tin user vào Firestore
        setDoc(doc(db, "users", uid), {
          email: email,
          createdAt: new Date()
        });

        authMessage.style.color = "green";
        authMessage.innerText = "Đăng ký thành công! 🎉";
        authEmail.value = "";
        authPassword.value = "";
        authModal.style.display = "none";
      })
      .catch((err) => {
        authMessage.style.color = "red";
        if (err.code === "auth/email-already-in-use") {
          authMessage.innerText = "Email đã tồn tại! Hãy đăng nhập.";
        } else {
          authMessage.innerText = err.message;
        }
      });
  });

  // ĐĂNG NHẬP
  authLoginBtn.addEventListener("click", () => {
    const email = authEmail.value.trim();
    const pass = authPassword.value.trim();
    if (!email || !pass) {
      authMessage.style.color = "red";
      authMessage.innerText = "Vui lòng nhập email và mật khẩu!";
      return;
    }

    signInWithEmailAndPassword(auth, email, pass)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("UID đăng nhập:", user.uid);

        authMessage.style.color = "green";
        authMessage.innerText = "Đăng nhập thành công! 🎉";
        authModal.style.display = "none";
        loginLink.style.display = "none";
        logoutLink.style.display = "block";
        if (products) products.style.display = "grid";
        if (profileUID) profileUID.textContent = user.uid; // hiển thị UID
        authEmail.value = "";
        authPassword.value = "";
      })
      .catch((err) => {
        authMessage.style.color = "red";
        authMessage.innerText = err.message;
      });
  });

  // ĐĂNG XUẤT
  logoutLink.addEventListener("click", () => {
    signOut(auth).then(() => {
      loginLink.style.display = "block";
      logoutLink.style.display = "none";
      if (products) products.style.display = "none";
      if (profileUID) profileUID.textContent = ""; // xóa UID khi logout
    });
  });

  // KIỂM TRA AUTH STATE
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginLink.style.display = "none";
      logoutLink.style.display = "block";
      if (products) products.style.display = "grid";
      if (profileUID) profileUID.textContent = user.uid; // luôn hiển thị UID
    } else {
      loginLink.style.display = "block";
      logoutLink.style.display = "none";
      if (products) products.style.display = "none";
      if (profileUID) profileUID.textContent = "";
    }
  });
});
