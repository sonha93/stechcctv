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

// FIX double initialize
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
// USER
// ========================
let currentUser = null;
let cartRef = null;

// ========================
// AUTH
// ========================
auth.onAuthStateChanged(user => {

  if (!user) {
    console.log("Chưa đăng nhập");
    return;
  }

  currentUser = user;

  console.log("UID:", currentUser.uid);

  cartRef = db.ref("carts/" + currentUser.uid);

  // realtime cart
  cartRef.on("value", snapshot => {

    const cart = snapshot.val() || [];

    console.log("Cart Firebase:", cart);

    // nếu có trang cart.html
    if (cartList) {
      renderCart(cart);
    }

    // badge realtime
    updateBadge(cart);

  });

});

// ========================
// ADD TO CART
// DÙNG CHO TẤT CẢ TRANG
// ========================
window.addToCart = function(id) {

  if (!currentUser) {
    alert("Bạn cần đăng nhập!");
    return;
  }

  // lấy sản phẩm từ localStorage
  const products =
    JSON.parse(localStorage.getItem("products")) || [];

  const product =
    products.find(
      p => String(p.id) === String(id)
    );

  if (!product) {
    alert("Không tìm thấy sản phẩm");
    return;
  }

  cartRef.once("value").then(snapshot => {

    let cart = snapshot.val() || [];

    const index = cart.findIndex(
      item => String(item.id) === String(id)
    );

    // đã có
    if (index !== -1) {

      cart[index].quantity =
        (cart[index].quantity || 1) + 1;

    }

    // chưa có
    else {

      cart.push({

        id: product.id,
        name: product.name || "",
        price: Number(product.price) || 0,
        oldPrice: Number(product.oldPrice) || 0,
        img: product.img || "",
        quantity: 1

      });

    }

    // save firebase
    cartRef.set(cart).then(() => {

      alert("Đã thêm vào giỏ 🛒");

    });

  });

};

// ========================
// RENDER CART
// ========================
function renderCart(cart) {

  if (!cartList) return;

  cartList.innerHTML = "";

  // empty
  if (!cart || cart.length === 0) {

    cartList.innerHTML =
      "<p class='empty'>Giỏ hàng trống 🛒</p>";

    if (totalBox) {
      totalBox.innerHTML = "";
    }

    if (cartAction) {
      cartAction.innerHTML = "";
    }

    return;
  }

  let total = 0;

  cart.forEach(item => {

    const qty = item.quantity || 1;

    const itemTotal =
      (Number(item.price) || 0) * qty;

    total += itemTotal;

    const div = document.createElement("div");

    div.className = "item";

    div.innerHTML = `

      <img src="${item.img || ''}">

      <div class="info">

        <b>${item.name || ''}</b>

        <div class="price-new">
          ${(Number(item.price) || 0).toLocaleString()}đ
        </div>

        ${
          item.oldPrice > item.price
          ? `
            <div class="price-old">
              ${Number(item.oldPrice).toLocaleString()}đ
            </div>
          `
          : ""
        }

        <div style="margin-top:6px;">
          SL: ${qty}
        </div>

        <div style="margin-top:6px;color:red;font-weight:bold;">
          ${itemTotal.toLocaleString()}đ
        </div>

        <div class="qty">

          <button onclick="changeQty('${item.id}',-1)">
            -
          </button>

          <span>${qty}</span>

          <button onclick="changeQty('${item.id}',1)">
            +
          </button>

        </div>

      </div>

      <button
        class="remove"
        onclick="removeItem('${item.id}')"
      >
        🗑
      </button>

    `;

    cartList.appendChild(div);

  });

  // total
  if (totalBox) {

    totalBox.innerHTML =
      "Tổng: " +
      total.toLocaleString() +
      "đ";

  }

  // button checkout
  if (cartAction) {

    cartAction.innerHTML = `
      <button
        class="checkout"
        onclick="checkout()"
      >
        Đặt hàng
      </button>
    `;

  }

}

// ========================
// REMOVE ITEM
// ========================
window.removeItem = function(id) {

  if (!currentUser) return;

  cartRef.once("value").then(snapshot => {

    let cart = snapshot.val() || [];

    cart = cart.filter(
      item => String(item.id) !== String(id)
    );

    cartRef.set(cart);

  });

};

// ========================
// CHANGE QTY
// ========================
window.changeQty = function(id, delta) {

  if (!currentUser) return;

  cartRef.once("value").then(snapshot => {

    let cart = snapshot.val() || [];

    const index = cart.findIndex(
      item => String(item.id) === String(id)
    );

    if (index === -1) return;

    cart[index].quantity =
      (cart[index].quantity || 1) + delta;

    if (cart[index].quantity < 1) {
      cart[index].quantity = 1;
    }

    cartRef.set(cart);

  });

};

// ========================
// CHECKOUT
// ========================
window.checkout = function() {

  if (!currentUser) {
    alert("Bạn cần đăng nhập!");
    return;
  }

  cartRef.once("value").then(snapshot => {

    const cart = snapshot.val() || [];

    if (cart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    const ordersRef =
      db.ref("orders/" + currentUser.uid);

    const orderKey =
      ordersRef.push().key;

    ordersRef.child(orderKey).set({

      items: cart,
      status: "Đang xử lý",
      createdAt: new Date().toISOString()

    }).then(() => {

      cartRef.remove();

      alert("Đặt hàng thành công!");

    });

  });

};

// ========================
// BADGE REALTIME
// ========================
function updateBadge(cart) {

  if (!cartCountEl) return;

  let count = 0;

  cart.forEach(item => {

    count += item.quantity || 1;

  });

  cartCountEl.innerText = count;

}
