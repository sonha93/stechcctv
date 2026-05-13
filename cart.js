// ======================= Cart.js duy nhất =======================

var auth = firebase.auth();
var db = firebase.database();

let currentUser = null;
let cart = [];

// Badge giỏ hàng
const cartCountEl = document.querySelector(".header-icons .cart-count");

// ======================= AUTH & LOAD CART =======================
firebase.auth().onAuthStateChanged(user => {

  cart = [];

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  loadCart();
});

// ======================= LOAD CART =======================
function loadCart() {

  if (!currentUser) return;

  const userCartRef = db.ref("carts/" + currentUser.uid);

  userCartRef.on("value", snap => {

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

          <div class="price-new">
            ${price.toLocaleString()}đ
          </div>

          ${
            item.oldPrice
            ? `<div class="price-old">${item.oldPrice.toLocaleString()}đ</div>`
            : ''
          }

          <div class="qty">

            <button onclick="changeQty(${i},-1)">-</button>

            <span>${qty}</span>

            <button onclick="changeQty(${i},1)">+</button>

          </div>

        </div>

        <button class="remove" onclick="removeItem(${i})">
          🗑
        </button>

      </div>
    `;

  }).join("");

  totalBox.innerHTML =
    "Tổng: " + total.toLocaleString() + "đ";

  actionBox.innerHTML =
    `<button class="checkout" onclick="checkout()">
      Đặt hàng
    </button>`;
}

// ======================= UPDATE BADGE =======================
function updateBadge() {

  if (!cartCountEl) return;

  const count =
    cart.reduce((sum, i) =>
      sum + (i.qty || 1), 0);

  cartCountEl.innerText = count;
}

// ======================= CHANGE QTY =======================
function changeQty(index, delta) {

  if (!cart[index]) return;

  cart[index].qty =
    (cart[index].qty || 1) + delta;

  if (cart[index].qty < 1)
    cart[index].qty = 1;

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

  db.ref("carts/" + currentUser.uid)
    .set(cart);
}

// ======================= CHECKOUT =======================
function checkout() {

  if (!currentUser) return;

  db.ref("orders/" + currentUser.uid)
    .push(cart)
    .then(() => {

      alert("Đặt hàng thành công!");

      window.location.href = "checkout.html";

    });
}

// ======================= ADD TO CART =======================
function addToCart(product) {

  const user = auth.currentUser;

  if (!user) {
    alert("Bạn cần đăng nhập!");
    return;
  }

  currentUser = user;

  // Nếu truyền ID dạng string
  if (typeof product === "string") {

    const products =
      JSON.parse(localStorage.getItem("products")) || [];

    product =
      products.find(p =>
        String(p.id) === String(product)
      );

    if (!product) {
      alert("Không tìm thấy sản phẩm!");
      return;
    }
  }


  const index =
    cart.findIndex(i => i.id === product.id);

  // Có rồi thì tăng số lượng
  if (index !== -1) {

    cart[index].qty =
      (cart[index].qty || 1) + 1;

  } else {

    // Chưa có thì thêm mới
    cart.push({
      ...product,
      qty: 1
    });
  }

  saveCart();

  renderCart();

  updateBadge();

  alert("✅ Đã thêm vào giỏ hàng!");
}
