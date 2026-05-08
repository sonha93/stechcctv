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

  const products = getProducts();
  let total = 0;

  cart.forEach((item, index) => {
    const p = products.find(x => String(x.id) === String(item.id));
    if (!p) return;

    const price = Number(p.price);
    const oldPrice = Number(p.oldPrice) || 0;
    const qty = item.quantity || 1;
    const itemTotal = price * qty;
    total += itemTotal;

    // Hiển thị giá cẩn thận: chỉ khi oldPrice > price mới show giá cũ + sale
    let priceHTML = '';
    if (oldPrice > price) {
      priceHTML = `<span class="old-price">${oldPrice.toLocaleString()}đ</span> ${price.toLocaleString()}đ × ${qty} = 
        <b style="color:#e53935">${itemTotal.toLocaleString()}đ</b>
        <span class="sale">-${Math.round(((oldPrice-price)/oldPrice)*100)}%</span>`;
    } else {
      priceHTML = `${price.toLocaleString()}đ × ${qty} = <b style="color:#e53935">${itemTotal.toLocaleString()}đ</b>`;
    }

    box.innerHTML += `
      <div class="item">
        <img src="${p.img}">
        <div class="info">
          <h4>${p.name}</h4>
          <div class="price">${priceHTML}</div>
        </div>
        <button class="remove" onclick="removeItem(${index})">Xoá</button>
      </div>
    `;
  });

  totalBox.innerHTML = "Tổng tiền: " + total.toLocaleString() + "đ";

  renderCartAction();
}
