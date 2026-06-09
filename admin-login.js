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

    const email = username + "@admin.com";

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
const BOT_TOKEN = "8752443026:AAEHrvCIDLqEDfE_inDeAAI9dzClm3WZyz4"
 const chatId = "6087791909";

async function forgotPassword(){

    try{

        const otp =
        Math.floor(
            100000 + Math.random() * 900000
        );

        await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
    chat_id: chatId,
    text: `🔐 Mã khôi phục Admin: ${otp}`
})
            }
        );
const data = await res.json();
console.log(data);
        document.getElementById("msg").innerText =
        "Đã gửi mã OTP tới Telegram";

    }catch(err){

        console.error(err);

        document.getElementById("msg").innerText =
        "Gửi OTP thất bại";

    }

}
