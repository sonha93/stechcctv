// Check auto-login
auth.onAuthStateChanged(user => {
    if(user){
        // Nếu user đã login và là admin thì chuyển thẳng
        if(user.email.endsWith("@admin.com")){
            window.location.href = "admin-orders.html";
        }
    }
});

async function loginAdmin(){

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if(!username || !password){
        document.getElementById("msg").innerText = "Nhập tài khoản và mật khẩu";
        return;
    }

    try{
        // đăng nhập bằng email + password
        const email = username + "@admin.com"; // admin email định dạng
        await auth.signInWithEmailAndPassword(email, password);

        // chuyển tới trang quản lý
        window.location.href = "admin-orders.html";

    }catch(err){
        document.getElementById("msg").innerText = "Sai tài khoản hoặc mật khẩu";
        console.error(err);
    }
}

// Nhấn Enter cũng login
document.addEventListener("keydown", e => {
    if(e.key === "Enter") loginAdmin();
});
