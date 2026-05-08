function renderCheckout() {
  const box = document.getElementById("cart");
  const totalBox = document.getElementById("total");

  if (!box || !totalBox) return;

  let cart = getCart();
  const products = JSON.parse(localStorage.getItem("products")) || [];

  // 1️⃣ Cập nhật giá mới từ products cho cart
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

  box.innerHTML = "";

  if (cart.length === 0) {
    box.innerHTML = "<p>Giỏ hàng trống</p>";
    totalBox.innerText = "0";
    return;
  }

  let total = 0;

  cart.forEach(item => {
    const price = item.price || 0;
    const oldPrice = item.oldPrice || 0;
    const qty = Number(item.quantity || item.qty || 1);
    total += price * qty;

    const hasDiscount = oldPrice > price;

    box.innerHTML += `
      <div class="cart-item">
        <img src="${item.img}" style="width:60px">
        <div>
          <h4>${item.name}</h4>
          <div class="price-box">
            ${hasDiscount
              ? `<span class="old-price">${formatPrice(oldPrice)}</span> <span class="price">${formatPrice(price)}</span>`
              : `<span class="price">${formatPrice(price)}</span>`
            }
          </div>
          <p>Số lượng: ${qty}</p>
          <p>Thành tiền: ${formatPrice(price * qty)}</p>
        </div>
      </div>
      <hr>
    `;
  });

  totalBox.innerText = formatPrice(total);

  // 2️⃣ Lưu lại cart đã cập nhật giá mới
  localStorage.setItem("cart", JSON.stringify(cart));
}
