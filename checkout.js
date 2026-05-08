/* =========================
   📦 GET DATA
========================= */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

/* =========================
   💰 FORMAT TIỀN
========================= */
function formatPrice(n) {
  return Number(n).toLocaleString("vi-VN") + "đ";
}

/* =========================
   🖥 RENDER CHECKOUT
========================= */
function renderCheckout() {
  const box = document.getElementById("cart");
  const totalBox = document.getElementById("total");

  if (!box || !totalBox) return;

  const cart = getCart();

  box.innerHTML = "";

  if (cart.length === 0) {
    box.innerHTML = "<p>Giỏ hàng trống</p>";
    totalBox.innerText = "0";
    return;
  }

  let total = 0;

  cart.forEach(item => {
    const price = Number(item.price) || 0;
    const oldPrice = Number(item.oldPrice) || 0;
    const qty = Number(item.qty) || 1;
    const hasDiscount = oldPrice > price;

    total += price * qty;

    box.innerHTML += `
      <div class="cart-item">
        <img src="${item.img}" style="width:60px">
        <div>
          <h4>${item.name}</h4>
          <div class="price-box">
            <span class="price">${formatPrice(price)}</span>
            ${hasDiscount ? `<span class="old-price">${formatPrice(oldPrice)}</span>` : ""}
          </div>
          <p>Số lượng: ${qty}</p>
          <p>Thành tiền: ${formatPrice(price * qty)}</p>
        </div>
      </div>
      <hr>
    `;
  });

  totalBox.innerText = formatPrice(total);
}

/* =========================
   🧹 XOÁ GIỎ HÀNG
========================= */
function clearCart() {
  localStorage.removeItem("cart");
  renderCheckout();
}

/* =========================
   💳 PLACE ORDER
========================= */
function placeOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("🛒 Giỏ hàng trống!");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!name || !phone || !address) {
    alert("⚠️ Nhập đầy đủ thông tin!");
    return;
  }

  const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
  if (!phoneRegex.test(phone)) {
    alert("⚠️ SĐT không hợp lệ!");
    return;
  }

  const total = cart.reduce((sum, p) => sum + p.price * (p.qty || 1), 0);

  const order = {
    id: Date.now(),
    name,
    phone,
    address,
    cart,
    time: new Date().toLocaleString()
  };

  // Lưu đơn
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));

  // Gọi Telegram (nếu sendTelegram.js load trước)
 // Gửi Telegram đầy đủ thông tin
if (typeof sendTelegramNotification === "function") {
    sendTelegramNotification(order.id, order.name, order.phone, order.address, order.cart);
}

  // Xoá cart
  localStorage.removeItem("cart");
  renderCheckout();

  // Hiển thị loading
  const loading = document.getElementById("loading");
  if (loading) loading.style.display = "flex";

  const btn = document.getElementById("placeOrderBtn");
  if (btn) btn.disabled = true;

  setTimeout(() => {
    window.location.href = "success.html";
  }, 1000);
}

/* =========================
   🖱 GẮN SỰ KIỆN & INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  renderCheckout();
  updateBank && updateBank(); // nếu có hàm updateBank
  const btn = document.getElementById("placeOrderBtn");
  if (btn) btn.addEventListener("click", placeOrder);
});
