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

            ${
              hasDiscount
                ? `<span class="old-price">${formatPrice(oldPrice)}</span>`
                : ""
            }
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
   🚀 INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  renderCheckout();
});
function sendTelegramNotification(orderNumber, customerName, total) {
  const botToken = "8752443026:AAEHrvCIDLqEDfE_inDeAAI9dzClm3WZyz4";
  const chatId = "6087791909";

  const message = `📦 Đơn hàng mới!\nMã đơn: ${orderNumber}\nKhách hàng: ${customerName}\nTổng tiền: ${total}`;

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`)
    .then(res => res.json())
    .then(data => {
      if(data.ok) console.log("✅ Đã gửi Telegram!");
      else console.error("❌ Lỗi Telegram:", data);
    })
    .catch(err => console.error("❌ Lỗi fetch Telegram:", err));
}
document.addEventListener("DOMContentLoaded", function() {
  const checkoutBtn = document.querySelector("#cartAction .checkout");
  if(checkoutBtn){
    checkoutBtn.addEventListener("click", function(e){
      e.preventDefault(); // ngăn redirect tạm

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      let total = 0;
      const products = getProducts();

      cart.forEach(item => {
        const p = products.find(x => String(x.id) === String(item.id));
        if(!p) return;
        const price = Number(p.price) || 0;
        const qty = item.quantity || 1;
        total += price * qty;
      });

      const orderNumber = "DH" + Date.now();
      const customerName = "Khách lẻ";

      sendTelegramNotification
       function sendTelegramNotification(orderNumber, customerName, total) {
  const botToken = "8752443026:AAEHrvCIDLqEDfE_inDeAAI9dzClm3WZyz4";
  const chatId = "6087791909";

  const message = `📦 Đơn hàng mới!\nMã đơn: ${orderNumber}\nKhách hàng: ${customerName}\nTổng tiền: ${total}`;

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`)
    .then(res => res.json())
    .then(data => {
      if(data.ok) console.log("✅ Đã gửi Telegram!");
      else console.error("❌ Lỗi Telegram:", data);
    })
    .catch(err => console.error("❌ Lỗi fetch Telegram:", err));
}

document.addEventListener("DOMContentLoaded", function() {
  const checkoutBtn = document.querySelector("#cartAction .checkout");
  if(checkoutBtn){
    checkoutBtn.addEventListener("click", function(e){
      e.preventDefault(); // ngăn redirect tạm

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      let total = 0;
      const products = getProducts();

      cart.forEach(item => {
        const p = products.find(x => String(x.id) === String(item.id));
        if(!p) return;
        const price = Number(p.price) || 0;
        const qty = item.quantity || 1;
        total += price * qty;
      });

      const orderNumber = "DH" + Date.now();
      const customerName = "Khách lẻ";

      // ✅ Gửi Telegram
      sendTelegramNotification(orderNumber, customerName, total.toLocaleString() + "đ");

      // ✅ Chuyển trang sau khi gửi
      window.location.href = "checkout.html";
    });
  }
});
