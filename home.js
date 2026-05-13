function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

/* =========================
   🖥 RENDER HOME (CLEAN - NO TIME SALE)
========================= */
function renderHome() {
  const box = document.getElementById("products");
  if (!box) return;

  const products = getProducts();
  const featured = products.filter(p => p.featured === true);

  box.innerHTML = "";

  if (featured.length === 0) {
    box.innerHTML = "<p>Chưa có sản phẩm nổi bật</p>";
    return;
  }

  featured.forEach(p => {

    const id = String(p.id);

    // ✅ CHỈ ĐỔI: dùng text thay vì badge ngoài
    let percentText = "";
    if (p.oldPrice && p.oldPrice > p.price) {
      const percent = Math.round((1 - p.price / p.oldPrice) * 100);
      percentText = `-${percent}%`;
    }

    let imgUrl = p.img || "https://via.placeholder.com/300";

    box.innerHTML += `
      <div class="item">

        <img 
          src="${imgUrl}" 
          onclick="openZoom('${imgUrl}')"
          onerror="this.src='https://via.placeholder.com/300'"
        >

        <h4>${p.name}</h4>

        <!-- ✅ CHỈ SỬA ĐÚNG CHỖ NÀY -->
        <div class="price-box">
          <span class="price">${Number(p.price).toLocaleString()}đ</span>

          ${
            p.oldPrice && p.oldPrice > p.price
              ? `<span class="old-price">${Number(p.oldPrice).toLocaleString()}đ</span>`
              : ""
          }

          ${
            percentText
              ? `<span class="discount-text">${percentText}</span>`
              : ""
          }
        </div>

        <button class="spec-btn" onclick="toggleSpec('${id}')">
          ⚙️ Xem thông số
        </button>

        <button class="cart-btn" onclick="addToCart('${id}')">
          🛒 Mua ngay
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
window.toggleSpec = function(id){
  const el = document.getElementById("spec-" + id);
  if (!el) return;
  el.style.display = (el.style.display === "block") ? "none" : "block";
};

/* =========================
   🛒 ADD TO CART
========================= */
window.addToCart = function(id){
  const products = getProducts();
  const product = products.find(p => String(p.id) === String(id));

  if (!product) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const exist = cart.find(item => String(item.id) === String(id));

  if (exist) {
    exist.quantity = (exist.quantity || 1) + 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Đã thêm vào giỏ 🛒");
};

/* =========================
   🧾 SPEC RENDER (GIỮ NGUYÊN)
========================= */
function renderSpec(p) {
  const s = p.spec || {};

  return `
   - Độ phân giải: ${s.doPhanGiai || "—"}<br>
   - Góc nhìn: ${s.gocNhin || "—"}<br>
   - Kết nối: ${s.ketNoi || "—"}<br>
   - Bảo hành: ${s.baoHanh || ""}<br>
  `;
}

/* =========================
   🚀 INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  renderHome();
});
