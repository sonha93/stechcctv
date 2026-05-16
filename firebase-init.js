// ==========================
// FIREBASE INIT - CHUẨN FIRESTORE
// ==========================

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "stech-73b89.firebaseapp.com",
  projectId: "stech-73b89",
  storageBucket: "stech-73b89.appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

// Khởi tạo Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Firestore modular
const db = firebase.firestore();    // dùng Firestore cho cart
const auth = firebase.auth();       // auth dùng chung
const storage = firebase.storage(); // nếu cần upload hình ảnh

// Biến trạng thái Firebase sẵn sàng
let firebaseReady = false;
auth.onAuthStateChanged(user => { firebaseReady = true; });

// EXPORT để các file khác dùng
export { auth, db, storage };
