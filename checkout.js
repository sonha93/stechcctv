// =========================
// checkout.js – Cart đồng bộ Firebase theo UID
// =========================

const cartBox = document.getElementById("cart");
const totalBox = document.getElementById("total");

if (!cartBox || !totalBox) console.warn("Checkout elements not found");

let currentCart = [];

// =========================
// 💰 Format tiền
// =========================
function formatPrice(n){
  return Number(n).toLocaleString("vi-VN") + "đ";
}

// =========================
// 📦 Load cart từ Firebase
// =========================
async function loadCart(){
  if(!currentUser) return;

  const snapshot = await db.ref("carts/" + currentUser.uid).once("value");
  currentCart = snapshot.val() || [];

  // Nếu chưa có checked, mặc định true
  currentCart.forEach(item => { if(item.checked === undefined) item.checked = true; });

  renderCheckout();
}

// =========================
// 🖥 Render checkout
// =========================
function renderCheckout(){
  if(!cartBox || !totalBox) return;

  cartBox.innerHTML = "";
  if(currentCart.length === 0){
    cartBox.innerHTML = "<p>Giỏ hàng trống 🛒</p>";
    totalBox.innerText = formatPrice(0);
    return;
  }

  let total = 0;

  currentCart.forEach((item, index) => {
    const qty = Number(item.qty) || 1;
    const price = Number(item.price) || 0;
    const oldPrice = Number(item.oldPrice) || 0;
    const subTotal = qty * price;

    if(item.checked) total += subTotal;

    const hasDiscount = oldPrice > price;

    cartBox.innerHTML += `
      <div class="cart-item" style="display:flex;align-items:center;gap:10px;position:relative;padding:10px 0;">
        <input type="checkbox" style="position:absolute;top:5px;left:5px;cursor:pointer;" ${item.checked ? "checked" : ""} onclick="toggleItem(${index})">
        <img src="${item.img}" style="width:60px;border-radius:6px;">
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
          <h4>${item.name}</h4>
          <div class="price-box" style="display:flex;gap:8px;flex-wrap:nowrap;align-items:center;">
            <span class="price">${formatPrice(price)}</span>
            ${hasDiscount ? `<span class="old-price">${formatPrice(oldPrice)}</span>` : ""}
            <span style="white-space:nowrap;">${qty} × ${formatPrice(price)} = ${formatPrice(subTotal)}</span>
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

// =========================
// ✅ Toggle checkbox
// =========================
async function toggleItem(index){
  if(!currentCart[index]) return;
  currentCart[index].checked = !currentCart[index].checked;
  await db.ref("carts/" + currentUser.uid).set(currentCart);
  renderCheckout();
}

// =========================
// 🛠 Change quantity
// =========================
async function changeQty(index, delta){
  if(!currentCart[index]) return;
  currentCart[index].qty = (currentCart[index].qty || 1) + delta;
  if(currentCart[index].qty < 1) currentCart[index].qty = 1;
  await db.ref("carts/" + currentUser.uid).set(currentCart);
  renderCheckout();
}

// =========================
// 🧹 Remove item
// =========================
async function removeItem(index){
  if(!currentCart[index]) return;
  currentCart.splice(index,1);
  await db.ref("carts/" + currentUser.uid).set(currentCart);
  renderCheckout();
}

// =========================
// 🧹 Clear cart
// =========================
async function clearCart(){
  if(!currentUser) return;
  currentCart = [];
  await db.ref("carts/" + currentUser.uid).remove();
  renderCheckout();
}

// =========================
// 🚀 Checkout / đặt hàng
// =========================
async function checkout(){
  if(!currentUser) return;
  // ở đây bạn có thể push order vào "orders/<uid>"
  await db.ref("carts/" + currentUser.uid).remove();
  currentCart = [];
  renderCheckout();
  window.location.href = "checkout.html"; // chuyển sang trang thanh toán
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  if(currentUser) loadCart();
});
