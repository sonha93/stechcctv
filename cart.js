// =========================
// CART.JS CHUẨN - STECH
// =========================

// UID user hiện tại
let currentUserUID = null;
let cart = [];

// =========================
// Firebase Auth - Lắng nghe login/logout
// =========================
firebase.auth().onAuthStateChanged(user => {
  if(user){
    currentUserUID = user.uid;
    console.log("User đang đăng nhập:", currentUserUID);
    cart = getCart(currentUserUID); // load cart của user
    renderCart();
  } else {
    console.log("User đã logout");
    currentUserUID = null;
    cart = [];
    renderCart();
  }
});

// =========================
// Lấy cart theo UID
// =========================
function getCart(uid){
  return JSON.parse(localStorage.getItem(`cart_user_${uid}`)) || [];
}

// =========================
// Lưu cart theo UID
// =========================
function saveCart(uid, cart){
  localStorage.setItem(`cart_user_${uid}`, JSON.stringify(cart));
}

// =========================
// Lấy products
// =========================
function getProducts(){
  return JSON.parse(localStorage.getItem("products")) || [];
}

// =========================
// Render cart
// =========================
function renderCart(){
  const box = document.getElementById("cartList");
  const totalBox = document.getElementById("total");
  const actionBox = document.getElementById("cartAction");

  if(!currentUserUID){
    box.innerHTML = "<div class='empty'>Vui lòng đăng nhập để xem giỏ hàng 🛒</div>";
    totalBox.innerHTML = "";
    actionBox.innerHTML = "";
    return;
  }

  cart = getCart(currentUserUID);

  if(cart.length === 0){
    box.innerHTML = "<div class='empty'>Giỏ hàng trống 🛒</div>";
    totalBox.innerHTML = "";
    actionBox.innerHTML = `<a href="index.html"><button class="checkout">🛍️ Quay lại mua hàng</button></a>`;
    return;
  }

  let total = 0;
  const products = getProducts();

  box.innerHTML = "";

  cart.forEach((item, index) => {
    const p = products.find(x => String(x.id) === String(item.id));
    if(!p) return;

    const qty = item.quantity || 1;
    const price = Number(p.price) || 0;
    const itemTotal = price * qty;
    total += itemTotal;

    box.innerHTML += `
      <div class="item">
        <img src="${p.img || ''}">
        <div class="info">
          <h4>${p.name || 'Không tên'}</h4>
          <div class="price">
            ${price.toLocaleString()}đ × ${qty} = 
            <b style="color:#e53935">${itemTotal.toLocaleString()}đ</b>
          </div>
          <div class="qty">
            <button onclick="changeQty(${index},-1)">-</button>
            <span>${qty}</span>
            <button onclick="changeQty(${index},1)">+</button>
          </div>
        </div>
        <button class="remove" onclick="removeItem(${index})">Xoá</button>
      </div>
    `;
  });

  totalBox.innerHTML = "Tổng tiền: " + total.toLocaleString() + "đ";
  actionBox.innerHTML = `<a href="checkout.html"><button class="checkout">💳 Thanh toán</button></a>`;
}

// =========================
// Change quantity
// =========================
function changeQty(index, delta){
  if(!currentUserUID) return;
  cart = getCart(currentUserUID);
  cart[index].quantity = (cart[index].quantity || 1) + delta;
  if(cart[index].quantity < 1) cart[index].quantity = 1;
  saveCart(currentUserUID, cart);
  renderCart();
}

// =========================
// Remove item
// =========================
function removeItem(index){
  if(!currentUserUID) return;
  cart = getCart(currentUserUID);
  cart.splice(index, 1);
  saveCart(currentUserUID, cart);
  renderCart();
}

// =========================
// Add to cart (global)
// =========================
window.addToCart = function(product){
  if(!currentUserUID) return alert("Vui lòng đăng nhập trước");

  cart = getCart(currentUserUID);

  const index = cart.findIndex(item => item.id === product.id);
  if(index !== -1){
    cart[index].quantity = (cart[index].quantity || 1) + 1;
  } else {
    cart.push({id: product.id, quantity:1});
  }

  saveCart(currentUserUID, cart);
  renderCart();
}

// =========================
// Search cart
// =========================
document.getElementById("searchInput")?.addEventListener("input", function(){
  const key = this.value.toLowerCase();
  renderCart(cart.filter(item => {
    const products = getProducts();
    const p = products.find(x => String(x.id) === String(item.id));
    return p && p.name.toLowerCase().includes(key);
  }));
});

// =========================
// Init
// =========================
renderCart();
