import { addToCart } from "./cart.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { app } from "./auth.js";

const db = getFirestore(app);

let allProducts = [];

console.log("APP RUNNING");

/* =========================
   LOAD PRODUCTS
========================= */
async function loadProducts() {

  try {

    const querySnapshot = await getDocs(
      collection(db, "products")
    );

    allProducts = [];

    querySnapshot.forEach(doc => {

      allProducts.push({
        id: doc.id,
        ...doc.data()
      });

    });

    console.log("PRODUCTS:", allProducts);

    renderHome();

  } catch (err) {

    console.error(err);

  }

}

/* =========================
   RENDER PRODUCTS
========================= */
function renderHome() {

  const box =
    document.getElementById("products");

  if (!box) return;

  const productsToShow =
    allProducts.filter(
      p => p.featured === "home"
    );

  box.innerHTML = "";

  if (productsToShow.length === 0) {

    box.innerHTML = `
      <div class="empty">
        Chưa có sản phẩm
      </div>
    `;

    return;
  }

  productsToShow.forEach(p => {

    const id = String(p.id);

    let percentText = "";

    if (
      p.oldPrice &&
      p.oldPrice > p.price
    ) {

      const percent = Math.round(
        (
          1 -
          p.price / p.oldPrice
        ) * 100
      );

      percentText = `-${percent}%`;

    }

    box.innerHTML += `

    <div class="product-card">

      <div class="top-tag">
        Trả chậm 0%
      </div>

      <div class="img-wrap">

        <img
          src="${p.img}"
          alt="${p.name}"
          onclick="openZoom('${p.img}')"
          onerror="
            this.src=
            'https://dummyimage.com/400x400/cccccc/000000'
          "
        >

      </div>

      <div class="product-info">

        <h3 class="product-name">
          ${p.name}
        </h3>

        <div class="price-box">

          <span class="price">
            ${Number(p.price)
              .toLocaleString()}đ
          </span>

          ${
            p.oldPrice &&
            p.oldPrice > p.price

            ? `
              <span class="old-price">
                ${Number(p.oldPrice)
                  .toLocaleString()}đ
              </span>

              <span class="discount">
                ${percentText}
              </span>
            `

            : ""
          }

        </div>

        <div class="btn-group">

          <button
            class="spec-btn"
            onclick="toggleSpec('${id}')"
          >
            ⚙️ Thông số
          </button>

          <button
            class="buy-btn"
            onclick="addToCartById('${id}')"
          >
            🛒 Mua ngay
          </button>

        </div>

        <div
          class="spec-box"
          id="spec-${id}"
        >
          ${p.spec || "Chưa có thông số"}
        </div>

      </div>

    </div>

    `;

  });

}

/* =========================
   ADD TO CART
========================= */
window.addToCartById = function(id) {

  const product =
    allProducts.find(
      p => String(p.id) === String(id)
    );

  if (!product) return;

  addToCart(product);

};

/* =========================
   TOGGLE SPEC
========================= */
window.toggleSpec = function(id) {

  const box =
    document.getElementById(
      `spec-${id}`
    );

  if (!box) return;

  box.classList.toggle("active");

};

/* =========================
   MOBILE MENU
========================= */
window.toggleMenu = function() {

  const sidebar =
    document.getElementById("sidebar");

  const overlay =
    document.getElementById("overlay");

  if (!sidebar || !overlay) return;

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");

};

/* =========================
   INIT
========================= */
window.addEventListener(
  "DOMContentLoaded",
  loadProducts
);