// ========================
// FIREBASE CONFIG
// ========================
const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "stech-73b89.firebaseapp.com",
  databaseURL: "https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stech-73b89",
  storageBucket: "stech-73b89.appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

// init Firebase safe
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// ========================
// DOM
// ========================
const cartList = document.getElementById("cartList");
const totalBox = document.getElementById("total");
const cartAction = document.getElementById("cartAction");
const cartCountEl = document.getElementById("cartCount");

// ========================
// STATE
// ========================
let currentUser = null;
let cartRef = null;
let firebaseReady = false;

// ========================
// NORMALIZE Firebase object/array
// ========================
function normalize(data) {
  if (!data) return [];
  return Array.isArray(data) ? data : Object.values(data);
}

// ========================
// AUTH STATE
// ========================
auth.onAuthStateChanged(user => {
  if (!user) {
    currentUser = null;
    cartRef = null;
    firebaseReady = false;
    renderCart([]); // reset cart UI
    updateBadge([]);
    return;
  }

  currentUser = user;
  cartRef = db.ref("carts/" + user.uid);
  firebaseReady = true;

  // realtime cart update
  cartRef.on("value", snap => {
    const cart = normalize(snap.val());
    renderCart(cart);
    updateBadge(cart);
  });
});

// ========================
// ADD TO CART
// ========================
window.addToCart = function(id) {

  if (!firebaseReady || !currentUser || !cartRef) {
    alert("⚠ Firebase chưa sẵn sàng, hãy đăng nhập hoặc chờ 1–2 giây");
    return;
  }

  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products.find(p => String(p.id) === String(id));

  if (!product) {
    alert("Không tìm thấy sản phẩm");
    return;
  }

  cartRef.once("value").then(snap => {
    let cart = normalize(snap.val());

    const index = cart.findIndex(i => String(i.id) === String(id));

    if (index !== -1) {
      cart[index].quantity = (cart[index].quantity || 1) + 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name || "",
        price: Number(product.price) || 0,
        oldPrice: Number(product.oldPrice) || 0,
        img: product.img || "",
        quantity: 1
      });
    }

    return cartRef.set(cart);
  }).catch(err => {
    console.error("AddToCart error:", err);
    alert("Lỗi khi thêm giỏ hàng!");
  });

};

// ========================
// RENDER CART
// ========================
function renderCart(cart) {
  if (!cartList) return;

  cartList.innerHTML = "";
  if (!cart.length) {
    cartList.innerHTML = "<p class='empty'>Giỏ hàng trống 🛒</p>";
    if (totalBox) totalBox.innerHTML = "";
    if (cartAction) cartAction.innerHTML = "";
    return;
  }

  let total = 0;
  cart.forEach(item => {
    const qty = item.quantity || 1;
    const price = Number(item.price) || 0;
    const oldPrice = Number(item.oldPrice) || 0;
    const sum = price * qty;
    total += sum;

    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img src="${item.img || ''}">
      <div class="info">
        <b>${item.name || ''}</b>
        <div>${price.toLocaleString()}đ</div>
        ${oldPrice > price ? `<div class="old">${oldPrice.toLocaleString()}đ</div>` : ""}
        <div>SL: ${qty}</div>
        <div style="color:red;font-weight:bold;">${sum.toLocaleString()}đ</div>
        <div class="qty">
          <button onclick="changeQty('${item.id}',-1)">-</button>
          <span>${qty}</span>
          <button onclick="changeQty('${item.id}',1)">+</button>
        </div>
      </div>
      <button onclick="removeItem('${item.id}')">🗑</button>
    `;
    cartList.appendChild(div);
  });

  if (totalBox) totalBox.innerHTML = "Tổng: " + total.toLocaleString() + "đ";
  if (cartAction) cartAction.innerHTML = `<button onclick="checkout()">Đặt hàng</button>`;
}

// ========================
// REMOVE ITEM
// ========================
window.removeItem = function(id) {
  if (!cartRef) return;

  cartRef.once("value").then(snap => {
    let cart = normalize(snap.val());
    cart = cart.filter(i => String(i.id) !== String(id));
    cartRef.set(cart);
  });
};

// ========================
// CHANGE QTY
// ========================
window.changeQty = function(id, delta) {
  if (!cartRef) return;

  cartRef.once("value").then(snap => {
    let cart = normalize(snap.val());
    const i = cart.findIndex(x => String(x.id) === String(id));
    if (i === -1) return;
    cart[i].quantity = (cart[i].quantity || 1) + delta;
    if (cart[i].quantity < 1) cart[i].quantity = 1;
    cartRef.set(cart);
  });
};

// ========================
// CHECKOUT
// ========================
window.checkout = function() {
  if (!cartRef || !currentUser) return;

  cartRef.once("value").then(snap => {
    const cart = normalize(snap.val());
    if (!cart.length) return alert("Giỏ hàng trống!");
    const orderRef = db.ref("orders/" + currentUser.uid);
    const key = orderRef.push().key;

    orderRef.child(key).set({
      items: cart,
      status: "Đang xử lý",
      createdAt: new Date().toISOString()
    });

    cartRef.remove();
    alert("Đặt hàng thành công!");
  });
};

// ========================
// UPDATE BADGE
// ========================
function updateBadge(cart) {
  if (!cartCountEl) return;
  let count = 0;
  cart.forEach(i => count += i.quantity || 1);
  cartCountEl.innerText = count;
}
