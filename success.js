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

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Tạo mã đơn hàng
function generateOrderId() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);

  // Random 4 số
  const random = Math.floor(1000 + Math.random() * 9000);

  return `${day}${month}${year}${random}`;
}

// Hàm lưu đơn
function saveOrder() {
  const cart =
  JSON.parse(localStorage.getItem("cart")) || [];
  if(cart.length === 0){

  alert("Giỏ hàng trống");

  return;
}
  const orderId = generateOrderId();

  const orderData = {
    orderId: orderId,
    customer: "Sơn",
    phone: "0123456789",

   items: cart,

total: cart.reduce(
  (sum, p) =>
    sum + ((p.price || 0) * (p.qty || 1)),
  0
),
    status: "success",
    time: new Date().toISOString()
  };

  set(ref(db, `orders/${orderId}`), orderData)
    .then(() => {
      console.log("✅ Lưu đơn thành công:", orderId);
      localStorage.removeItem("cart");
       window.location.href = "success.html";
    })
    .catch((error) => {
      console.error("❌ Lỗi lưu đơn:", error);
    });
}

document
.getElementById("checkoutBtn")
.addEventListener("click", saveOrder);
