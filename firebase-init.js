// ==========================
// FIREBASE INIT
// ==========================
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
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


// Kiểm tra nếu Firebase chưa init thì init
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Lấy auth và database dùng chung
const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();
const storage =
firebase.storage
? firebase.storage()
: null; // nếu cần upload hình ảnh

// Biến trạng thái Firebase sẵn sàng
let firebaseReady = false;

// Đặt firebaseReady = true khi auth state check xong
auth.onAuthStateChanged(user => {
  firebaseReady = true;
});
export { auth, db, storage };
export function listenUnreadMessages(userId, callback) {
  if (!userId) return;

  const msgRef = ref(rtdb, "messages");

  onValue(msgRef, (snapshot) => {
    let count = 0;

    snapshot.forEach(child => {
      const data = child.val();

      if (data.to === userId && data.read === false) {
        count++;
      }
    });

    callback(count);
  });
}
export function listenUnreadMessages(userId, callback) {
  if (!userId) return;

  const msgRef = ref(rtdb, "messages");

  onValue(msgRef, (snapshot) => {
    let count = 0;

    snapshot.forEach(child => {
      const data = child.val();

      // CHỈ ĐẾM TIN CHƯA ĐỌC CỦA USER
      if (data.to === userId && data.read === false) {
        count++;
      }
    });

    callback(count);
  });
}
