const firebaseConfig = {
  apiKey: "AIzaSyB6NgSwqMq4S5-osEzpLy-RucEkJDD_d8E",
  authDomain: "free-acc-b05ec.firebaseapp.com",
  projectId: "free-acc-b05ec",
  storageBucket: "free-acc-b05ec.firebasestorage.app",
  messagingSenderId: "405851091446",
  appId: "1:405851091446:web:0e031c2afcc2d65c9c17d7"
};

firebase.initializeApp(firebaseConfig, "adminApp");

const adminAuth =
  firebase.app("adminApp").auth();
