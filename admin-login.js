import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const msg = document.getElementById("msg");

loginBtn.addEventListener("click", loginAdmin);
document.addEventListener("keydown", e => { if(e.key === "Enter") loginAdmin(); });

async function loginAdmin() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        msg.innerText = "Nhập tài khoản và mật khẩu";
        return;
    }

    try {
        // admin email mặc định dạng: user + @admin.com
        const email = username + "@admin.com";

        await signInWithEmailAndPassword(auth, email, password);

        // login thành công
        window.location.href = "admin-orders.html";

    } catch(err) {
        console.error(err);
        msg.innerText = "Sai tài khoản hoặc mật khẩu";
    }
}
