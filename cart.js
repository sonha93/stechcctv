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

  const products = getProducts(); // Lấy giá mới từ app.js
  let total = 0;

  // Cập nhật cart với giá mới
  cart = cart.map(item => {
    const p = products.find(prod => String(prod.id) === String(item.id));
    if (!p) return item;
    return {
      ...item,
      price: Number(p.price),
      oldPrice: Number(p.oldPrice) || 0,
      name: p.name,
      img: p.img
    };
  });

  cart.forEach((item, index) => {
    const price = item.price;
    const oldPrice = item.oldPrice;
    const qty = item.quantity || 1;
    const itemTotal = price * qty;
    total += itemTotal;

    // Nếu oldPrice > price thì show giá cũ + sale
    let priceHTML;
    if (oldPrice && oldPrice > price) {
      priceHTML = `<span class="old-price">${oldPrice.toLocaleString()}đ</span> 
                   ${price.toLocaleString()}đ × ${qty} = 
                   <b style="color:#e53935">${itemTotal.toLocaleString()}đ</b>
                   <span class="sale">-${Math.round(((oldPrice-price)/oldPrice)*100)}%</span>`;
    } else {
      // Chỉ show giá hiện tại, không show oldPrice hay sale
      priceHTML = `${price.toLocaleString()}đ × ${qty} = <b style="color:#e53935">${itemTotal.toLocaleString()}đ</b>`;
    }

    box.innerHTML += `
      <div class="item">
        <img src="${item.img}">
        <div class="info">
          <h4>${item.name}</h4>
          <div class="price">${priceHTML}</div>
        </div>
        <button class="remove" onclick="removeItem(${index})">Xoá</button>
      </div>
    `;
  });

  // Cập nhật lại cart trong localStorage với giá mới
  localStorage.setItem("cart", JSON.stringify(cart));

  totalBox.innerHTML = "Tổng tiền: " + total.toLocaleString() + "đ";

  renderCartAction();
}
