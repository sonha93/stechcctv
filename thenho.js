/* =========================
   FIREBASE
========================= */

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey:"AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",

  authDomain:"stech-73b89.firebaseapp.com",

  projectId:"stech-73b89",

  storageBucket:"stech-73b89.firebasestorage.app",

  messagingSenderId:"873739162979",

  appId:"1:873739162979:web:978f1a4043f025b1cdaf56"

};

const app =
initializeApp(firebaseConfig);

const db =
getFirestore(app);

/* =========================
   ALL PRODUCTS
========================= */

let allProducts = [];

/* =========================
   GET PRODUCTS FIRESTORE
========================= */

async function getProducts(){

  try{

    const querySnapshot =
    await getDocs(
      collection(db,"products")
    );

    let arr = [];

    querySnapshot.forEach(doc => {

      arr.push({

        firestoreId:doc.id,

        ...doc.data()

      });

    });

    return arr;

  }

  catch(err){

    console.log(err);

    return [];

  }

}

/* =========================
   📌 PAGE CATEGORY
========================= */

function getPageCategory(){

  return "sd";

}

/* =========================
   🧠 NORMALIZE
========================= */

function normalizeProduct(p){

  return {

    ...p,

    id:p.id || Date.now(),

    name:p.name || "",

    img:p.img || "",

    category:p.category || "",

    desc:p.desc || "",

    featured:p.featured || false,

    price:Number(p.price) || 0,

    oldPrice:Number(p.oldPrice) || 0,

    spec:{

      model:
      p.spec?.model ||
      p.model ||
      "",

      xuatXu:
      p.spec?.xuatXu ||
      p.xuatXu ||
      "",

      baoHanh:
      p.spec?.baoHanh ||
      p.baoHanh ||
      "",

      dungLuong:
      p.spec?.dungLuong ||
      p.dungLuong ||
      "",

      tocDo:
      p.spec?.tocDo ||
      p.tocDo ||
      "",

      loai:
      p.spec?.loai ||
      p.loai ||
      "",

      chatLieu:
      p.spec?.chatLieu ||
      p.chatLieu ||
      ""

    }

  };

}

function normalizeList(list){

  return list.map(
    normalizeProduct
  );

}

/* =========================
   ⚙️ SPEC HTML
========================= */

function renderSpec(p){

  return `

    <div class="spec-grid">

      ${
        p.spec?.model
        ?
        `
        <div class="spec-item">
          <span>Model</span>
          <b>${p.spec.model}</b>
        </div>
        `
        : ""
      }

      ${
        p.spec?.xuatXu
        ?
        `
        <div class="spec-item">
          <span>Xuất xứ</span>
          <b>${p.spec.xuatXu}</b>
        </div>
        `
        : ""
      }

      ${
        p.spec?.dungLuong
        ?
        `
        <div class="spec-item">
          <span>Dung lượng</span>
          <b>${p.spec.dungLuong}</b>
        </div>
        `
        : ""
      }

      ${
        p.spec?.tocDo
        ?
        `
        <div class="spec-item">
          <span>Tốc độ</span>
          <b>${p.spec.tocDo}</b>
        </div>
        `
        : ""
      }

      ${
        p.spec?.loai
        ?
        `
        <div class="spec-item">
          <span>Loại thẻ</span>
          <b>${p.spec.loai}</b>
        </div>
        `
        : ""
      }

      ${
        p.spec?.chatLieu
        ?
        `
        <div class="spec-item">
          <span>Chất liệu</span>
          <b>${p.spec.chatLieu}</b>
        </div>
        `
        : ""
      }

      ${
        p.spec?.baoHanh
        ?
        `
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
  document.getElementById(
    "products"
  );

  if(!box) return;

  list =
  normalizeList(list);

  list =
  list.filter(
    p =>
    p.category === "sd"
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

        <img
          src="${p.img}"
          onclick="goDetail('${id}')"
          style="cursor:pointer;"
        >

        <h4>
          ${p.name}
        </h4>

        <div class="price-box">

          <span class="price">
            ${price.toLocaleString()}đ
          </span>

          ${
            hasDiscount
            ?
            `
            <span class="old-price">
              ${oldPrice.toLocaleString()}đ
            </span>
            `
            : ""
          }

          ${
            percent
            ?
            `
            <span class="discount-text">
              -${percent}%
            </span>
            `
            : ""
          }

        </div>

        <button
          class="spec-btn"
          onclick="goDetail('${id}')"
        >
          ⚙️ Xem thông số
        </button>

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
  normalizeList(allProducts)
  .find(
    p =>
    String(p.id) ===
    String(id)
  );

  if(!product) return;

  let cart =
  JSON.parse(
    localStorage.getItem("cart")
  ) || [];

  const exist =
  cart.find(
    item =>
    String(item.id) ===
    String(id)
  );

  if(exist){

    exist.qty += 1;

  }

  else{

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
document.getElementById(
  "search"
);

if(search){

  search.addEventListener(

    "input",

    e => {

      const key =
      e.target.value
      .toLowerCase();

      let data =
      normalizeList(
        allProducts
      );

      data =
      data.filter(
        p =>
        p.category === "sd"
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
  document.getElementById(
    "sidebar"
  );

  const overlay =
  document.getElementById(
    "overlay"
  );

  if(!sidebar || !overlay)
  return;

  sidebar.classList.toggle(
    "active"
  );

  overlay.classList.toggle(
    "active"
  );

};

/* =========================
   INIT
========================= */

document.addEventListener(

  "DOMContentLoaded",

  async () => {

    allProducts =
    await getProducts();

    render(allProducts);

  }

);
