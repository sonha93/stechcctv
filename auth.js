
// ==========================
// IMPORT FIREBASE
// ==========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         signOut, 
         onAuthStateChanged 
       } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ==========================
// FIREBASE CONFIG
// ==========================
const firebaseConfig = {
  apiKey:"AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain:"stech-73b89.firebaseapp.com",
  databaseURL:"https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:"stech-73b89",
  storageBucket:"stech-73b89.appspot.com",
  messagingSenderId:"873739162979",
  appId:"1:873739162979:web:978f1a4043f025b1cdaf56"
};

// ==========================
// INITIALIZE FIREBASE
// ==========================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ==========================
// AUTH FUNCTIONS
// ==========================

// Đăng ký người dùng mới
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Đăng ký thành công:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Lỗi đăng ký:", error.message);
    throw error;
  }
};

// Đăng nhập người dùng
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Đăng nhập thành công:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message);
    throw error;
  }
};

// Đăng xuất người dùng
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("Đăng xuất thành công");
  } catch (error) {
    console.error("Lỗi đăng xuất:", error.message);
    throw error;
  }
};

// Lắng nghe trạng thái đăng nhập
export const onAuthStateChangedListener = (callback) => {
  onAuthStateChanged(auth, callback);
};

export { auth };
