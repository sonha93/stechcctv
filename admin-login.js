// admin-login.js

  const firebaseConfig = {
  apiKey: "AIzaSyB6NgSwqMq4S5-osEzpLy-RucEkJDD_d8E",
  authDomain: "free-acc-b05ec.firebaseapp.com",
  projectId: "free-acc-b05ec",
  storageBucket: "free-acc-b05ec.firebasestorage.app",
  messagingSenderId: "405851091446",
  appId: "1:405851091446:web:0e031c2afcc2d65c9c17d7",
};

firebase.initializeApp(firebaseConfig);

function loginAdmin() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("msg");

    if (!username || !password) {
        msg.innerText = "Nhập tài khoản và mật khẩu";
        return;
    }

    const email = username + "@stech.com";

    firebase.auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = "admin-orders.html";
        })
        .catch((error) => {
    console.log("CODE:", error.code);
    console.log("MESSAGE:", error.message);
    msg.innerText = error.code;
});
}

document.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        loginAdmin();
    }
});
