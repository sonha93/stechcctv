// ======================= Firebase Config =======================
const firebaseConfig = {
  apiKey:"AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain:"stech-73b89.firebaseapp.com",
  databaseURL:"https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:"stech-73b89",
  storageBucket:"stech-73b89.appspot.com",
  messagingSenderId:"873739162979",
  appId:"1:873739162979:web:978f1a4043f025b1cdaf56"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

let currentUser = null;
let cart = [];

// Badge giỏ hàng nếu có header khác
const cartCountEl = document.querySelector(".header-icons .cart-count");

// ======================= AUTH & LOAD CART =======================
auth.onAuthStateChanged(user => {
  // 🟢 Reset cart cũ khi user thay đổi
  cart = [];
  if (!user) return window.location.href = "index.html";
  
  currentUser = user;
  loadCart();
});

function loadCart() {
  if (!currentUser) return;

  // Lắng nghe cart của user hiện tại
  db.ref("carts/" + currentUser.uid).on("value", snap => {
    cart = snap.val() || [];
    renderCart();
    updateBadge();
  });
}

// ======================= RENDER CART =======================
function renderCart() {
  const box = document.getElementById("cartList");
  const totalBox = document.getElementById("total");
  const actionBox = document.getElementById("cartAction");

  if (!cart.length) {
    box.innerHTML = "<p class='empty'>Giỏ hàng trống 🛒</p>";
    totalBox.innerHTML = "";
    actionBox.innerHTML = "";
    return;
  }

  let total = 0;

  box.innerHTML = cart.map((item, i) => {
    const qty = item.qty || 1;
    const price = item.price || 0;
    total += price * qty;

    return `
      <div class="item">
        <img src="${item.img || ''}">
        <div class="info">
          <b>${item.name || 'Không tên'}</b><br>
          <div class="price-new">${price.toLocaleString()}đ</div>
          ${item.oldPrice ? `<div class="price-old">${item.oldPrice.toLocaleString()}đ</div>` : ''}
          <div class="qty">
            <button onclick="changeQty(${i},-1)">-</button>
            <span>${qty}</span>
            <button onclick="changeQty(${i},1)">+</button>
          </div>
        </div>
        <button class="remove" onclick="removeItem(${i})">🗑</button>
      </div>
    `;
  }).join("");

  totalBox.innerHTML = "Tổng: " + total.toLocaleString() + "đ";
  actionBox.innerHTML = `<button class="checkout" onclick="checkout()">Đặt hàng</button>`;
}

// ======================= UPDATE BADGE =======================
function updateBadge() {
  if (!cartCountEl) return;
  const count = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
  cartCountEl.innerText = count;
}

// ======================= CHANGE QTY =======================
function changeQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty = (cart[index].qty || 1) + delta;
  if (cart[index].qty < 1) cart[index].qty = 1;
  saveCart();
  renderCart();
  updateBadge();
}

// ======================= REMOVE ITEM =======================
function removeItem(index) {
  if (!cart[index]) return;
  cart.splice(index, 1);
  saveCart();
  renderCart();
  updateBadge();
}

// ======================= SAVE CART =======================
function saveCart() {
  if (!currentUser) return;
  db.ref("carts/" + currentUser.uid).set(cart);
}

// ======================= CHECKOUT =======================
function checkout() {
  if (!currentUser) return;
  db.ref("carts/" + currentUser.uid).remove().then(() => {
    cart = [];
    renderCart();
    updateBadge();
    window.location.href = "checkout.html";
  });
}
