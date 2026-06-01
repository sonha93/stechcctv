// ============================
// ADMIN ACCOUNTS
// ============================

const ADMINS = [
{
    username: "20260610079",
    password: "123456",
    name: "Hoang Anh Son",
    role: "Admin"
}
];

// ============================
// AUTO LOGIN CHECK
// ============================

const currentUser =
JSON.parse(
    localStorage.getItem("adminUser")
);

if(currentUser){

    if(
        window.location.pathname
        .includes("login.html")
    ){
        window.location.href =
        "index.html";
    }

}

// ============================
// LOGIN
// ============================

function login(){

    const username =
    document.getElementById("username")
    .value.trim();

    const password =
    document.getElementById("password")
    .value.trim();

    if(!username || !password){

        document.getElementById("msg")
        .innerText =
        "Vui lòng nhập tài khoản và mật khẩu";

        return;
    }

    const user =
    ADMINS.find(
        x =>
        x.username === username &&
        x.password === password
    );

    if(!user){

        document.getElementById("msg")
        .innerText =
        "Sai tài khoản hoặc mật khẩu";

        return;
    }

    localStorage.setItem(
        "adminUser",
        JSON.stringify(user)
    );

    window.location.href =
    "index.html";
}

// ============================
// ENTER TO LOGIN
// ============================

document.addEventListener(
"keydown",
function(e){

    if(e.key === "Enter"){

        login();

    }

});
