// ==========================
// IMPORT FIREBASE
// ==========================
import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ==========================
// FIREBASE CONFIG
// ==========================
const firebaseConfig = {

  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",

  authDomain: "stech-73b89.firebaseapp.com",

  projectId: "stech-73b89",

  storageBucket: "stech-73b89.firebasestorage.app",

  messagingSenderId: "873739162979",

  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"

};

// ==========================
// INIT FIREBASE
// ==========================
export const app =
  initializeApp(firebaseConfig);
export const auth =
  getAuth(app);

export const db =
  getFirestore(app);
// ==========================
// AUTH FUNCTIONS
// ==========================

// Đăng ký
export const registerUser = async (
  email,
  password,
  username
) => {

  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  const user = userCredential.user;

  await setDoc(
    doc(db,"users",user.uid),
    {
      uid:user.uid,
      email:user.email,
      username:username
        .toLowerCase()
        .replace(/\s+/g,"")
    }
  );

  return user;
};
// Đăng nhập
export const loginUser = async (
  email,
  password
) => {

  const userCredential =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  return userCredential.user;
};

// Đăng xuất
export const logoutUser = async () => {

  await signOut(auth);

};

// Listener login
export const onAuthStateChangedListener =
(callback) => {

  onAuthStateChanged(auth, callback);

};
