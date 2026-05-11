// auth.js nâng cao (Firebase v9 compat)

const auth = firebase.auth();
const database = firebase.database();

// Lấy các form và phần hiển thị message
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

// ======================
// Hàm kiểm tra login
// ======================
function checkLoginRedirect() {
    const uid = localStorage.getItem("uid");
    if (!uid) {
        // nếu chưa login, redirect về login.html
        if (!window.location.href.includes("login.html")) {
            window.location.href = "login.html";
        }
    } else {
        // nếu đã login, console UID
        console.log("UID hiện tại:", uid);
    }
}

// Gọi khi load trang
checkLoginRedirect();

// ======================
// Đăng ký
// ======================
if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Đăng ký thành công! UID:", user.uid);

                // Tạo node giỏ hàng rỗng cho user
                database.ref('carts/' + user.uid).set({
                    createdAt: Date.now(),
                    items: {}
                });

                message.textContent = "Đăng ký thành công! Hãy đăng nhập.";
                registerForm.reset();
            })
            .catch((error) => {
                console.error(error.message);
                message.textContent = "Đăng ký thất bại: " + error.message;
            });
    });
}

// ======================
// Đăng nhập
// ======================
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Đăng nhập thành công! UID:", user.uid);

                // Lưu UID vào localStorage
                localStorage.setItem("uid", user.uid);

                message.textContent = "Đăng nhập thành công! Chuyển sang giỏ hàng...";
                loginForm.reset();

                // Chuyển hướng
                window.location.href = "cart.html";
            })
            .catch((error) => {
                console.error(error.message);
                message.textContent = "Đăng nhập thất bại: " + error.message;
            });
    });
}

// ======================
// Đăng xuất (nếu có button #logoutBtn)
// ======================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        auth.signOut().then(() => {
            localStorage.removeItem("uid");
            window.location.href = "login.html";
        });
    });
}

// ======================
// Theo dõi trạng thái login realtime
// ======================
auth.onAuthStateChanged((user) => {
    if (user) {
        // User đang login, cập nhật UID
        localStorage.setItem("uid", user.uid);
    } else {
        // User logout, xóa UID
        localStorage.removeItem("uid");
        // Redirect nếu đang ở trang cần login
        if (!window.location.href.includes("login.html")) {
            window.location.href = "login.html";
        }
    }
});
