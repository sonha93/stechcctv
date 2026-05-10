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
    totalBox.innerText = formatPrice(0);
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    if (item.checked === undefined) item.checked = true; // mặc định checked

    if (item.checked) total += Number(item.price) * Number(item.qty || 1);

    const price = Number(item.price) || 0;
    const oldPrice = Number(item.oldPrice) || 0;
    const qty = Number(item.qty) || 1;
    const hasDiscount = oldPrice > price;

    box.innerHTML += `
      <div class="cart-item" style="display:flex;gap:10px;align-items:center;position:relative;padding:10px 0;">
        <input type="checkbox" style="position:absolute;top:5px;left:5px;cursor:pointer;" ${item.checked?"checked":""} onclick="toggleItem(${index})">
        <img src="${item.img}" style="width:60px;border-radius:6px;">
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
          <h4>${item.name}</h4>
          <div class="price-box" style="display:flex;gap:8px;flex-wrap:nowrap;align-items:center;">
            <span class="price">${formatPrice(price)}</span>
            ${hasDiscount ? `<span class="old-price">${formatPrice(oldPrice)}</span>` : ""}
            <span style="white-space:nowrap;">${qty} × ${formatPrice(price)} = ${formatPrice(price*qty)}</span>
          </div>
          <div class="qty" style="display:flex;align-items:center;gap:4px;margin-top:5px;">
            <button onclick="changeQty(${index},-1)">-</button>
            <span>${qty}</span>
            <button onclick="changeQty(${index},1)">+</button>
          </div>
        </div>
        <button class="remove" style="position:absolute;top:5px;right:5px;background:none;border:none;font-size:18px;cursor:pointer;" onclick="removeItem(${index})">🗑</button>
      </div>
      <hr>
    `;
  });

  totalBox.innerText = formatPrice(total);
}

/* =========================
   ✅ TOGGLE CHECKBOX
========================= */
function toggleItem(index) {
  const cart = getCart();
  cart[index].checked = !cart[index].checked;
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCheckout();
}

/* =========================
   🛠 CHANGE QTY
========================= */
function changeQty(index, delta) {
  const cart = getCart();
  cart[index].qty = (cart[index].qty || 1) + delta;
  if (cart[index].qty < 1) cart[index].qty = 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCheckout();
}

/* =========================
   🧹 XOÁ GIỎ HÀNG
========================= */
function removeItem(index) {
  const cart = getCart();
  cart.splice(index,1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCheckout();
}

/* =========================
   🚀 INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  renderCheckout();
});
