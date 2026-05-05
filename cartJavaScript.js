let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() {
  const box = document.getElementById("cartList");
  const totalBox = document.getElementById("total");

  box.innerHTML = "";

  if (cart.length === 0) {
    box.innerHTML = "<div class='empty'>Giỏ hàng trống 🛒</div>";
    totalBox.innerHTML = "";
    
    renderCartAction(); // ✅ thêm dòng này
    return;
  }

  let total = 0;

  cart.forEach((p, index) => {

    let price = Number(p.price) || 0;
   let qty = Number(p.qty) || 1;
    total += price;

    box.innerHTML += `
      <div class="item">
        <img src="${p.img || ''}">

        <div class="info">
          <h4>${p.name || 'Không tên'}</h4>
          <div class="price">${price.toLocaleString()}đ</div>
        </div>

        <button class="remove" onclick="removeItem(${index})">
          Xoá
        </button>
      </div>
    `;
  });

  totalBox.innerHTML = "Tổng tiền: " + total.toLocaleString() + "đ";

  renderCartAction(); // ✅ thêm dòng này
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// ✅ THÊM MỚI (không ảnh hưởng code cũ)
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
        <p>🛒 Giỏ hàng đang trống</p>
        <a href="index.html">
          <button class="checkout" style="background:#2196f3">
            🛍️ Quay lại mua hàng
          </button>
        </a>
      </div>
    `;
  }
}

renderCart();