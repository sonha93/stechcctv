/* =========================
   🔥 COMBO KHUYẾN MÃI JS FULL FIX
========================= */

/* =========================
   GET DATA
========================= */
function getProducts() {
  return JSON.parse(
    localStorage.getItem("products")
  ) || [];
}

/* =========================
   PAGE CATEGORY
========================= */
function getPageCategory() {
  return "combo";
}

/* =========================
   🎯 SPEC RENDER COMBO
========================= */
function renderSpec(p) {

  return `

    ${p.model ? `
      <div class="spec-line">
        🏷 <b>Model:</b><br>
        ${p.model}
      </div>
    ` : ""}

    ${p.xuatXu ? `
      <div class="spec-line">
        🌍 <b>Xuất xứ:</b><br>
        ${p.xuatXu}
      </div>
    ` : ""}

    ${p.baoHanh ? `
      <div class="spec-line">
        🛡 <b>Bảo hành:</b><br>
        ${p.baoHanh}
      </div>
    ` : ""}

    ${p.moTaCombo ? `
      <div class="spec-line">
        🎁 <b>Thông tin combo:</b><br>
        ${p.moTaCombo}
      </div>
    ` : ""}

    ${p.desc ? `
      <div class="spec-line">
        📝 <b>Mô tả:</b><br>
        ${p.desc}
      </div>
    ` : ""}

  `;

}

/* =========================
   FIX DATA
========================= */
function fixData(list){

  return list.map(p => ({

    ...p,

    price:
      Number(p.price) || 0,

    oldPrice:
      Number(p.oldPrice) || 0

  }));

}

/* =========================
   RENDER PRODUCTS
========================= */
function render(list) {

  const box =
    document.getElementById("products");

  if (!box) return;

  if (!list)
    list = getProducts();

  list = fixData(list);

  list = list.filter(
    p => p.category === "combo"
  );

  box.innerHTML = "";

  if (list.length === 0) {

    box.innerHTML =
      "<p>Chưa có sản phẩm</p>";

    return;
  }

  list.forEach(p => {

    if (!p.id) return;

    const id =
      String(p.id);

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

          <img
            src="${p.img || ''}"
            alt="${p.name || ''}"
            onclick="goDetail('${id}')"
            style="cursor:pointer;"
          >

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

          ${
            percentText

            ? `

            <span class="discount-text">
              ${percentText}
            </span>

            `

            : ""
          }

        </div>

        <!-- BUTTON SPEC -->
        <button
          class="spec-btn"
          onclick="toggleSpec('${id}')"
        >

          ⚙️ Xem thông số

        </button>

        <!-- BUTTON CART -->
        <button
          class="cart-btn"
          onclick="addToCart('${id}')"
        >

          🛒 Thêm vào giỏ

        </button>

        <!-- SPEC -->
        <div
          class="spec-box"
          id="spec-${id}"
          style="display:none;"
        >

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

  const el =
    document.getElementById(
      `spec-${id}`
    );

  if (!el) return;

  el.style.display =
    el.style.display === "block"
    ? "none"
    : "block";

};

/* =========================
   DETAIL PAGE
========================= */
window.goDetail = function(id){

  window.location.href =
    `logo.html?id=${id}`;

};

/* =========================
   ADD TO CART
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
      item =>
        String(item.id) === String(id)
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
   SEARCH
========================= */
const search =
  document.getElementById("search");

if (search) {

  search.addEventListener(
    "input",
    e => {

      const key =
        e.target.value.toLowerCase();

      let data =
        getProducts().filter(
          p => p.category === "combo"
        );

      render(

        data.filter(
          p =>
            p.name &&
            p.name
              .toLowerCase()
              .includes(key)
        )

      );

    }
  );

}

/* =========================
   MENU
========================= */
window.toggleMenu = function() {

  const sidebar =
    document.getElementById("sidebar");

  const overlay =
    document.getElementById("overlay");

  if (!sidebar || !overlay)
    return;

  sidebar.classList.toggle("active");

  overlay.classList.toggle("active");

};

/* =========================
   INIT
========================= */
document.addEventListener(
  "DOMContentLoaded",
  () => {
    render();
  }
);
