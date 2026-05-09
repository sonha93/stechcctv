// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "stech-73b89.firebaseapp.com",
  databaseURL: "https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stech-73b89",
  storageBucket: "stech-73b89.appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

// DOM elements
const cartList = document.getElementById("cartList");
const totalBox = document.getElementById("total");
const cartAction = document.getElementById("cartAction");
const cartCountEl = document.getElementById("cartCount");

// Current user
let currentUser = null;
let cartRef = null;

// ========================
// Auth state
// ========================
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  cartRef = db.ref("carts/" + currentUser.uid);

  // Listen cart changes realtime
  cartRef.on("value", snapshot => {
    const cart = snapshot.val() || [];
    renderCart(cart);
    updateBadge(cart);
  });
});

// ========================
// Add to cart
// ========================
function addToCart(product) {
  if (!currentUser) return alert("Bạn cần đăng nhập!");

  cartRef.once("value").then(snapshot => {
    let cart = snapshot.val() || [];
    const index = cart.findIndex(item => item.id === product.id);

    if (index !== -1) {
      cart[index].quantity = (cart[index].quantity || 1) + 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, quantity: 1 });
    }

    cartRef.set(cart);
  });
}

// ========================
// Render cart
// ========================
function renderCart(cart) {
  cartList.innerHTML = "";

  if (!cart || cart.length === 0) {
    cartList.innerHTML = "<p class='empty'>Giỏ hàng trống 🛒</p>";
    totalBox.innerHTML = "";
    cartAction.innerHTML = "";
    return;
  }

  let total = 0;
  cart.forEach(item => {
    const qty = item.quantity || 1;
    total += item.price * qty;

    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img src="${item.img || ''}">
      <div class="info">
        <b>${item.name}</b><br>
        <div class="price-new">${item.price.toLocaleString()}đ × ${qty} = <b style="color:#e53935">${(item.price * qty).toLocaleString()}đ</b></div>
        <div class="qty">
          <button onclick="changeQty('${item.id}',-1)">-</button>
          <span>${qty}</span>
          <button onclick="changeQty('${item.id}',1)">+</button>
        </div>
      </div>
      <button class="remove" onclick="removeItem('${item.id}')">🗑</button>
    `;
    cartList.appendChild(div);
  });

  totalBox.innerHTML = "Tổng: " + total.toLocaleString() + "đ";

  cartAction.innerHTML = `<button class="checkout" onclick="checkout()">Đặt hàng</button>`;
}

// ========================
// Remove item
// ========================
function removeItem(id) {
  if (!currentUser) return;
  cartRef.once("value").then(snapshot => {
    let cart = snapshot.val() || [];
    cart = cart.filter(item => item.id !== id);
    cartRef.set(cart);
  });
}

// ========================
// Change quantity
// ========================
function changeQty(id, delta) {
  if (!currentUser) return;
  cartRef.once("value").then(snapshot => {
    let cart = snapshot.val() || [];
    const index = cart.findIndex(item => item.id === id);
    if (index === -1) return;
    cart[index].quantity = (cart[index].quantity || 1) + delta;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    cartRef.set(cart);
  });
}

// ========================
// Checkout
// ========================
function checkout() {
  if (!currentUser) return alert("Bạn cần đăng nhập!");
  cartRef.once("value").then(snapshot => {
    const cart = snapshot.val() || [];
    if (cart.length === 0) return alert("Giỏ hàng trống!");

    const ordersRef = db.ref("orders/" + currentUser.uid);
    const orderKey = ordersRef.push().key;
    ordersRef.child(orderKey).set({
      items: cart,
      status: "Đang xử lý",
      createdAt: new Date().toISOString()
    }).then(() => {
      cartRef.remove(); // Clear cart after checkout
      alert("Đặt hàng thành công!");
    });
  });
}

// ========================
// Badge realtime
// ========================
function updateBadge(cart) {
  if (!cartCountEl) return;
  let count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  cartCountEl.innerText = count;
}
