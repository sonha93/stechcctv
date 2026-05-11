const auth = firebase.auth();
const database = firebase.database(); // nếu muốn lưu giỏ hàng

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

// ======================
// Đăng ký
// ======================
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

// ======================
// Đăng nhập
// ======================
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
