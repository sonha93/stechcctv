/* =========================
   🔥 CAMERA NGOÀI TRỜI JS FIX FULL
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
  return "cam-out";
}

/* =========================
   FIX DATA
========================= */
function fixData(list){

  return list.map(p => ({

    ...p,

    price: Number(p.price) || 0,

    oldPrice: Number(p.oldPrice) || 0

  }));

}

/* =========================
   RENDER PRODUCTS
========================= */
function render(list){

  const box =
    document.getElementById("products");

  if(!box) return;

  if(!list){

    list = getProducts();

  }

  list = fixData(list);

  list = list.filter(
    p => p.category === "cam-out"
  );

  box.innerHTML = "";

  if(list.length === 0){

    box.innerHTML =
      "<p>Chưa có sản phẩm</p>";

    return;
  }

  list.forEach(p => {

    if(!p.id) return;

    const id =
      String(p.id);

    const price =
      Number(p.price) || 0;

    const oldPrice =
      Number(p.oldPrice) || 0;

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

        </div>

        <!-- DISCOUNT -->
        ${
          percent

          ? `

          <div class="discount-text">
            -${percent}%
          </div>

          `

          : ""
        }

        <!-- BUTTON SPEC -->
        <button
          class="spec-btn"
          onclick="goDetail('${id}')"
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

      </div>

    `;

  });

}

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
window.addToCart = function(id){

  const product =
    getProducts().find(
      p => String(p.id) === String(id)
    );

  if(!product) return;

  let cart =
    JSON.parse(
      localStorage.getItem("cart")
    ) || [];

  const exist =
    cart.find(
      i => String(i.id) === String(id)
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
   SEARCH
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
        getProducts().filter(
          p => p.category === "cam-out"
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
window.toggleMenu = function(){

  const sidebar =
    document.getElementById("sidebar");

  const overlay =
    document.getElementById("overlay");

  if(!sidebar || !overlay)
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
