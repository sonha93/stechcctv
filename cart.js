let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* =========================
   RENDER CART
========================= */
function renderCart() {
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

  cart.forEach((p, index) => {

    let price = Number(p.price) || 0;

    // ✅ FIX: dùng qty thống nhất (quan trọng)
    let qty = p.quantity || p.qty || 1;

    let itemTotal = price * qty;
    total += itemTotal;

    box.innerHTML += `
      <div class="item">
        <img src="${p.img || ''}">

        <div class="info">
          <h4>${p.name || 'Không tên'}</h4>

          <div class="price">
            ${price.toLocaleString()}đ × ${qty} = 
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

  totalBox.innerHTML = "Tổng tiền: " + total.toLocaleString() + "đ";

  renderCartAction();
}

/* =========================
   REMOVE ITEM
========================= */
function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

/* =========================
   CART ACTION BUTTON
========================= */
function renderCartAction() {
  const actionBox = document.getElementById("cartAction");
  if (!actionBox) return;

  if (cart.length > 0) {
    actionBox.innerHTML = `
      <a href="checkout.html">
        <button class="checkout">💳 Thanh toán</button>
      </a>
    `;
  } else {
    actionBox.innerHTML = `
      <div class="empty-box">
        <a href="index.html">
          <button class="checkout" style="background:#2196f3">
            🛍️ Quay lại mua hàng
          </button>
        </a>
      </div>
    `;
  }
}

/* =========================
   ADD TO CART (FIX QUAN TRỌNG)
========================= */
function addToCart(product){

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let index = cart.findIndex(item => item.id === product.id);

  if(index !== -1){
    // ✔ tăng số lượng
    cart[index].quantity = (cart[index].quantity || cart[index].qty || 1) + 1;
  } else {
    // ✔ thêm mới
    cart.push({
      ...product,
      quantity: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================
   INIT
========================= */
renderCart();