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

    const user =
    ADMINS.find(
        x =>
        x.username === username &&
        x.password === password
    );

    if(!user){

        document.getElementById("msg").innerText =
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
