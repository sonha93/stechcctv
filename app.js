/* =========================
   🔥 GET DATA TỪ JSON
========================= */
async function getProducts() {
  const url = "https://raw.githubusercontent.com/sonha93/stechcctv/main/products.json";
  try {
    const res = await fetch(url);
    const data = await res.json();
    return normalizeList(data);
  } catch (err) {
    console.error("Load JSON lỗi:", err);
    return [];
  }
}

/* =========================
   🧠 NORMALIZE
========================= */
function normalizeProduct(p) {
  return {
    ...p,
    price: Number(p.price) || 0,
    oldPrice: Number(p.oldPrice) || 0,
    id: p.id || Date.now(),
    name: p.name || "",
    img: p.img || "",
    category: p.category || "",
    model: p.model || "",
    xuatXu: p.xuatXu || "",
    baoHanh: p.baoHanh || "",
    doPhanGiai: p.doPhanGiai || "",
    gocNhin: p.gocNhin || "",
    ketNoi: p.ketNoi || "",
    thietKe: p.thietKe || "",
    chatLieu: p.chatLieu || "",
    congSuat: p.congSuat || "",
    moTa: p.moTa || "",
    featured: p.featured || false
  };
}

function normalizeList(list) {
  return list.map(normalizeProduct);
}

/* =========================
   RENDER, ADD TO CART, SEARCH...
========================= */
async function render(list) {
  const box = document.getElementById("products");
  if (!box) return;

  if (!list) list = await getProducts();

  const category = getPageCategory();
  const isIndex =
    !window.location.pathname.includes("the-nho") &&
    !window.location.pathname.includes("camera-trong-nha") &&
    !window.location.pathname.includes("camera-ngoai-troi") &&
    !window.location.pathname.includes("combo");

  if (isIndex) list = list.filter(p => p.featured === true);
  if (!isIndex && category) list = list.filter(p => p.category === category);

  box.innerHTML = "";

  if (list.length === 0) {
    box.innerHTML = "<p>Chưa có sản phẩm</p>";
    return;
  }

  list.forEach(p => {
    const id = String(p.id);
    const price = Number(p.price);
    const oldPrice = Number(p.oldPrice);
    const hasDiscount = oldPrice > price;
    const percent = hasDiscount ? Math.round((1 - price / oldPrice) * 100) : 0;

    box.innerHTML += `
      <div class="item">
        <img src="${p.img}" onclick="goDetail('${id}')" style="cursor:pointer;">
        <h4>${p.name}</h4>
        <div class="price-box">
          <span class="price">${price.toLocaleString()}đ</span>
          ${hasDiscount ? `<span class="old-price">${oldPrice.toLocaleString()}đ</span>` : ""}
          ${percent ? `<span class="discount-text">-${percent}%</span>` : ""}
        </div>
        <button class="spec-btn" onclick="goDetail('${id}')">⚙️ Xem chi tiết</button>
        <button class="cart-btn" onclick="addToCart('${id}')">🛒 Thêm vào giỏ</button>
      </div>
    `;
  });
}

window.addToCart = async function (id) {
  const products = await getProducts();
  const product = normalizeList(products).find(p => String(p.id) === String(id));
  if (!product) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const exist = cart.find(item => String(item.id) === String(id));

  if (exist) exist.qty += 1;
  else cart.push({ id: product.id, name: product.name, price: product.price, oldPrice: product.oldPrice, img: product.img, qty: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Đã thêm vào giỏ 🛒");
};

document.addEventListener("DOMContentLoaded", () => {
  render();
});
