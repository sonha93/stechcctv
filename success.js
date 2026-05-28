import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "stech-73b89.firebaseapp.com",
  databaseURL:
    "https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stech-73b89",
  storageBucket: "stech-73b89.appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

// Firebase init
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Tạo mã đơn hàng
function generateOrderId() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);

  const random = Math.floor(1000 + Math.random() * 9000);

  return `${day}${month}${year}${random}`;
}

// Lưu đơn hàng
async function saveOrder() {
  try {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    console.log("🛒 Cart:", cart);

    if (!cart || cart.length === 0) {
      alert("Giỏ hàng trống");
      return;
    }

    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (!nameInput || !phoneInput) {
      alert("Thiếu form khách hàng (name/phone)");
      return;
    }

    if (!checkoutBtn) {
      console.error("❌ Không tìm thấy nút checkoutBtn");
      return;
    }

    const customer = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!customer || !phone) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const orderId = generateOrderId();

    const orderData = {
      orderId,
      customer,
      phone,
      items: cart,
      total: cart.reduce(
        (sum, p) => sum + ((p.price || 0) * (p.qty || 1)),
        0
      ),
      status: "success",
      time: new Date().toISOString()
    };

    console.log("📦 OrderData:", orderData);

    await set(ref(db, `orders/${orderId}`), orderData);

    console.log("✅ Lưu đơn thành công:", orderId);

    localStorage.removeItem("cart");

    alert("Đặt hàng thành công!");

    window.location.href = "success.html";

  } catch (error) {
    console.error("❌ Firebase error:", error.code, error.message);
    alert("Lỗi khi lưu đơn: " + error.message);
  }
}

// Gắn event sau khi DOM load
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("checkoutBtn");

  if (!btn) {
    console.error("❌ checkoutBtn không tồn tại trong DOM");
    return;
  }

  btn.addEventListener("click", saveOrder);
});
