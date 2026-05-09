// user.js - quản lý đăng ký, đăng nhập, logout, load thông tin user
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase config stech-73b89
const firebaseConfig = {
  apiKey:"AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain:"stech-73b89.firebaseapp.com",
  projectId:"stech-73b89",
  storageBucket:"stech-73b89.appspot.com",
  messagingSenderId:"873739162979",
  appId:"1:873739162979:web:978f1a4043f025b1cdaf56",
  measurementId:"G-98Q3927PHZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
const userInfoPreview = document.getElementById("userInfoPreview");
const userAvatarPreview = document.getElementById("sidebarUserAvatarPreview");
const userNamePreview = document.getElementById("sidebarUserNamePreview");

// Mở popup
loginLink.addEventListener("click", e=>{
  e.preventDefault();
  authModal.style.display="flex";
});

// Đóng popup
closeAuth.addEventListener("click", ()=> authModal.style.display="none");

// REGISTER
authRegisterBtn.addEventListener("click", ()=>{
  const email = authEmail.value.trim();
  const pass = authPassword.value.trim();
  if(!email||!pass){
    authMessage.style.color="red";
    authMessage.innerText="Vui lòng nhập email và mật khẩu!";
    return;
  }
  const defaultAvatar = "https://via.placeholder.com/40";
  const defaultName = email.split("@")[0];

  createUserWithEmailAndPassword(auth,email,pass)
    .then(userCredential=>{
      const user = userCredential.user;
      return updateProfile(user,{
        displayName: defaultName,
        photoURL: defaultAvatar
      });
    })
    .then(()=>{
      authMessage.style.color="green";
      authMessage.innerText="Đăng ký thành công!";
      authEmail.value=""; authPassword.value="";
      authModal.style.display="none";
    })
    .catch(err=>{
      authMessage.style.color="red";
      authMessage.innerText=err.message;
    });
});

// LOGIN
authLoginBtn.addEventListener("click", ()=>{
  const email = authEmail.value.trim();
  const pass = authPassword.value.trim();
  if(!email||!pass){
    authMessage.style.color="red";
    authMessage.innerText="Vui lòng nhập email và mật khẩu!";
    return;
  }
  signInWithEmailAndPassword(auth,email,pass)
    .then(()=>{
      authMessage.style.color="green";
      authMessage.innerText="Đăng nhập thành công!";
      authModal.style.display="none";
    })
    .catch(err=>{
      authMessage.style.color="red";
      authMessage.innerText=err.message;
    });
});

// LOGOUT
logoutLink.addEventListener("click", ()=>{
  signOut(auth).then(()=>{
    loginLink.style.display="block";
    logoutLink.style.display="none";
    userInfoPreview.style.display="none";
  });
});

// AUTO LOAD USER INFO
onAuthStateChanged(auth,user=>{
  if(user){
    loginLink.style.display="none";
    logoutLink.style.display="block";
    userInfoPreview.style.display="block";
    userAvatarPreview.src = user.photoURL || "https://via.placeholder.com/40";
    userNamePreview.innerText = user.displayName || user.email || "Người dùng";
  } else {
    loginLink.style.display="block";
    logoutLink.style.display="none";
    userInfoPreview.style.display="none";
  }
});