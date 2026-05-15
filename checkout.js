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

  const box = document.getElementById("cartBox");

  if (!box) return;

  const cart = getCart();

  box.innerHTML = "";

  if (cart.length === 0) {
    box.innerHTML = "<p>🛒 Giỏ hàng trống</p>";
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
      <div class="item">

        <img src="${item.img}" style="width:70px;height:70px;object-fit:cover">

        <div>
          <h4>${item.name}</h4>

          <div class="price-box">

            <span class="sale-price">
              ${formatPrice(price)}
            </span>

            ${
              hasDiscount
                ? `<span class="old-price">${formatPrice(oldPrice)}</span>`
                : ""
            }

          </div>

          <p>Số lượng: ${qty}</p>

          <p>
            Thành tiền:
            ${formatPrice(price * qty)}
          </p>

        </div>

      </div>
    `;
  });

  box.innerHTML += `
    <div class="total-box">
      <div class="row final">
        <span>Tổng thanh toán</span>
        <b>${formatPrice(total)}</b>
      </div>
    </div>
  `;
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
