import { addToCart } from "./cart.js";
let allProducts = [];
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { app } from "./auth.js";

const db = getFirestore(app);
console.log("APP JS RUNNING");

console.log("BEFORE RENDER");
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

    console.error("LOAD PRODUCT ERROR:", err);

  }

}
function renderHome() {

  const box = document.getElementById("products");
  if (!box) return;

  // Hiển thị tất cả sản phẩm có category "home"


 const productsToShow = allProducts.filter(
  p => p.featured === "home"
);
  box.innerHTML = "";

  if (!productsToShow || productsToShow.length === 0) {

    box.innerHTML =
      "<p>Chưa có sản phẩm nào</p>";

    console.log(
      "No products to show!",
      allProducts
    );

    return;
  }

  productsToShow.forEach(p => {

    const id = String(p.id);

    let percentText = "";

    if (p.oldPrice && p.oldPrice > p.price) {

      const percent = Math.round(
        (1 - p.price / p.oldPrice) * 100
      );

      percentText = `-${percent}%`;
    }

    const imgUrl = p.img;

    box.innerHTML += `
      <div class="item">

        <img 
          src="${imgUrl}" 
          onclick="openZoom('${imgUrl}')"
          onerror="this.src='https://dummyimage.com/300x300/cccccc/000000'"
        >

        <h4>${p.name}</h4>

        <div class="price-box">

          <span class="price">
            ${Number(p.price).toLocaleString()}đ
          </span>

          ${
            p.oldPrice && p.oldPrice > p.price
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

        <button
          class="spec-btn"
          onclick="toggleSpec('${id}')"
        >
          ⚙️ Xem thông số
        </button>

        <button
          class="cart-btn"
          onclick="addToCartById('${id}')"
        >
          🛒 Mua ngay
        </button>

        <div
          class="spec-box"
          id="spec-${id}"
          style="display:none;"
        >
        ${p.spec || ""}
        </div>

      </div>
    `;
  });
}

window.addToCartById = function(id) {

  const product = allProducts.find(
    p => String(p.id) === String(id)
  );

  if (!product) {

    console.error("Không tìm thấy sản phẩm");

    return;
  }

  addToCart(product);
};

window.addEventListener(
  "DOMContentLoaded",
  () => {
loadProducts();
  }
);
window.toggleMenu = function(){

  const sidebar =
  document.getElementById("sidebar");

  const overlay =
  document.getElementById("overlay");

  if(!sidebar || !overlay){
    console.log("Không tìm thấy sidebar");
    return;
  }

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");

};

document.addEventListener("DOMContentLoaded",()=>{

  const btn =
  document.getElementById("menuBtn");

  if(btn){

    btn.addEventListener("click",toggleMenu);

  }

});
