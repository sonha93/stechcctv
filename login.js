console.log("login.js loaded");

const ADMINS = [
{
    username: "20260610079",
    password: "123456",
    name: "Hoang Anh Son",
    role: "Admin"
}
];

function login(){

    const username =
    document.getElementById("username").value.trim();

    const password =
    document.getElementById("password").value.trim();

    if(
        username === "20260610079" &&
        password === "123456"
    ){

        localStorage.setItem(
            "adminUser",
            JSON.stringify({
                username:"20260610079",
                role:"Admin"
            })
        );

        window.location.href = "index.html";

        return;
    }

    document.getElementById("msg").innerText =
    "Sai tài khoản hoặc mật khẩu";
}

document.addEventListener(
"keydown",
function(e){

    if(e.key === "Enter"){
        login();
    }

});
