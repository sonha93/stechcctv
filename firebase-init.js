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


window.firebase.initializeApp(firebaseConfig);


const auth = window.firebase.auth();
const db = window.firebase.firestore();

const storage = window.firebase.storage
? window.firebase.storage()
: null;


export {
    auth,
    db,
    storage
};
