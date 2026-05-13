// ==========================
// FIREBASE INIT
// ==========================




const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "stech-73b89.firebaseapp.com",
  databaseURL: "https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stech-73b89",
  storageBucket: "stech-73b89.appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

// Kiểm tra nếu Firebase chưa init thì init
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Lấy auth và database dùng chung
window.auth = firebase.auth();
window.db = firebase.database();
window.storage = firebase.storage();

// Biến trạng thái Firebase sẵn sàng
let firebaseReady = false;

// Đặt firebaseReady = true khi auth state check xong
auth.onAuthStateChanged(user => {
  firebaseReady = true;
});
