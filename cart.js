/* =========================
   GET CART
========================= */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

/* =========================
   GET PRODUCTS
========================= */
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

/* =========================
   RENDER CART
========================= */
function renderCart() {

  // luôn đọc cart mới nhất
  let cart = getCart();

  const box = document.getElementById("cartList");
  const totalBox = document.getElementById("total");

  box.innerHTML = "";

  if (cart.length === 0) {
    box.innerHTML = "<div class='empty'>Giỏ hàng trống 🛒</div>";
    totalBox.innerHTML = "";
    renderCartAction();
    return;
  }

  let total = 0;

  // luôn đọc products mới nhất
  const products = getProducts();

  cart.forEach((item, index) => {

    const p = products.find(x => String(x.id) === String(item.id));

    if (!p) return;

    // GIÁ THẬT
    const price = Number(p.price) || 0;

    // SỐ LƯỢNG
    const qty = Number(item.quantity || 1);

    // THÀNH TIỀN
    const itemTotal = price * qty;

    total += itemTotal;

    box.innerHTML += `
      <div class="item">

        <img src="${p.img || ''}" alt="">

        <div class="info">

          <h4>${p.name || 'Không tên'}</h4>

          <div class="price">

            <span class="new-price">
              ${price.toLocaleString()}đ
            </span>

            × ${qty}

            =

            <b style="color:#e53935">
              ${itemTotal.toLocaleString()}đ
            </b>

          </div>

        </div>

        <button class="remove" onclick="removeItem(${index})">
          Xoá
        </button>

      </div>
    `;
  });

  totalBox.innerHTML = `
    Tổng tiền:
    <b style="color:#e53935">
      ${total.toLocaleString()}đ
    </b>
  `;

  renderCartAction();
}

/* =========================
   REMOVE ITEM
========================= */
function removeItem(index) {

  let cart = getCart();

  cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(cart));

  renderCart();
}

/* =========================
   CART ACTION
========================= */
function renderCartAction() {

  const actionBox = document.getElementById("cartAction");

  if (!actionBox) return;

  const cart = getCart();

  if (cart.length > 0) {

    actionBox.innerHTML = `
      <a href="checkout.html">
        <button class="checkout">
          💳 Thanh toán
        </button>
      </a>
    `;

  } else {

    actionBox.innerHTML = `
      <div class="empty-box">

        <a href="index.html">

          <button
            class="checkout"
            style="background:#2196f3"
          >
            🛍️ Quay lại mua hàng
          </button>

        </a>

      </div>
    `;
  }
}

/* =========================
   ADD TO CART
========================= */
function addToCart(product) {

  let cart = getCart();

  let index = cart.findIndex(
    item => String(item.id) === String(product.id)
  );

  if (index !== -1) {

    cart[index].quantity += 1;

  } else {

    cart.push({
      id: product.id,
      quantity: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  renderCart();
}

/* =========================
   AUTO UPDATE KHI STORAGE ĐỔI
========================= */
window.addEventListener("storage", () => {
  renderCart();
});

/* =========================
   INIT
========================= */
renderCart();
