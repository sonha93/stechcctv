// admin-login.js

const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "stech-73b89.firebaseapp.com",
  databaseURL: "https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stech-73b89",
  storageBucket: "stech-73b89.appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
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

    const email = username + "@stechcctv.com";

    firebase.auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = "admin-orders.html";
        })
        .catch((error) => {
            console.error(error);
            msg.innerText = "Sai tài khoản hoặc mật khẩu";
        });
}

document.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        loginAdmin();
    }
});
