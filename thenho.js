/* =========================
   🔥 GET DATA
========================= */
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

/* =========================
   📌 PAGE CATEGORY (THẺ NHỚ)
========================= */
function getPageCategory() {
  return "sd";
}

/* =========================
   🎯 SPEC RENDER (GIỮ NGUYÊN)
========================= */
function renderSpec(p) {
  if (p.category === "sd") {
    return `
      📦 Dung lượng: ${p.spec?.dungLuong || ""}<br>
      ⚡ Tốc độ: ${p.spec?.tocDo || ""}<br>
      💾 Loại: ${p.spec?.loai || ""}<br>
      🛡 Bảo hành: ${p.spec?.baoHanh || ""}
    `;
  }
  return "";
}

/* =========================
   🖥 RENDER PRODUCTS (FIX GIÁ CHUẨN ENGINE)
========================= */
function render(list) {
  const box = document.getElementById("products");
  if (!box) return;

  if (!list) list = getProducts();

  // chỉ lấy thẻ nhớ
  list = list.filter(p => p.category === "sd");

  box.innerHTML = "";

  if (list.length === 0) {
    box.innerHTML = "<p>Chưa có sản phẩm</p>";
    return;
  }

  list.forEach(p => {
    if (!p.id) return;

    const id = String(p.id);

    /* =========================
       🔥 GIÁ CHUẨN TỪ PRICE-ENGINE
    ========================= */
    const priceToShow = (typeof getFinalPrice === "function")
      ? getFinalPrice(p)
      : p.price;

    const isSale = (typeof isSaleActive === "function")
      ? isSaleActive(p)
      : false;

    let percentText = "";

    if (isSale && p.oldPrice && p.oldPrice > priceToShow) {
      const percent = Math.round((1 - priceToShow / p.oldPrice) * 100);
      percentText = `-${percent}%`;
    }

    box.innerHTML += `
      <div class="item">

        ${percentText ? `<div class="discount-text">${percentText}</div>` : ""}

        <img src="${p.img}" />

        <h4>${p.name}</h4>

        <div class="price-box">
          <span class="price">${Number(priceToShow).toLocaleString()}đ</span>

          ${
            p.oldPrice && p.oldPrice > priceToShow
              ? `<span class="old-price">${Number(p.oldPrice).toLocaleString()}đ</span>`
              : ""
          }

          ${isSale ? `<span class="sale-tag">SALE</span>` : ""}
        </div>

        <button class="spec-btn" onclick="toggleSpec('${id}')">
          ⚙️ Xem thông số
        </button>

        <button class="cart-btn" onclick="addToCart('${id}')">
          🛒 Thêm vào giỏ
        </button>

        <div class="spec-box" id="spec-${id}" style="display:none;">
          ${renderSpec(p)}
        </div>

      </div>
    `;
  });
}

/* =========================
   ⚙️ TOGGLE SPEC
========================= */
window.toggleSpec = function(id) {
  const el = document.getElementById(`spec-${id}`);
  if (!el) return;
  el.style.display = (el.style.display === "block") ? "none" : "block";
};

/* =========================
   🛒 ADD TO CART
========================= */
window.addToCart = function(id) {
  const product = getProducts().find(p => String(p.id) === String(id));
  if (!product) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const exist = cart.find(item => String(item.id) === String(id));

  if (exist) {
    exist.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Đã thêm vào giỏ 🛒");
};

/* =========================
   🔍 SEARCH
========================= */
const search = document.getElementById("search");

if (search) {
  search.addEventListener("input", e => {
    const key = e.target.value.toLowerCase();

    let data = getProducts().filter(p => p.category === "sd");

    render(
      data.filter(p => p.name.toLowerCase().includes(key))
    );
  });
}

/* =========================
   INIT + AUTO REFRESH (FIX HẾT GIỜ KM)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  render();

  // tự cập nhật để hết giờ là đổi giá ngay
  setInterval(render, 10000);
});
window.toggleMenu = function() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  if (!sidebar || !overlay) return;

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
};