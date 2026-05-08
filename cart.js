let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* =========================
   GET PRODUCTS (an toàn)
========================= */
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

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

  const products = getProducts();
  let total = 0;

  // Cập nhật giá mới từ products cho mỗi item
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

    let priceHTML = '';
    if (oldPrice > price) {
      priceHTML = `<span class="old-price">${oldPrice.toLocaleString()}đ</span> 
                   ${price.toLocaleString()}đ × ${qty} = 
                   <b style="color:#e53935">${itemTotal.toLocaleString()}đ</b>
                   <span class="sale">-${Math.round(((oldPrice-price)/oldPrice)*100)}%</span>`;
    } else {
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

  totalBox.innerHTML = "Tổng tiền: " + total.toLocaleString() + "đ";

  // Lưu lại cart đã cập nhật giá mới
  localStorage.setItem("cart", JSON.stringify(cart));

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
   CART ACTION
========================= */
function renderCartAction() {
  const actionBox = document.getElementById("cartAction");
  if (!actionBox) return;

  if (cart.length > 0) {
    actionBox.innerHTML = `<a href="checkout.html">
      <button class="checkout">💳 Thanh toán</button>
    </a>`;
  } else {
    actionBox.innerHTML = `<div class="empty-box">
      <a href="index.html">
        <button class="checkout" style="background:#2196f3">🛍️ Quay lại mua hàng</button>
      </a>
    </div>`;
  }
}

/* =========================
   ADD TO CART
========================= */
function addToCart(product) {
  let index = cart.findIndex(item => item.id === product.id);
  if (index !== -1) {
    cart[index].quantity = (cart[index].quantity || 1) + 1;
  } else {
    cart.push({ id: product.id, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

/* =========================
   INIT
========================= */
renderCart();
