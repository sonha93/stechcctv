// Firebase cần load trước trong cart.html
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"></script>

const auth = firebase.auth();
const db = firebase.database();

// HTML elements
const cartList = document.getElementById("cartList");
const totalBox = document.getElementById("total");
const cartAction = document.getElementById("cartAction");
const cartCountEl = document.querySelector("#cartCount"); // nếu có badge ở header

let currentUser = null;
let cart = [];

// Menu toggle
function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

// Load giỏ hàng theo uid
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  loadCart();
});

// Load cart từ Firebase
function loadCart() {
  if (!currentUser) return;
  db.ref("carts/" + currentUser.uid).on("value", snapshot => {
    cart = snapshot.val() || [];
    renderCart();
  });
}

// Save cart to Firebase
function saveCart() {
  if (!currentUser) return;
  db.ref("carts/" + currentUser.uid).set(cart);
  updateBadge();
}

// Update badge số lượng
function updateBadge() {
  if (!cartCountEl) return;
  let count = 0;
  cart.forEach(item => {
    count += item.qty || 1;
  });
  cartCountEl.innerText = count;
}

// Render cart
function renderCart(filteredList = null) {
  const list = filteredList || cart;
  cartList.innerHTML = "";
  cartAction.innerHTML = "";
  totalBox.innerHTML = "";

  if (!list.length) {
    cartList.innerHTML = "<p class='empty'>Giỏ hàng trống 🛒</p>";
    return;
  }

  let total = 0;

  list.forEach((item, i) => {
    let qty = item.qty || 1;
    const checked = item.checked !== false;

    if (checked) total += item.price * qty;

    cartList.innerHTML += `
    <div class="item">
      <input type="checkbox" class="check" 
        ${checked ? "checked":""}
        onchange="toggleCheck(${i})">
      <img src="${item.img}">
      <div class="info">
        <b>${item.name}</b><br>
        <div class="price-new">${item.price.toLocaleString()}đ</div>
        ${item.oldPrice ? `<div class="price-old">${item.oldPrice.toLocaleString()}đ</div>` : ""}
        <div class="qty">
          <button onclick="changeQty(${i},-1)">-</button>
          <span>${qty}</span>
          <button onclick="changeQty(${i},1)">+</button>
        </div>
      </div>
      <button class="remove" onclick="removeItem(${i})">🗑</button>
    </div>
    `;
  });

  totalBox.innerHTML = "Tổng: " + total.toLocaleString() + "đ";
  cartAction.innerHTML = `<button class="checkout" onclick="checkout()">Đặt hàng</button>`;

  updateBadge();
}

// Check/uncheck item
function toggleCheck(i) {
  if (!cart[i]) return;
  cart[i].checked = !cart[i].checked;
  saveCart();
}

// Change qty
function changeQty(i, delta) {
  if (!cart[i]) return;
  cart[i].qty = (cart[i].qty || 1) + delta;
  if (cart[i].qty < 1) cart[i].qty = 1;
  saveCart();
}

// Remove item
function removeItem(i) {
  if (!cart[i]) return;
  cart.splice(i, 1);
  saveCart();
}

// Checkout
function checkout() {
  window.location.href = "checkout.html";
}

// Add to cart
function addToCart(product) {
  let index = cart.findIndex(item => item.id === product.id);
  if (index !== -1) {
    cart[index].qty = (cart[index].qty || 1) + 1;
  } else {
    cart.push({
      ...product,
      qty: 1,
      checked: true
    });
  }
  saveCart();
}

// Search filter
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", function(){
    const keyword = this.value.toLowerCase();
    const filtered = cart.filter(item => item.name.toLowerCase().includes(keyword));
    renderCart(filtered);
  });
}

// INIT
renderCart();
