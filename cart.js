// =========================
// 📦 LẤY DATA CART VÀ PRODUCTS
// =========================
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

function formatPrice(n) {
  return Number(n).toLocaleString("vi-VN") + "đ";
}

// =========================
// 🖥 RENDER CART/ CHECKOUT
// =========================
function renderCartOrCheckout(containerId, totalId) {
  const box = document.getElementById(containerId);
  const totalBox = document.getElementById(totalId);
  if (!box || !totalBox) return;

  let cart = getCart();
  const products = getProducts();

  // cập nhật giá mới từ products
  cart = cart.map(item => {
    const p = products.find(x => String(x.id) === String(item.id));
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

  cart.forEach((item, index) => {
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
        ${containerId === "cartList" ? `<button onclick="removeItem(${index})">Xoá</button>` : ""}
      </div>
      <hr>
    `;
  });

  totalBox.innerText = formatPrice(total);

  // lưu cart đã cập nhật giá mới
  localStorage.setItem("cart", JSON.stringify(cart));
}

// =========================
// 🧹 XOÁ ITEM
// =========================
function removeItem(index) {
  let cart = getCart();
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCartOrCheckout("cartList", "total");
}

// =========================
// 🛒 ADD TO CART
// =========================
function addToCart(product) {
  let cart = getCart();
  const index = cart.findIndex(item => item.id === product.id);
  if (index !== -1) {
    cart[index].quantity = (cart[index].quantity || 1) + 1;
  } else {
    cart.push({ id: product.id, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCartOrCheckout("cartList", "total");
}

// =========================
// 🚀 INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  // dùng chung cho cart.html hoặc checkout.html
  if (document.getElementById("cartList")) renderCartOrCheckout("cartList", "total");
  if (document.getElementById("cart")) renderCartOrCheckout("cart", "total");
});
