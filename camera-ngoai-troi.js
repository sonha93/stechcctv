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

  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",

  authDomain: "stech-73b89.firebaseapp.com",

  projectId: "stech-73b89",

  storageBucket: "stech-73b89.firebasestorage.app",

  messagingSenderId: "873739162979",

  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

/* =========================
   CAMERA TRONG NHÀ
========================= */

let allProducts = [];

/* =========================
   GET PRODUCTS
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

        id:doc.id,
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
   FIX DATA
========================= */

function fixData(list){

  return list.map(p => ({

    ...p,

    price:Number(p.price) || 0,

    oldPrice:Number(p.oldPrice) || 0

  }));

}

/* =========================
   RENDER
========================= */

function render(list){

  const box =
    document.getElementById("products");

  if(!box) return;

  list = fixData(list);

  /* chỉ camera trong nhà */
  list = list.filter(
    p => p.category === "cam-ngoai"
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

        <div class="img-box">

          <img
            src="${p.img || ''}"
            alt="${p.name || ''}"
            onclick="goDetail('${id}')"
            style="cursor:pointer;"
          >

        </div>

        <h4>
          ${p.name || "Không tên"}
        </h4>

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

        ${
          percent

          ? `

          <div class="discount-text">
            -${percent}%
          </div>

          `

          : ""

        }

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
   DETAIL
========================= */

window.goDetail = function(id){

  window.location.href =
    `logo.html?id=${id}`;

};

/* =========================
   CART
========================= */

window.addToCart = function(id){

  const product =
    allProducts.find(
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
      allProducts.filter(
        p => p.category === "cam-ngoai"
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
  async () => {

    allProducts =
    await getProducts();

    render(allProducts);

  }
);
