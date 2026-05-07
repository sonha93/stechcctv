/* =========================
   🔥 GET DATA
========================= */
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

/* =========================
   🧠 NORMALIZE
========================= */
function normalizeProduct(p){
  return {
    ...p,
    price: Number(p.price) || 0,
    oldPrice: Number(p.oldPrice) || 0
  };
}

function normalizeList(list){
  return list.map(normalizeProduct);
}

/* =========================
   📌 PAGE CATEGORY
========================= */
function getPageCategory() {

  const page =
    window.location.pathname.toLowerCase();

  if(page.includes("the-nho"))
    return "sd";

  if(page.includes("camera-trong-nha"))
    return "cam-in";

  if(page.includes("camera-ngoai-troi"))
    return "cam-ngoai";

  if(page.includes("combo"))
    return "combo";

  return null;
}

/* =========================
   🔗 GO DETAIL
========================= */
window.goDetail = function(id){

  window.location.href =
    `logo.html?id=${id}`;

};

/* =========================
   🖥 RENDER PRODUCTS
========================= */
function render(list){

  const box =
    document.getElementById("products");

  if(!box) return;

  const category =
    getPageCategory();

  const isIndex =
    !window.location.pathname.includes("the-nho") &&
    !window.location.pathname.includes("camera-trong-nha") &&
    !window.location.pathname.includes("camera-ngoai-troi") &&
    !window.location.pathname.includes("combo");

  if(!list){
    list = normalizeList(getProducts());
  }

  /* ===== FEATURED ===== */

  if(isIndex){

    list = list.filter(
      p => p.featured === true
    );

  }

  /* ===== CATEGORY ===== */

  if(!isIndex && category){

    list = list.filter(
      p => p.category === category
    );

  }

  box.innerHTML = "";

  /* ===== EMPTY ===== */

  if(list.length === 0){

    box.innerHTML =
      "<p>Chưa có sản phẩm</p>";

    return;
  }

  /* ===== LOOP ===== */

  list.forEach(p => {

    const id = String(p.id);

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

          ${hasDiscount ? `

            <span class="old-price">
              ${oldPrice.toLocaleString()}đ
            </span>

          ` : ""}

          ${percent ? `

            <span class="discount-text">
              -${percent}%
            </span>

          ` : ""}

        </div>

        <!-- DETAIL -->
        <button
          class="spec-btn"
          onclick="goDetail('${id}')"
        >
          ⚙️ Xem chi tiết
        </button>

        <!-- CART -->
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
      item => String(item.id) === String(id)
    );

  if(exist){

    exist.qty += 1;

  }else{

    cart.push({

      id: product.id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      img: product.img,
      qty: 1

    });

  }

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  alert("Đã thêm vào giỏ 🛒");

};

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

      const category =
        getPageCategory();

      const isIndex =
        !window.location.pathname.includes("the-nho") &&
        !window.location.pathname.includes("camera-trong-nha") &&
        !window.location.pathname.includes("camera-ngoai-troi") &&
        !window.location.pathname.includes("combo");

      if(isIndex){

        data = data.filter(
          p => p.featured === true
        );

      }

      if(!isIndex && category){

        data = data.filter(
          p => p.category === category
        );

      }

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
   INIT
========================= */
document.addEventListener(
  "DOMContentLoaded",
  () => {
    render();
  }
);

/* =========================
   🧹 AUTO FIX DATA
========================= */
function fixOldData(){

  let list =
    JSON.parse(
      localStorage.getItem("products")
    ) || [];

  let changed = false;

  list = list.map(p => {

    let price =
      Number(p.price) || 0;

    let oldPrice =
      Number(p.oldPrice) || 0;

    /* XÓA SALE CŨ */

    if(
      p.salePrice ||
      p.saleStart ||
      p.saleEnd
    ){

      delete p.salePrice;
      delete p.saleStart;
      delete p.saleEnd;

      changed = true;

    }

    /* FIX ĐẢO GIÁ */

    if(
      oldPrice &&
      oldPrice < price
    ){

      [price, oldPrice] =
      [oldPrice, price];

      changed = true;

    }

    return {
      ...p,
      price,
      oldPrice
    };

  });

  if(changed){

    console.log(
      "🛠 Đã làm sạch data giá"
    );

    localStorage.setItem(
      "products",
      JSON.stringify(list)
    );

  }

}

fixOldData();

/* =========================
   🎞 AUTO SLIDER
========================= */
const slider =
  document.querySelector(
    ".product-slider"
  );

let isTouching = false;

if(slider){

  slider.addEventListener(
    "touchstart",
    ()=> isTouching = true
  );

  slider.addEventListener(
    "touchend",
    ()=> isTouching = false
  );

  setInterval(()=>{

    if(isTouching) return;

    slider.scrollLeft += 0.5;

    if(
      slider.scrollLeft >=
      slider.scrollWidth -
      slider.clientWidth
    ){

      slider.scrollLeft = 0;

    }

  },20);

}
