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
  const products = getProducts();

  // Cập nhật giá mới cho cart
  cart = cart.map(item => {
    const p = products.find(x => String(x.id) === String(item.id));
    if(!p) return item;
    return {
      ...item,
      price: p.price,
      oldPrice: p.oldPrice || null,
      name: p.name,
      img: p.img
    };
  });

  cart.forEach((item, index) => {
    const price = Number(item.price) || 0;
    const oldPrice = Number(item.oldPrice) || 0;
    const qty = item.quantity || 1;
    const itemTotal = price * qty;
    total += itemTotal;

    box.innerHTML += `
      <div class="item">
        <img src="${item.img || ''}">
        <div class="info">
          <h4>${item.name || 'Không tên'}</h4>
          <div class="price">
            ${oldPrice > price ? `<span class="old-price">${oldPrice.toLocaleString()}đ</span> ` : ''}
            ${price.toLocaleString()}đ × ${qty} = 
            <b style="color:#e53935">${itemTotal.toLocaleString()}đ</b>
            ${oldPrice > price ? `<span class="sale">-${Math.round(((oldPrice-price)/oldPrice)*100)}%</span>` : ''}
          </div>
        </div>
        <button class="remove" onclick="removeItem(${index})">Xoá</button>
      </div>
    `;
  });

  // Lưu cart đã cập nhật giá
  localStorage.setItem("cart", JSON.stringify(cart));

  totalBox.innerHTML = "Tổng tiền: " + total.toLocaleString() + "đ";

  renderCartAction();
}
