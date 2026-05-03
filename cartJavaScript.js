let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() {
  const box = document.getElementById("cartList");
  const totalBox = document.getElementById("total");

  box.innerHTML = "";

  if (cart.length === 0) {
    box.innerHTML = "<div class='empty'>Giỏ hàng trống 🛒</div>";
    totalBox.innerHTML = "";
    return;
  }

  let total = 0;

  cart.forEach((p, index) => {

    let price = Number(p.price) || 0;
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
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

renderCart();