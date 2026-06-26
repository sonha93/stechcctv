/* =========================
   🔥 HOME PAGE JS
========================= */

/* =========================
   FIRESTORE INIT
========================= */

import { addToCart as saveToCart } from "./cart.js";
import { app } from "./auth.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(app);

/* =========================
   LOAD MORE CONFIG
========================= */

let showing = 0;
const PER_LOAD = 10;

/* =========================
   GET PRODUCTS FROM FIRESTORE
========================= */

let allProducts = [];

async function getProducts() {

  try {

    const querySnapshot =
      await getDocs(collection(db, "products"));

    let arr = [];

    querySnapshot.forEach(doc => {

      const data = doc.data();

      arr.push({

        id: doc.id,

        name:
          data.name || "Không tên",

        img:
          data.img ||
          "https://via.placeholder.com/300",

        price:
          Number(data.price) || 0,

        oldPrice:
          Number(data.oldPrice) || 0,

        featured:
          data.featured || false,

        category:
          data.category || "",

        spec:
          data.spec || {}

      });

    });

    return arr;

  } catch (err) {

    console.log(err);
    return [];

  }

}

/* =========================
   RENDER SPEC
========================= */

function renderSpec(p) {

  const s = p.spec || {};

  return `
    - Độ phân giải: ${s.doPhanGiai || "—"}<br>
    - Góc nhìn: ${s.gocNhin || "—"}<br>
    - Kết nối: ${s.ketNoi || "—"}<br>
    - Bảo hành: ${s.baoHanh || "—"}<br>
  `;

}

/* =========================
   RENDER HOME
========================= */

function renderHome() {

  const box =
    document.getElementById("products");

  if (!box) return;

const featured = allProducts.filter(
  p => p.category === "home" || p.featured === true
);
  /* CHỈ CLEAR LẦN ĐẦU */

  if(showing === 0){

    box.innerHTML = "";

  }

  if (featured.length === 0) {

    box.innerHTML =
      "<p>Chưa có sản phẩm nổi bật</p>";

    return;

  }

  /* LOAD 20 SẢN PHẨM */

  const nextProducts =
    featured.slice(
      showing,
      showing + PER_LOAD
    );

  nextProducts.forEach(p => {

    const id = String(p.id);

    let percentText = "";

    if (
      p.oldPrice &&
      p.oldPrice > p.price
    ) {

      const percent =
        Math.round(
          (1 - p.price / p.oldPrice) * 100
        );

      percentText = `-${percent}%`;

    }

    // Luôn sử dụng link public
    const imgUrl = p.img;

    box.innerHTML += `

      <div class="item">

        <img
          src="${imgUrl}"

          onclick="goDetail('${id}')"

          onerror="
            this.src=
            'https://via.placeholder.com/300'
          "

          style="cursor:pointer;"
        >

        <h4>${p.name}</h4>

        <div class="price-box">

          <span class="price">
            ${Number(p.price)
              .toLocaleString()}đ
          </span>

          ${
            p.oldPrice &&
            p.oldPrice > p.price

            ?

            `
            <span class="old-price">
              ${Number(p.oldPrice)
                .toLocaleString()}đ
            </span>
            `

            :

            ""
          }

          ${
            percentText
            ?
            `
            <span class="discount-text">
              ${percentText}
            </span>
            `
            :
            ""
          }

        </div>

        <button
          class="cart-btn"
          onclick="addToCart('${id}')"
        >

          🛒 Thêm vào giỏ

        </button>

      </div>

    `;

  });

  /* UPDATE */

  showing += nextProducts.length;

  /* BUTTON */

  const remain =
    featured.length - showing;

  const btn =
    document.getElementById("loadMoreBtn");

  if(btn){

    if(remain > 0){

      btn.style.display = "block";

      btn.innerHTML =
        `Xem thêm ${remain} sản phẩm`;

    }else{

      btn.style.display = "none";

    }

  }

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

window.addToCart = async function(id){

  const product = allProducts.find(
    p => String(p.id) === String(id)
  );

  if (!product) return;

  await saveToCart({

    id: product.id,
    name: product.name,
    price: product.price,
     oldPrice: product.oldPrice,
    img: product.img

  });

  alert("Đã thêm vào giỏ 🛒");

};

/* =========================
   INIT
========================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    allProducts = await getProducts();

    renderHome();

    initSearch(); // 👈 THÊM DÒNG NÀY

    const btn = document.getElementById("loadMoreBtn");

    if(btn){
      btn.onclick = () => {
        renderHome();
      };
    }

  }
);
/* =========================
   🔍 SEARCH PRODUCTS UI
========================= */

function formatPrice(n){
  return Number(n || 0).toLocaleString() + "đ";
}

function renderSearchResults(list){

  const box = document.getElementById("searchResults");
  if(!box) return;

  box.innerHTML = "";

  if(list.length === 0){
    box.innerHTML = `<div style="padding:10px;">Không tìm thấy sản phẩm</div>`;
    return;
  }

  list.forEach(p => {

    const div = document.createElement("div");
    div.className = "search-item";

    div.innerHTML = `
      <img src="${p.img}" onerror="this.src='https://via.placeholder.com/100'">

      <div class="search-info">

        <div class="search-name">${p.name}</div>

        <div class="search-price">
          ${formatPrice(p.price)}
        </div>

        ${
          p.oldPrice > p.price
          ? `<div class="search-oldprice">
              ${formatPrice(p.oldPrice)}
            </div>`
          : ""
        }

      </div>
    `;

    div.onclick = () => {
      window.location.href = `logo.html?id=${p.id}`;
    };

    box.appendChild(div);

  });
}

/* =========================
   SEARCH INPUT EVENT
========================= */

function initSearch(){

  const input = document.getElementById("searchInput");
  const box = document.getElementById("searchResults");

  if(!input || !box) return;

  input.addEventListener("input", (e) => {

    const key = e.target.value.trim().toLowerCase();

    if(!key){
      box.innerHTML = "";
      return;
    }

    const result = allProducts.filter(p =>
      p.name.toLowerCase().includes(key)
    );

    renderSearchResults(result);

  });

  /* click outside hide */
  document.addEventListener("click", (e) => {

    if(!e.target.closest(".search-box")){
      box.innerHTML = "";
    }

  });

}
window.alert = function(message){
    showToast(message);
};

if(!window.showToast){

window.showToast = function(message){

const toast = document.createElement("div");

toast.innerText = message;

toast.style.cssText = `
position:fixed;
left:50%;
bottom:30px;
transform:translateX(-50%);
background:#222;
color:#fff;
padding:12px 20px;
border-radius:8px;
font-size:14px;
z-index:999999;
`;

document.body.appendChild(toast);

setTimeout(()=>{
toast.remove();
},2500);

};

window.alert = window.showToast;

}
