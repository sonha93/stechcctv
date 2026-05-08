checkout.js

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
