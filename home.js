// ==========================
// IMPORT
// ==========================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  addToCart
}
from "./cart.js";


// ==========================
// FIREBASE
// ==========================

const firebaseConfig = {

  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",

  authDomain: "stech-73b89.firebaseapp.com",

  projectId: "stech-73b89",

  storageBucket: "stech-73b89.appspot.com",

  messagingSenderId: "873739162979",

  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// ==========================
// DATA
// ==========================

let allProducts = [];


// ==========================
// LOAD PRODUCTS
// ==========================

async function getProducts() {

  try {

    const querySnapshot = await getDocs(
      collection(db, "products")
    );

    let arr = [];

    querySnapshot.forEach(doc => {

      arr.push({
        id: doc.id,
        ...doc.data()
      });

    });

    return arr;

  } catch (err) {

    console.error(err);

    return [];

  }

}


// ==========================
// RENDER
// ==========================

function render(list) {

  const box =
    document.getElementById("products");

  if (!box) return;

  box.innerHTML = "";

  // lọc featured home
  list = list.filter(
    p => p.featured === "home"
  );

  if (list.length === 0) {

    box.innerHTML =
      "<p>Chưa có sản phẩm</p>";

    console.log("NO PRODUCTS", list);

    return;
  }

  list.forEach(p => {

    const id = String(p.id);

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

        ${
          percent
          ? `
            <div class="discount-text">
              -${percent}%
            </div>
          `
          : ""
        }

        <img
          src="${p.img || ""}"
          onclick="goDetail('${id}')"
          onerror="this.src='https://dummyimage.com/300x300/cccccc/000000'"
        >

        <h4>
          ${p.name || ""}
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

        <button
          class="spec-btn"
          onclick="goDetail('${id}')"
        >
          ⚙️ Xem thông số
        </button>

        <button
          class="cart-btn"
          onclick="addToCartById('${id}')"
        >
          🛒 Mua ngay
        </button>

      </div>

    `;

  });

}


// ==========================
// DETAIL
// ==========================

window.goDetail = function(id) {

  window.location.href =
    `logo.html?id=${id}`;

};


// ==========================
// CART
// ==========================

window.addToCartById =
async function(id) {

  const user =
    auth.currentUser;

  if (!user) {

    alert("Vui lòng đăng nhập!");

    return;
  }

  const product =
    allProducts.find(
      p => String(p.id) === String(id)
    );

  if (!product) {

    console.error(
      "Không tìm thấy sản phẩm"
    );

    return;
  }

  await addToCart({

    id: product.id,

    name: product.name,

    price: product.price,

    img: product.img,

    qty: 1

  });

  alert("Đã thêm vào giỏ 🛒");

};


// ==========================
// SEARCH
// ==========================

const search =
document.getElementById("search");

if (search) {

  search.addEventListener(
    "input",
    e => {

      const key =
        e.target.value.toLowerCase();

      const filtered =
        allProducts.filter(p =>

          p.featured === "home" &&

          p.name &&
          p.name
            .toLowerCase()
            .includes(key)

        );

      render(filtered);

    }
  );

}


// ==========================
// INIT
// ==========================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    allProducts =
      await getProducts();

    console.log(
      "ALL PRODUCTS:",
      allProducts
    );

    render(allProducts);

  }
);
