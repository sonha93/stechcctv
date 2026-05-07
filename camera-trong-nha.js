/* =========================
   🔥 CAMERA TRONG NHÀ JS FULL FIX
========================= */

/* =========================
   GET DATA
========================= */
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

/* =========================
   PAGE CATEGORY
========================= */
function getPageCategory() {
  return "cam-in";
}

/* =========================
   🎯 RENDER SPEC CAMERA
========================= */
function renderSpec(p) {

  return `

    ${p.doPhanGiai ? `
      <div class="spec-line">
        🖥 <b>Độ phân giải:</b><br>
        ${p.doPhanGiai}
      </div>
    ` : ""}

    ${p.gocNhin ? `
      <div class="spec-line">
        👀 <b>Góc nhìn:</b><br>
        ${p.gocNhin}
      </div>
    ` : ""}

    ${p.ketNoi ? `
      <div class="spec-line">
        🔌 <b>Kết nối:</b><br>
        ${p.ketNoi}
      </div>
    ` : ""}

    ${p.thietKe ? `
      <div class="spec-line">
        🎨 <b>Thiết kế:</b><br>
        ${p.thietKe}
      </div>
    ` : ""}

    ${p.chatLieu ? `
      <div class="spec-line">
        🧱 <b>Chất liệu:</b><br>
        ${p.chatLieu}
      </div>
    ` : ""}

    ${p.congSuat ? `
      <div class="spec-line">
        ⚡ <b>Công suất:</b><br>
        ${p.congSuat}
      </div>
    ` : ""}

    ${p.baoHanh ? `
      <div class="spec-line">
        🛡 <b>Bảo hành:</b><br>
        ${p.baoHanh}
      </div>
    ` : ""}

    ${p.xuatXu ? `
      <div class="spec-line">
        🌍 <b>Xuất xứ:</b><br>
        ${p.xuatXu}
      </div>
    ` : ""}

    ${p.model ? `
      <div class="spec-line">
        🏷 <b>Model:</b><br>
        ${p.model}
      </div>
    ` : ""}

    ${p.moTa ? `
      <div class="spec-line">
        📝 <b>Mô tả:</b><br>
        ${p.moTa}
      </div>
    ` : ""}

  `;
}

/* =========================
   🧠 FIX DATA
========================= */
function fixData(list){

  return list.map(p => ({

    ...p,

    price: Number(p.price) || 0,

    oldPrice: Number(p.oldPrice) || 0

  }));
}

/* =========================
   🖥 RENDER PRODUCTS
========================= */
function render(list) {

  const box =
    document.getElementById("products");

  if (!box) return;

  if (!list)
    list = getProducts();

  list = fixData(list);

  list = list.filter(
    p => p.category === "cam-in"
  );

  box.innerHTML = "";

  if (list.length === 0) {

    box.innerHTML =
      "<p>Chưa có sản phẩm</p>";

    return;
  }

  list.forEach(p => {

    if (!p.id) return;

    const id = String(p.id);

    const priceToShow =
      Number(p.price) || 0;

    let percentText = "";

    if (
      p.oldPrice &&
      p.oldPrice > priceToShow
    ) {

      const percent = Math.round(
        (1 - priceToShow / p.oldPrice) * 100
      );

      percentText = `-${percent}%`;
    }

    box.innerHTML += `

      <div class="item">

        <!-- IMAGE -->
        <div class="img-box">

          <img src="${p.img || ''}"
          alt="${p.name || ''}">

        </div>

        <!-- NAME -->
        <h4>
          ${p.name || 'Không tên'}
        </h4>

        <!-- PRICE -->
        <div class="price-box">

          <span class="price">
            ${priceToShow.toLocaleString()}đ
          </span>

          ${
            p.oldPrice &&
            p.oldPrice > priceToShow

            ? `

            <span class="old-price">
              ${Number(p.oldPrice).toLocaleString()}đ
            </span>

            `

            : ""
          }

        </div>

        <!-- DISCOUNT -->
        ${
          percentText

          ? `

          <div class="discount-text">
            ${percentText}
          </div>

          `

          : ""
        }

        <!-- BUTTON -->
        <button class="spec-btn"
          onclick="toggleSpec('${id}')">

          ⚙️ Xem thông số

        </button>

        <button class="cart-btn"
          onclick="addToCart('${id}')">

          🛒 Thêm vào giỏ

        </button>

        <!-- SPEC -->
        <div class="spec-box"
          id="spec-${id}"
          style="display:none;">

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

  const el =
    document.getElementById(`spec-${id}`);

  if (!el) return;

  if (
    el.style.display === "none" ||
    el.style.display === ""
  ) {

    el.style.display = "block";

  } else {

    el.style.display = "none";
  }
};

/* =========================
   🛒 ADD TO CART
========================= */
window.addToCart = function(id) {

  const product =
    getProducts().find(
      p => String(p.id) === String(id)
    );

  if (!product) return;

  let cart =
    JSON.parse(
      localStorage.getItem("cart")
    ) || [];

  const exist =
    cart.find(
      i => String(i.id) === String(id)
    );

  if (exist) {

    exist.qty += 1;

  } else {

    cart.push({
      ...product,
      qty:1
    });
  }

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  alert("Đã thêm vào giỏ 🛒");
};

/* =========================
   🔍 SEARCH
========================= */
const search =
  document.getElementById("search");

if (search) {

  search.addEventListener("input", e => {

    const key =
      e.target.value.toLowerCase();

    let data =
      getProducts().filter(
        p => p.category === "cam-in"
      );

    render(

      data.filter(
        p =>
          p.name &&
          p.name.toLowerCase().includes(key)
      )

    );
  });
}

/* =========================
   INIT
========================= */
document.addEventListener(
  "DOMContentLoaded",
  () => {
    render();
  }
);

/* =========================
   MENU
========================= */
window.toggleMenu = function () {

  const sidebar =
    document.getElementById("sidebar");

  const overlay =
    document.getElementById("overlay");

  if (!sidebar || !overlay)
    return;

  sidebar.classList.toggle("active");

  overlay.classList.toggle("active");
};
