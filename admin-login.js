const adminAuth = firebase.app("adminApp").auth();

function loginAdmin() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("msg");

    if (!username || !password) {
        msg.innerText = "Nhập tài khoản và mật khẩu";
        return;
    }

    const email = username + "@stech.com";

    adminAuth
        .signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = "admin-orders.html";
        })
        .catch((error) => {
            msg.innerText = error.code;
            console.log(error);
        });
}

document.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        loginAdmin();
    }
});
