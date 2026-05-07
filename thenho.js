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
  return "sd";
}

/* =========================
   🧠 NORMALIZE
========================= */
function normalizeProduct(p){

  return {

    ...p,

    id: p.id || Date.now(),

    name: p.name || "",

    img: p.img || "",

    category: p.category || "",

    desc: p.desc || "",

    price: Number(p.price) || 0,

    oldPrice: Number(p.oldPrice) || 0,

    featured: p.featured || false,

    spec: {

      model: p.spec?.model || "",

      xuatXu: p.spec?.xuatXu || "",

      baoHanh: p.spec?.baoHanh || "",

      dungLuong: p.spec?.dungLuong || "",

      tocDo: p.spec?.tocDo || "",

      loai: p.spec?.loai || "",

      chatLieu: p.spec?.chatLieu || ""

    }

  };

}

function normalizeList(list){
  return list.map(normalizeProduct);
}

/* =========================
   ⚙️ SPEC HTML
========================= */
function renderSpec(p){

  return `

    <div class="spec-grid">

      ${
        p.spec?.model
        ? `
          <div class="spec-item">
            <span>Model</span>
            <b>${p.spec.model}</b>
          </div>
        `
        : ""
      }

      ${
        p.spec?.xuatXu
        ? `
          <div class="spec-item">
            <span>Xuất xứ</span>
            <b>${p.spec.xuatXu}</b>
          </div>
        `
        : ""
      }

      ${
        p.spec?.dungLuong
        ? `
          <div class="spec-item">
            <span>Dung lượng</span>
            <b>${p.spec.dungLuong}</b>
          </div>
        `
        : ""
      }

      ${
        p.spec?.tocDo
        ? `
          <div class="spec-item">
            <span>Tốc độ</span>
            <b>${p.spec.tocDo}</b>
          </div>
        `
        : ""
      }

      ${
        p.spec?.loai
        ? `
          <div class="spec-item">
            <span>Loại thẻ</span>
            <b>${p.spec.loai}</b>
          </div>
        `
        : ""
      }

      ${
        p.spec?.chatLieu
        ? `
          <div class="spec-item">
            <span>Chất liệu</span>
            <b>${p.spec.chatLieu}</b>
          </div>
        `
        : ""
      }

      ${
        p.spec?.baoHanh
        ? `
          <div class="spec-item">
            <span>Bảo hành</span>
            <b>${p.spec.baoHanh}</b>
          </div>
        `
        : ""
      }

    </div>

  `;

}

/* =========================
   🖥 RENDER PRODUCTS
========================= */
function render(list){

  const box =
    document.getElementById("products");

  if(!box) return;

  if(!list){

    list =
      normalizeList(getProducts());

  }

  list =
    list.filter(
      p => p.category === "sd"
    );

  box.innerHTML = "";

  if(list.length === 0){

    box.innerHTML =
      "<p>Chưa có sản phẩm</p>";

    return;
  }

  list.forEach(p => {

    const id =
      String(p.id);

    const price =
      Number(p.price);

    const oldPrice =
      Number(p.oldPrice);

    const hasDiscount =
      oldPrice > price;

    const percent =
      hasDiscount
      ? Math.round(
          (1 - price / oldPrice) * 100
        )
      : 0;

    box.innerHTML += `

      <div class="item">

        <!-- IMAGE -->
        <img
          src="${p.img}"
          onclick="goDetail('${id}')"
          style="cursor:pointer;"
        >

        <!-- NAME -->
        <h4>
          ${p.name}
        </h4>

        <!-- PRICE -->
        <div class="price-box">

          <span class="price">
            ${price.toLocaleString()}đ
          </span>

          ${
            hasDiscount
            ? `
              <span class="old-price">
                ${oldPrice.toLocaleString()}đ
              </span>
            `
            : ""
          }

          ${
            percent
            ? `
              <span class="discount-text">
                -${percent}%
              </span>
            `
            : ""
          }

        </div>

        <!-- BUTTON -->
        <button
          class="spec-btn"
          onclick="toggleSpec('${id}')"
        >
          ⚙️ Xem thông số
        </button>

        <!-- BUTTON -->
        <button
          class="spec-btn"
          onclick="toggleSpec('${id}')"
        >
          ⚙️ Xem thông số
        </button>

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
   ⚙️ TOGGLE SPEC
========================= */
window.toggleSpec = function(id){

  const el =
    document.getElementById(
      `spec-${id}`
    );

  if(!el) return;

  el.style.display =
    el.style.display === "block"
    ? "none"
    : "block";

};

/* =========================
   🔗 DETAIL
========================= */
window.goDetail = function(id){

  window.location.href =
    `logo.html?id=${id}`;

};

/* =========================
   🛒 ADD TO CART
========================= */
window.addToCart = function(id){

  const product =
    normalizeList(getProducts())
    .find(
      p => String(p.id) === String(id)
    );

  if(!product) return;

  let cart =
    JSON.parse(
      localStorage.getItem("cart")
    ) || [];

  const exist =
    cart.find(
      item =>
        String(item.id) === String(id)
    );

  if(exist){

    exist.qty += 1;

  }else{

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

if(search){

  search.addEventListener(
    "input",
    e => {

      const key =
        e.target.value.toLowerCase();

      let data =
        normalizeList(getProducts());

      data =
        data.filter(
          p => p.category === "sd"
        );

      render(

        data.filter(
          p =>
            p.name
            .toLowerCase()
            .includes(key)
        )

      );

    }
  );

}

/* =========================
   📱 MENU
========================= */
window.toggleMenu = function(){

  const sidebar =
    document.getElementById("sidebar");

  const overlay =
    document.getElementById("overlay");

  if(!sidebar || !overlay) return;

  sidebar.classList.toggle("active");

  overlay.classList.toggle("active");

};

/* =========================
   🧹 FIX DATA
========================= */
function fixOldData(){

  let list =
    JSON.parse(
      localStorage.getItem("products")
    ) || [];

  list = list.map(p => {

    return {

      ...p,

      price:
        Number(p.price) || 0,

      oldPrice:
        Number(p.oldPrice) || 0,

      spec: {

        model:
          p.spec?.model || "",

        xuatXu:
          p.spec?.xuatXu || "",

        baoHanh:
          p.spec?.baoHanh || "",

        dungLuong:
          p.spec?.dungLuong || "",

        tocDo:
          p.spec?.tocDo || "",

        loai:
          p.spec?.loai || "",

        chatLieu:
          p.spec?.chatLieu || ""

      }

    };

  });

  localStorage.setItem(
    "products",
    JSON.stringify(list)
  );

}

fixOldData();

/* =========================
   INIT
========================= */
document.addEventListener(
  "DOMContentLoaded",
  () => {
    render();
  }
);
