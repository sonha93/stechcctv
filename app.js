/* =========================
   🔥 GET DATA
========================= */
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

/* =========================
   📌 PAGE CATEGORY
========================= */
function getPageCategory() {
  const page = window.location.pathname.toLowerCase();

  if (page.includes("the-nho")) return "sd";
  if (page.includes("camera-trong-nha")) return "cam-in";
  if (page.includes("camera-ngoai-troi")) return "cam-ngoai";
  if (page.includes("combo")) return "combo";

  return null;
}

/* =========================
   🎯 SPEC RENDER (GIỮ NGUYÊN)
========================= */
function renderSpec(p) {
  if (p.category === "cam-in" || p.category === "cam-ngoai") {
    return `
      📷 Độ phân giải: ${p.spec?.doPhanGiai || ""}<br>
      👁 Góc nhìn: ${p.spec?.gocNhin || ""}<br>
      📡 Kết nối: ${p.spec?.ketNoi || ""}
    `;
  }

  if (p.category === "sd") {
    return `
      📦 Dung lượng: ${p.spec?.dungLuong || ""}<br>
      ⚡ Tốc độ: ${p.spec?.tocDo || ""}<br>
      💾 Loại: ${p.spec?.loai || ""}<br>
      🛡 Bảo hành: ${p.spec?.baoHanh || ""}
    `;
  }

  if (p.category === "combo") {
    return `
      🎁 ${p.spec?.moTaCombo || ""}
    `;
  }

  return "";
}

/* =========================
   🖥 RENDER PRODUCTS (ĐÃ BỎ SALE TIME)
========================= */
function render(list) {
  const box = document.getElementById("products");
  if (!box) return;

  const category = getPageCategory();

  const isIndex =
    !window.location.pathname.includes("the-nho") &&
    !window.location.pathname.includes("camera-trong-nha") &&
    !window.location.pathname.includes("camera-ngoai-troi") &&
    !window.location.pathname.includes("combo");

  if (!list) list = getProducts();

  if (isIndex) {
    list = list.filter(p => p.featured === true);
  }

  if (!isIndex && category) {
    list = list.filter(p => p.category === category);
  }

  box.innerHTML = "";

  if (list.length === 0) {
    box.innerHTML = "<p>Chưa có sản phẩm</p>";
    return;
  }

  list.forEach(p => {
    if (!p.id) return;

    const id = String(p.id);

    // ❌ KHÔNG CÒN SALE TIME - CHỈ HIỂN THỊ GIÁ GỐC
    const priceToShow = p.price;

    let percentText = "";

    if (p.oldPrice && p.oldPrice > p.price) {
      const percent = Math.round((1 - p.price / p.oldPrice) * 100);
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
            p.oldPrice && p.oldPrice > p.price
              ? `<span class="old-price">${Number(p.oldPrice).toLocaleString()}đ</span>`
              : ""
          }
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
   📱 MENU
========================= */
window.toggleMenu = function() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  if (!sidebar || !overlay) return;

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
};

/* =========================
   🔍 SEARCH
========================= */
const search = document.getElementById("search");

if (search) {
  search.addEventListener("input", e => {
    const key = e.target.value.toLowerCase();

    let data = getProducts();
    const category = getPageCategory();

    const isIndex =
      !window.location.pathname.includes("the-nho") &&
      !window.location.pathname.includes("camera-trong-nha") &&
      !window.location.pathname.includes("camera-ngoai-troi") &&
      !window.location.pathname.includes("combo");

    if (isIndex) {
      data = data.filter(p => p.featured === true);
    }

    if (!isIndex && category) {
      data = data.filter(p => p.category === category);
    }

    render(
      data.filter(p => p.name.toLowerCase().includes(key))
    );
  });
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  render();
});