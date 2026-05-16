// ==========================
// FIREBASE INIT - CHUẨN
// ==========================

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "stech-73b89.firebaseapp.com",
  databaseURL: "https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stech-73b89",
  storageBucket: "stech-73b89.appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

// Khởi tạo Firebase
const app = firebase.initializeApp(firebaseConfig);

// Lấy auth và Firestore
export const auth = firebase.auth();       // xuất auth để auth.js và home.js dùng
export const db = firebase.firestore();    // xuất db để cart.js, auth.js dùng

// Nếu bạn có cần storage:
export const storage = firebase.storage();

// Biến trạng thái Firebase sẵn sàng
let firebaseReady = false;

// Đặt firebaseReady = true khi auth state check xong
auth.onAuthStateChanged(user => {
  firebaseReady = true;
});
