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
   GET PRODUCTS FROM FIRESTORE
========================= */
let allProducts = [];

async function fetchProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    let arr = [];
    querySnapshot.forEach(doc => {
      arr.push({
        id: doc.id,
        ...doc.data()
      });
    });
    allProducts = arr;

    // ⚡ Lưu vào localStorage để trang detail/logo đọc được
    localStorage.setItem("products", JSON.stringify(allProducts));

    return arr;
  } catch (err) {
    console.error(err);
    return [];
  }
}

/* =========================
   PAGE CATEGORY
========================= */
function getPageCategory() {
  const page = window.location.pathname.toLowerCase();
  if(page.includes("the-nho")) return "sd";
  if(page.includes("camera-trong-nha")) return "cam-in";
  if(page.includes("camera-ngoai-troi")) return "cam-ngoai";
  if(page.includes("combo")) return "combo";
  return null; // index.html
}

/* =========================
   GO DETAIL
========================= */
window.goDetail = function(id){
  window.location.href = `logo.html?id=${id}`;
}

/* =========================
   RENDER PRODUCTS
========================= */
function render(list) {
  const box = document.getElementById("products");
  if(!box) return;

  const category = getPageCategory();
  const isIndex = !window.location.pathname.includes("the-nho") &&
                  !window.location.pathname.includes("camera-trong-nha") &&
                  !window.location.pathname.includes("camera-ngoai-troi") &&
                  !window.location.pathname.includes("combo");

  if(!list) list = [...allProducts];

  // Trang chủ: chỉ show featured
  if(isIndex) list = list.filter(p => p.featured === true);
  if(!isIndex && category) list = list.filter(p => p.category === category);

  box.innerHTML = "";
  if(list.length === 0){
    box.innerHTML = "<p>Chưa có sản phẩm</p>";
    return;
  }

  list.forEach(p => {
    const id = String(p.id);
    const price = Number(p.price || 0);
    const oldPrice = Number(p.oldPrice || 0);
    const hasDiscount = oldPrice > price;
    const percent = hasDiscount ? Math.round((1 - price / oldPrice) * 100) : 0;

    box.innerHTML += `
      <div class="item">
        <img src="${p.img}" onclick="goDetail('${id}')" style="cursor:pointer;" onerror="this.src='https://via.placeholder.com/300'">
        <h4>${p.name}</h4>
        <div class="price-box">
          <span class="price">${price.toLocaleString()}đ</span>
          ${hasDiscount ? `<span class="old-price">${oldPrice.toLocaleString()}đ</span>` : ""}
          ${percent ? `<span class="discount-text">-${percent}%</span>` : ""}
        </div>
        <button class="spec-btn" onclick="goDetail('${id}')">⚙️ Xem chi tiết</button>
        <button class="cart-btn" onclick="addToCart('${id}')">🛒 Thêm vào giỏ</button>
      </div>
    `;
  });
}

/* =========================
   ADD TO CART
========================= */
window.addToCart = function(id){
  const product = allProducts.find(p => String(p.id) === String(id));
  if(!product) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const exist = cart.find(item => String(item.id) === String(id));

  if(exist){
    exist.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      img: product.img,
      qty: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Đã thêm vào giỏ 🛒");
  updateCartCount();
}

/* =========================
   UPDATE CART COUNT
========================= */
function updateCartCount(){
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  const cartEl = document.getElementById("cartCount");
  if(cartEl) cartEl.innerText = total;
}

/* =========================
   MENU
========================= */
window.toggleMenu = function(){
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if(!sidebar || !overlay) return;
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

/* =========================
   SEARCH
========================= */
const search = document.getElementById("search");
if(search){
  search.addEventListener("input", e => {
    const key = e.target.value.toLowerCase();
    let data = [...allProducts];
    const category = getPageCategory();
    const isIndex = !window.location.pathname.includes("the-nho") &&
                    !window.location.pathname.includes("camera-trong-nha") &&
                    !window.location.pathname.includes("camera-ngoai-troi") &&
                    !window.location.pathname.includes("combo");
    if(isIndex) data = data.filter(p => p.featured === true);
    if(!isIndex && category) data = data.filter(p => p.category === category);
    render(data.filter(p => p.name.toLowerCase().includes(key)));
  });
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  await fetchProducts(); // load từ Firestore
  render(); // render trang chủ hoặc category
  updateCartCount(); // update số lượng giỏ
});
