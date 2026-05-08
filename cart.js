
/* =========================
   🛒 CART.JS CLEAN FIX
========================= */

/* =========================
   GET CART
========================= */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

/* =========================
   GET PRODUCTS
========================= */
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

/* =========================
   RENDER CART
========================= */
function renderCart() {

  const cart = getCart();

  const box = document.getElementById("cartList");
  const totalBox = document.getElementById("total");

  if (!box || !totalBox) return;

  box.innerHTML = "";

  if (cart.length === 0) {
    box.innerHTML = `<div class="empty">Giỏ hàng trống 🛒</div>`;
    totalBox.innerHTML = "";
    renderCartAction();
    return;
  }

  let total = 0;

  const products = getProducts();

  cart.forEach((item, index) => {

    const p = products.find(
      x => String(x.id) === String(item.id)
    );

    if (!p) return;

    const price = Number(p.price) || 0;
    const oldPrice = Number(p.oldPrice) || 0;

    // ✅ FIX SALE LOGIC CHUẨN
    const hasDiscount =
      oldPrice > price &&
      oldPrice > 0 &&
      price > 0;

    const qty = Number(item.quantity || item.qty || 1);

    const itemTotal = price * qty;

    total += itemTotal;

    box.innerHTML += `
      <div class="item">

        <img src="${p.img || ''}" alt="">

        <div class="info">

          <h4>${p.name || 'Không tên'}</h4>

          <div class="price-box">

            <span class="price">
              ${price.toLocaleString()}đ
            </span>

            ${
              hasDiscount
                ? `<span class="old-price">
                    ${oldPrice.toLocaleString()}đ
                  </span>`
                : ""
            }

          </div>

          <div class="qty-box">
            × ${qty}
            =
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

  totalBox.innerHTML = `
    Tổng tiền:
    <b style="color:#e53935">
      ${total.toLocaleString()}đ
    </b>
  `;

  renderCartAction();
}

/* =========================
   REMOVE ITEM
========================= */
function removeItem(index) {
  let cart = getCart();
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

  const cart = getCart();

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
   AUTO UPDATE
========================= */
window.addEventListener("storage", renderCart);

/* =========================
   FIX OLD CART DATA (SAFE)
========================= */
function fixOldCartData() {
  let cart = getCart();

  cart = cart.map(item => ({
    id: item.id,
    quantity: Number(item.quantity || item.qty || 1)
  }));

  localStorage.setItem("cart", JSON.stringify(cart));
}

fixOldCartData();

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", renderCart);
