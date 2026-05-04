/* =========================
   🔥 CAMERA TRONG NHÀ JS
   (KHÔNG ĐỤNG APP.JS)
========================= */

/* =========================
   GET DATA
========================= */
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

/* =========================
   PAGE CATEGORY FIX CỨNG
========================= */
function getPageCategory() {
  return "cam-in";
}

/* =========================
   SPEC RENDER
========================= */
function renderSpec(p) {
  return `
    📷 Độ phân giải: ${p.spec?.doPhanGiai || ""}<br>
    👁 Góc nhìn: ${p.spec?.gocNhin || ""}<br>
    📡 Kết nối: ${p.spec?.ketNoi || ""}
  `;
}

/* =========================
   RENDER PRODUCTS
========================= */
function render(list) {
  const box = document.getElementById("products");
  if (!box) return;

  if (!list) list = getProducts();

  // chỉ camera trong nhà
  list = list.filter(p => p.category === "cam-in");

  box.innerHTML = "";

  if (list.length === 0) {
    box.innerHTML = "<p>Chưa có sản phẩm</p>";
    return;
  }

  list.forEach(p => {
    if (!p.id) return;

    const id = String(p.id);

    // lấy giá từ price-engine nếu có
    const priceToShow =
      (typeof getFinalPrice === "function")
        ? getFinalPrice(p)
        : p.price;

    const isSale =
      (typeof isSaleActive === "function")
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
   TOGGLE SPEC
========================= */
window.toggleSpec = function(id) {
  const el = document.getElementById(`spec-${id}`);
  if (!el) return;
  el.style.display = (el.style.display === "block") ? "none" : "block";
};

/* =========================
   ADD TO CART
========================= */
window.addToCart = function(id) {
  const product = getProducts().find(p => String(p.id) === String(id));
  if (!product) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const exist = cart.find(i => String(i.id) === String(id));

  if (exist) {
    exist.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Đã thêm vào giỏ 🛒");
};

/* =========================
   SEARCH
========================= */
const search = document.getElementById("search");

if (search) {
  search.addEventListener("input", e => {
    const key = e.target.value.toLowerCase();

    let data = getProducts().filter(p => p.category === "cam-in");

    render(
      data.filter(p => p.name.toLowerCase().includes(key))
    );
  });
}

/* =========================
   INIT + AUTO REFRESH PRICE SYNC
========================= */
document.addEventListener("DOMContentLoaded", () => {
  render();

  // tự refresh khi hết giờ KM
  setInterval(render, 10000);
});
/* =========================
   📱 FIX MENU 3 GẠCH (OVERLAY + SIDEBAR)
   BẮT BUỘC GLOBAL SCOPE
========================= */

window.toggleMenu = function () {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  if (!sidebar || !overlay) return;

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
};

/* =========================
   🔒 CHẶN CLICK BỊ CHỒNG LỚP
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector("header div");

  if (btn) {
    btn.style.cursor = "pointer";

    // ép chắc chắn click hoạt động
    btn.onclick = function () {
      window.toggleMenu();
    };
  }
});