// ==========================
// FIREBASE INIT - Modular v10
// ==========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "stech-73b89.firebaseapp.com",
  databaseURL: "https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stech-73b89",
  storageBucket: "stech-73b89.appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

// Init app
const app = initializeApp(firebaseConfig);

// Lấy auth / database / storage modular
const auth = getAuth(app);
const db = getDatabase(app);       // ✅ modular
const storage = getStorage(app);   // nếu cần upload hình ảnh

// Biến trạng thái Firebase sẵn sàng
let firebaseReady = false;

auth.onAuthStateChanged(user => {
  firebaseReady = true;
});
