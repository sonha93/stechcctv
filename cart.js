/* =========================
   🛒 CART.JS FULL FIX
========================= */

/* =========================
   GET CART
========================= */
function getCart() {

  return JSON.parse(
    localStorage.getItem("cart")
  ) || [];

}

/* =========================
   GET PRODUCTS
========================= */
function getProducts() {

  return JSON.parse(
    localStorage.getItem("products")
  ) || [];

}

/* =========================
   RENDER CART
========================= */
function renderCart() {

  // luôn lấy cart mới nhất
  const cart = getCart();

  const box =
    document.getElementById("cartList");

  const totalBox =
    document.getElementById("total");

  if (!box || !totalBox) return;

  box.innerHTML = "";

  /* EMPTY */
  if (cart.length === 0) {

    box.innerHTML = `
      <div class="empty">
        Giỏ hàng trống 🛒
      </div>
    `;

    totalBox.innerHTML = "";

    renderCartAction();

    return;
  }

  let total = 0;

  // luôn lấy products mới nhất
  const products = getProducts();

  cart.forEach((item, index) => {

    const p =
      products.find(
        x =>
          String(x.id) === String(item.id)
      );

    // nếu sản phẩm đã xoá
    if (!p) return;

    /* PRICE */
    const price =
      Number(p.price) || 0;

    /* OLD PRICE */
    const oldPrice =
      Number(p.oldPrice) || 0;

    /* SALE */
    const hasDiscount =
      oldPrice > price;

    /* QTY */
    const qty =
      Number(
        item.quantity ||
        item.qty ||
        1
      );

    /* ITEM TOTAL */
    const itemTotal =
      price * qty;

    total += itemTotal;

    box.innerHTML += `

      <div class="item">

        <!-- IMAGE -->
        <img
          src="${p.img || ''}"
          alt=""
        >

        <!-- INFO -->
        <div class="info">

          <h4>
            ${p.name || 'Không tên'}
          </h4>

          <!-- PRICE -->
          <div class="price-box">

            <span class="price">
              ${price.toLocaleString()}đ
            </span>

            ${
              hasDiscount
              ? `
                <span class="old-price">
                  ${oldPrice.toLocaleString()}đ
                </span>
              `
              : ""
            }

          </div>

          <!-- QTY -->
          <div class="qty-box">

            × ${qty}

            =

            <b style="color:#e53935">
              ${itemTotal.toLocaleString()}đ
            </b>

          </div>

        </div>

        <!-- REMOVE -->
        <button
          class="remove"
          onclick="removeItem(${index})"
        >
          Xoá
        </button>

      </div>

    `;
  });

  /* TOTAL */
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

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  renderCart();
}

/* =========================
   CART ACTION
========================= */
function renderCartAction() {

  const actionBox =
    document.getElementById(
      "cartAction"
    );

  if (!actionBox) return;

  const cart = getCart();

  /* HAS ITEM */
  if (cart.length > 0) {

    actionBox.innerHTML = `

      <a href="checkout.html">

        <button class="checkout">
          💳 Thanh toán
        </button>

      </a>

    `;

  }

  /* EMPTY */
  else {

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
   AUTO UPDATE
========================= */
window.addEventListener(
  "storage",
  () => {
    renderCart();
  }
);

/* =========================
   FIX OLD CART DATA
========================= */
function fixOldCartData() {

  let cart = getCart();

  cart = cart.map(item => {

    return {

      // CHỈ GIỮ ID + QUANTITY
      id: item.id,

      quantity:
        Number(
          item.quantity ||
          item.qty ||
          1
        )

    };

  });

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );
}

fixOldCartData();

/* =========================
   INIT
========================= */
document.addEventListener(
  "DOMContentLoaded",
  () => {
    renderCart();
  }
);
