/* =========================
   FIREBASE INIT
========================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

/* =========================
   GET PRODUCTS
========================= */
let allProducts = [];

async function fetchProducts(){
  try{
    const querySnapshot = await getDocs(collection(db, "products"));
    let arr = [];
    querySnapshot.forEach(doc => {
      arr.push({ id: doc.id, ...doc.data() });
    });
    allProducts = arr;

    localStorage.setItem("products", JSON.stringify(allProducts));
    return arr;
  } catch(err){
    console.error(err);
    return [];
  }
}

/* =========================
   RENDER PRODUCTS
========================= */
function render(list){
  const box = document.getElementById("products");
  if(!box) return;

  const category = getPageCategory();
  const isIndex = !window.location.pathname.includes("the-nho") &&
                  !window.location.pathname.includes("camera-trong-nha") &&
                  !window.location.pathname.includes("camera-ngoai-troi") &&
                  !window.location.pathname.includes("combo");

  if(!list) list = [...allProducts];
  if(isIndex) list = list.filter(p => p.featured);
  if(!isIndex && category) list = list.filter(p => p.category === category);

  box.innerHTML = "";
  if(list.length === 0){ box.innerHTML = "<p>Chưa có sản phẩm</p>"; return; }

  list.forEach(p => {
    const id = String(p.id);
    const price = Number(p.price || 0);
    const oldPrice = Number(p.oldPrice || 0);
    const hasDiscount = oldPrice > price;
    const percent = hasDiscount ? Math.round((1 - price/oldPrice) * 100) : 0;

    box.innerHTML += `
      <div class="item">
        ${percent ? `<div class="discount-badge">-${percent}%</div>` : ""}
        <img src="${p.img}" onclick="goDetail('${id}')" style="cursor:pointer;" onerror="this.src='https://via.placeholder.com/300'">
        <h4>${p.name}</h4>
        <div class="price-box">
          <span class="price">${price.toLocaleString()}đ</span>
          ${hasDiscount ? `<span class="old-price">${oldPrice.toLocaleString()}đ</span>` : ""}
        </div>
        <button class="spec-btn" onclick="goDetail('${id}')">⚙️ Xem chi tiết</button>
        <button class="cart-btn" onclick="addToCartProduct('${id}')">🛒 Thêm vào giỏ</button>
      </div>
    `;
  });
}

/* =========================
   ADD TO CART PRODUCT (gọi cart.js)
========================= */
function addToCartProduct(id){
  const product = allProducts.find(p => String(p.id) === String(id));
  if(!product) return;
  window.addToCart(product); // gọi global cart.js
  updateCartCount();
}
window.addToCartProduct = addToCartProduct;

/* =========================
   UPDATE CART COUNT
========================= */
function updateCartCount(){
  const cart = currentUserUID ? getCart(currentUserUID) : [];
  const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartEl = document.getElementById("cartCount");
  if(cartEl) cartEl.innerText = total;
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  await fetchProducts();
  render();
  updateCartCount();
});
