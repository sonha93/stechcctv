// ==========================
// FIREBASE INIT - CHUẨN FIRESTORE
// ==========================

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

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Biến trạng thái Firebase sẵn sàng
let firebaseReady = false;
auth.onAuthStateChanged(user => { firebaseReady = true; });

// EXPORT
export { auth, db, storage };
