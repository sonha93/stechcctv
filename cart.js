/* =========================
   CART.JS FIX UID
========================= */

// AUTH
const auth = firebase.auth();
let currentUser = null;
let cartData = [];

// BADGE
const cartCountEl = document.querySelector(".header-icons .cart-count");

// ==========================
// LOAD USER
// ==========================
auth.onAuthStateChanged(user => {
  if(!user){
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  loadCart();
});

// ==========================
// LOAD CART
// ==========================
function loadCart(){
  if(!currentUser) return;

  const cartKey = "cart_" + currentUser.uid;
  cartData = JSON.parse(localStorage.getItem(cartKey)) || [];

  renderCart();
  updateBadge();
}

// ==========================
// RENDER CART
// ==========================
function renderCart(){
  const box = document.getElementById("cartList");
  const totalBox = document.getElementById("total");
  const actionBox = document.getElementById("cartAction");
  if(!box || !totalBox || !actionBox) return;

  if(cartData.length === 0){
    box.innerHTML = "<p class='empty'>Giỏ hàng trống 🛒</p>";
    totalBox.innerHTML = "";
    actionBox.innerHTML = "";
    return;
  }

  let total = 0;
  box.innerHTML = cartData.map((item,i)=>{
    const qty = item.qty || 1;
    total += (item.price || 0) * qty;

    return `
    <div class="item">
      <img src="${item.img || ''}">
      <div class="info">
        <b>${item.name || ''}</b>
        <div class="price-new">${(item.price||0).toLocaleString()}đ</div>
        ${item.oldPrice ? `<div class="price-old">${item.oldPrice.toLocaleString()}đ</div>` : ""}
        <div class="qty">
          <button onclick="changeQty(${i},-1)">-</button>
          <span>${qty}</span>
          <button onclick="changeQty(${i},1)">+</button>
        </div>
      </div>
      <button class="remove" onclick="removeItem(${i})">🗑</button>
    </div>`;
  }).join("");

  totalBox.innerHTML = "Tổng: " + total.toLocaleString() + "đ";
  actionBox.innerHTML = `<button class="checkout" onclick="checkout()">Đặt hàng</button>`;
}

// ==========================
// UPDATE BADGE
// ==========================
function updateBadge(){
  if(!cartCountEl) return;
  let count = 0;
  cartData.forEach(item=> count += item.qty || 1);
  cartCountEl.innerText = count;
}

// ==========================
// CHANGE QTY
// ==========================
function changeQty(i, delta){
  cartData[i].qty = (cartData[i].qty || 1) + delta;
  if(cartData[i].qty < 1) cartData[i].qty = 1;
  saveCart();
}

// ==========================
// REMOVE ITEM
// ==========================
function removeItem(i){
  cartData.splice(i,1);
  saveCart();
}

// ==========================
// SAVE CART
// ==========================
function saveCart(){
  if(!currentUser) return;
  const cartKey = "cart_" + currentUser.uid;
  localStorage.setItem(cartKey, JSON.stringify(cartData));
  renderCart();
  updateBadge();
}

// ==========================
// CHECKOUT
// ==========================
function checkout(){
  if(!currentUser) return;
  const cartKey = "cart_" + currentUser.uid;

  if(cartData.length === 0){
    alert("Giỏ hàng trống!");
    return;
  }

  localStorage.removeItem(cartKey);
  cartData = [];
  renderCart();
  updateBadge();

  window.location.href = "checkout.html";
}

// ==========================
// GLOBAL
// ==========================
window.changeQty = changeQty;
window.removeItem = removeItem;
window.checkout = checkout;
