
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* =========================
   GET PRODUCTS (an toàn)
========================= */
function getProducts(){
  return JSON.parse(localStorage.getItem("products")) || [];
}

/* =========================
   RENDER CART
========================= */
function renderCart() {
  const box = document.getElementById("cartList");
  const totalBox = document.getElementById("total");

  box.innerHTML = "";

  if (cart.length === 0) {
    box.innerHTML = "<div class='empty'>Giỏ hàng trống 🛒</div>";
    totalBox.innerHTML = "";
    renderCartAction();
    return;
  }

  let total = 0;
  const products = getProducts();

  cart.forEach((item, index) => {

    const p = products.find(x => String(x.id) === String(item.id));
    if (!p) return;

    const price = Number(p.price) || 0;
    const qty = item.quantity || item.qty || 1;

    const itemTotal = price * qty;
    total += itemTotal;

 box.innerHTML += `
  <div class="item">
    <input type="checkbox" class="cart-checkbox" data-index="${index}" checked>
    <img src="${p.img || ''}">

    <div class="info">
      <h4>${p.name || 'Không tên'}</h4>

      <div class="price">
        ${price.toLocaleString()}đ × ${qty} = 
        <b style="color:#e53935">
          ${itemTotal.toLocaleString()}đ
        </b>
      </div>
    </div>

    <button class="remove" onclick="removeItem(${index})">
      Xoá
    </button>
  </div>
    `;
  });

  totalBox.innerHTML = "Tổng tiền: " + total.toLocaleString() + "đ";

  renderCartAction();
}

/* =========================
   REMOVE ITEM
========================= */
function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

/* =========================
   CART ACTION
========================= */
function renderCartAction() {
  const actionBox = document.getElementById("cartAction");
  if (!actionBox) return;

  if (cart.length > 0) {
    actionBox.innerHTML = `
      <a href="checkout.html">
        <button class="checkout">💳 Thanh toán</button>
      </a>
    `;
  } else {
    actionBox.innerHTML = `
      <div class="empty-box">
        <a href="index.html">
          <button class="checkout" style="background:#2196f3">
            🛍️ Quay lại mua hàng
          </button>
        </a>
      </div>
    `;
  }
}

/* =========================
   ADD TO CART (FIX CHUẨN)
========================= */
function addToCart(product){

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let index = cart.findIndex(item => item.id === product.id);

  if(index !== -1){
    cart[index].quantity = (cart[index].quantity || 1) + 1;
  } else {
    cart.push({
      id: product.id,
      quantity: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================
   INIT
========================= */
renderCart();
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
      e.preventDefault(); // tạm ngăn redirect
     
      // Lấy thông tin đơn hàng
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

      const orderNumber = "DH" + Date.now(); // tạo mã đơn tạm
      const customerName = "Khách lẻ"; // nếu có form nhập tên, thay vào đây

      // Gửi Telegram
      sendTelegramNotification(orderNumber, customerName, total.toLocaleString() + "đ");

      // Sau khi gửi xong, redirect sang checkout.html
      window.location.href = "checkout.html";
    });
  }
});
