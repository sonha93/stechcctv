// auth.js nâng cao - tự load UID cho cart (Firebase v9 compat)
const auth = firebase.auth();
const database = firebase.database();

// Lấy form và message (nếu có)
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");

// ======================
// Kiểm tra login và redirect
// ======================
function checkLogin() {
    const uid = localStorage.getItem("uid");
    if (!uid && !window.location.href.includes("login.html")) {
        window.location.href = "login.html";
    }
}
checkLogin();

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

                // Tạo giỏ hàng rỗng trong Realtime DB
                database.ref("carts/" + user.uid).set({
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

                localStorage.setItem("uid", user.uid);
                message.textContent = "Đăng nhập thành công! Chuyển sang giỏ hàng...";
                loginForm.reset();

                window.location.href = "cart.html";
            })
            .catch((error) => {
                console.error(error.message);
                message.textContent = "Đăng nhập thất bại: " + error.message;
            });
    });
}

// ======================
// Đăng xuất
// ======================
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

        // Nếu đang ở trang cart, load giỏ hàng tự động
        if (window.location.href.includes("cart.html")) {
            loadCart(user.uid);
        }
    } else {
        // User logout, xóa UID
        localStorage.removeItem("uid");

        // Nếu đang ở trang cần login, redirect
        if (!window.location.href.includes("login.html")) {
            window.location.href = "login.html";
        }
    }
});

// ======================
// Hàm load giỏ hàng - dùng trong cart.html
// ======================
function loadCart(uid) {
    const cartList = document.getElementById("cartList");
    const totalPriceElem = document.getElementById("totalPrice");
    if (!cartList || !totalPriceElem) return;

    const cartRef = database.ref("carts/" + uid + "/items");
    cartRef.on("value", (snapshot) => {
        cartList.innerHTML = "";
        let total = 0;
        const items = snapshot.val();
        if (items) {
            Object.keys(items).forEach((key) => {
                const item = items[key];
                const li = document.createElement("li");
                li.textContent = `${item.name} - ${item.price}₫ x ${item.quantity}`;
                cartList.appendChild(li);
                total += item.price * item.quantity;
            });
        } else {
            cartList.innerHTML = "<li>Giỏ hàng trống</li>";
        }
        totalPriceElem.textContent = "Tổng tiền: " + total + "₫";
    });
}

// ======================
// Hàm thêm sản phẩm vào cart - dùng trong cart.html hoặc sản phẩm
// ======================
function addToCart(product) {
    const uid = localStorage.getItem("uid");
    if (!uid) {
        alert("Vui lòng đăng nhập trước!");
        window.location.href = "login.html";
        return;
    }

    const itemRef = database.ref("carts/" + uid + "/items/" + product.id);
    itemRef.get().then((snapshot) => {
        if (snapshot.exists()) {
            const currentQty = snapshot.val().quantity;
            itemRef.update({ quantity: currentQty + 1 });
        } else {
            itemRef.set({
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
    });
}
