

const ADMINS = [
{
    username: "20260610079",
    password: "123456",
    name: "Hoang Anh Son",
    role: "Admin"
}
];

async function login(){

    const username =
    document.getElementById("username").value.trim();

    const password =
    document.getElementById("password").value.trim();

    try{

        await firebase.auth()
        .signInWithEmailAndPassword(
            username + "@admin.com",
            password
        );

        window.location.href =
        "index.html";

    }catch(err){

        document.getElementById("msg").innerText =
        "Sai tài khoản hoặc mật khẩu";

    }

}
